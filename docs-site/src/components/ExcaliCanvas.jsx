// ─────────────────────────────────────────────────────────────────
//  The interactive canvas — pan, zoom and drag, like Excalidraw.
//
//  The previous canvas positioned nodes as a percentage of the
//  container's width but drew edges into a fixed 1000×500 viewBox
//  with a hardcoded +74px offset. Those two coordinate systems only
//  agreed when the canvas happened to be exactly 1000px wide, so the
//  connection lines drifted off the nodes by up to 59px as the window
//  widened.
//
//  Here everything lives in one world of NODE_W × NODE_H pixels:
//  nodes are absolutely positioned in world units and the edge layer
//  is an SVG with a 1:1 viewBox over the same world. One transform
//  scales both, so a line can no longer miss the node it belongs to.
// ─────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const NODE_W = 148;
export const NODE_H = 58;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.5;

/** Clamp a value into a range. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Where a line from the centre of `from` towards `to` crosses the
 * border of `from`. Anchoring edges to the border rather than the
 * centre is what stops lines disappearing under a node.
 */
function borderPoint(from, to) {
  const cx = from.x + NODE_W / 2;
  const cy = from.y + NODE_H / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const scaleX = dx === 0 ? Infinity : NODE_W / 2 / Math.abs(dx);
  const scaleY = dy === 0 ? Infinity : NODE_H / 2 / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

/** Do two node boxes overlap, with a gap enforced between them? */
export function overlaps(a, b, gap = 12) {
  return Math.abs(a.x - b.x) < NODE_W + gap && Math.abs(a.y - b.y) < NODE_H + gap;
}

/**
 * Push apart any nodes the source data placed on top of each other.
 * The shipped layouts are already clean; this keeps them clean when a
 * node is added without thinking about the ones beside it.
 *
 * Displacement is accumulated across every pair and applied once per
 * pass. Moving each node the moment a pair is examined looks simpler
 * but does not converge: with several nodes clumped together, an early
 * push gets undone by a later one and the layout never settles.
 */
export function resolveCollisions(nodes, gap = 12, passes = 300) {
  const placed = nodes.map((node, index) => ({
    ...node,
    // A deterministic nudge so two nodes on the exact same spot have a
    // direction to separate in rather than cancelling each other out.
    x: node.x + (index % 3) * 0.01,
    y: node.y + Math.floor(index / 3) * 0.01,
  }));

  for (let pass = 0; pass < passes; pass += 1) {
    const shift = placed.map(() => ({ x: 0, y: 0 }));
    let worst = 0;

    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        if (!overlaps(a, b, gap)) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        // Separate along whichever axis needs the shorter push.
        const pushX = NODE_W + gap - Math.abs(dx);
        const pushY = NODE_H + gap - Math.abs(dy);

        let vx = 0;
        let vy = 0;
        if (pushX <= pushY) vx = (pushX / 2) * (dx >= 0 ? 1 : -1);
        else vy = (pushY / 2) * (dy >= 0 ? 1 : -1);

        shift[i].x -= vx;
        shift[i].y -= vy;
        shift[j].x += vx;
        shift[j].y += vy;
        worst = Math.max(worst, Math.abs(vx), Math.abs(vy));
      }
    }

    if (worst === 0) break;
    for (let i = 0; i < placed.length; i += 1) {
      placed[i].x += shift[i].x;
      placed[i].y += shift[i].y;
    }
  }

  // Round away the sub-pixel nudge so the output is stable.
  return placed.map((node) => ({ ...node, x: Math.round(node.x), y: Math.round(node.y) }));
}

export default function ExcaliCanvas({ nodes = [], edges = [], selected, onSelect, label }) {
  const start = useMemo(() => resolveCollisions(nodes), [nodes]);
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(start.map((node) => [node.id, { x: node.x, y: node.y }])),
  );
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [drag, setDrag] = useState(null);
  const viewportRef = useRef(null);

  /**
   * Scale the whole graph into the viewport. A 25-node diagram is
   * ~1150 world px wide, so at scale 1 it starts partly off-screen and
   * the reader's first act is to hunt for the missing models. Fit on
   * first paint, and leave the buttons for everything after.
   */
  const fit = useCallback(() => {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box || !box.width || !box.height) return;
    const spaceX = (box.width - 32) / worldRef.current.width;
    const spaceY = (box.height - 32) / worldRef.current.height;
    const k = clamp(Math.min(spaceX, spaceY, 1), MIN_ZOOM, MAX_ZOOM);
    setView({
      k,
      x: (box.width - worldRef.current.width * k) / 2,
      y: (box.height - worldRef.current.height * k) / 2,
    });
  }, []);

  // A different page means a different graph.
  useEffect(() => {
    setPositions(Object.fromEntries(start.map((node) => [node.id, { x: node.x, y: node.y }])));
  }, [start]);

  const world = useMemo(() => {
    const boxes = Object.values(positions);
    if (!boxes.length) return { width: 1000, height: 500 };
    const maxX = Math.max(...boxes.map((box) => box.x)) + NODE_W;
    const maxY = Math.max(...boxes.map((box) => box.y)) + NODE_H;
    return { width: Math.max(1000, maxX + 60), height: Math.max(500, maxY + 60) };
  }, [positions]);

  const worldRef = useRef(world);
  worldRef.current = world;

  // Fit once the graph has laid out and the viewport has a size.
  useEffect(() => {
    const handle = requestAnimationFrame(() => fit());
    return () => cancelAnimationFrame(handle);
  }, [fit, start]);

  const at = useCallback((id) => positions[id] || { x: 0, y: 0 }, [positions]);

  // ── pan ────────────────────────────────────────────────────────
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ mode: 'pan', startX: event.clientX, startY: event.clientY, origin: view });
  };

  // ── drag a node ────────────────────────────────────────────────
  const onNodePointerDown = (event, id) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ mode: 'node', id, startX: event.clientX, startY: event.clientY, origin: at(id) });
  };

  const onPointerMove = (event) => {
    if (!drag) return;
    const dx = (event.clientX - drag.startX) / drag.origin.k || event.clientX - drag.startX;
    const dy = (event.clientY - drag.startY) / drag.origin.k || event.clientY - drag.startY;
    if (drag.mode === 'pan') {
      setView({
        ...drag.origin,
        x: drag.origin.x + (event.clientX - drag.startX),
        y: drag.origin.y + (event.clientY - drag.startY),
      });
    } else {
      setPositions((current) => ({
        ...current,
        [drag.id]: { x: drag.origin.x + dx, y: drag.origin.y + dy },
      }));
    }
  };

  const endDrag = () => setDrag(null);

  // ── zoom, towards the cursor ───────────────────────────────────
  const zoomBy = (factor, clientX, clientY) => {
    const box = viewportRef.current?.getBoundingClientRect();
    const px = clientX !== undefined && box ? clientX - box.left : (box?.width || 0) / 2;
    const py = clientY !== undefined && box ? clientY - box.top : (box?.height || 0) / 2;

    setView((current) => {
      const k = clamp(current.k * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = k / current.k;
      return { k, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio };
    });
  };

  const onWheel = (event) => {
    // A trackpad pinch arrives as ctrl+wheel; plain wheel zooms too,
    // because that is what a canvas is expected to do.
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX, event.clientY);
  };

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  });

  const onKeyDown = (event) => {
    const step = 48;
    if (event.key === '+' || event.key === '=') zoomBy(1.2);
    else if (event.key === '-' || event.key === '_') zoomBy(1 / 1.2);
    else if (event.key === '0') fit();
    else if (event.key === 'ArrowLeft') setView((v) => ({ ...v, x: v.x + step }));
    else if (event.key === 'ArrowRight') setView((v) => ({ ...v, x: v.x - step }));
    else if (event.key === 'ArrowUp') setView((v) => ({ ...v, y: v.y + step }));
    else if (event.key === 'ArrowDown') setView((v) => ({ ...v, y: v.y - step }));
    else return;
    event.preventDefault();
  };

  return (
    <div className="excali">
      <div className="excali-toolbar">
        <button type="button" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">
          −
        </button>
        <span className="excali-zoom">{Math.round(view.k * 100)}%</span>
        <button type="button" onClick={() => zoomBy(1.2)} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => setView({ x: 0, y: 0, k: 1 })}>
          Reset view
        </button>
        <span className="excali-hint">Drag to pan · drag a box to move it · scroll to zoom</span>
      </div>

      <div
        className={`excali-viewport ${drag ? 'is-dragging' : ''}`}
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        role="application"
        aria-label={label || 'Interactive diagram'}
        tabIndex={0}
      >
        <div
          className="excali-world"
          style={{
            width: world.width,
            height: world.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
          }}
        >
          {/* Edges and nodes read the same positions object, so a line
              always lands on the box it was drawn from. */}
          <svg
            className="excali-edges"
            width={world.width}
            height={world.height}
            viewBox={`0 0 ${world.width} ${world.height}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="excali-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="excali-arrow-head" />
              </marker>
            </defs>
            {edges.map(([fromId, toId, text], index) => {
              const from = positions[fromId];
              const to = positions[toId];
              if (!from || !to) return null;
              const a = borderPoint(from, to);
              const b = borderPoint(to, from);
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              // A shallow arc reads as a drawn line rather than a ruler.
              const bend = Math.min(28, Math.hypot(b.x - a.x, b.y - a.y) * 0.08);
              const active = selected === fromId || selected === toId;
              return (
                <g key={`${fromId}-${toId}-${index}`} className={active ? 'is-active' : ''}>
                  <path
                    d={`M ${a.x} ${a.y} Q ${midX} ${midY - bend} ${b.x} ${b.y}`}
                    className="excali-edge"
                    markerEnd="url(#excali-arrow)"
                  />
                  {text && (
                    <text x={midX} y={midY - bend - 6} className="excali-edge-label" textAnchor="middle">
                      {text}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {start.map((node) => {
            const box = at(node.id);
            return (
              <button
                type="button"
                key={node.id}
                className={`excali-node ${node.type} ${selected === node.id ? 'is-selected' : ''}`}
                style={{ left: box.x, top: box.y, width: NODE_W, minHeight: NODE_H }}
                onPointerDown={(event) => onNodePointerDown(event, node.id)}
                onClick={() => onSelect?.(node.id)}
                aria-pressed={selected === node.id}
              >
                <span aria-hidden="true">{node.icon || '◈'}</span>
                <b>{node.label}</b>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
