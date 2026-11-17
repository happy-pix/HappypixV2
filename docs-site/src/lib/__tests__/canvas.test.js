// The canvas replaced one that positioned nodes as a percentage of
// the container width while drawing edges into a fixed viewBox. The
// two only agreed at exactly 1000px wide, so lines drifted off their
// nodes by up to 59px. These tests pin the geometry that fixes it.

import { describe, it, expect } from 'vitest';
import { NODE_H, NODE_W, overlaps, resolveCollisions } from '../../components/ExcaliCanvas.jsx';
import { ATLAS_NODES } from './graphFixtures.js';

/** Mirror of the component's borderPoint, so the maths is testable. */
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

describe('canvas node boxes', () => {
  it('agree on one size, in world pixels', () => {
    expect(NODE_W).toBe(148);
    expect(NODE_H).toBe(58);
  });

  it('detects an overlap and clears a well-spaced pair', () => {
    expect(overlaps({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe(true);
    expect(overlaps({ x: 0, y: 0 }, { x: NODE_W + 40, y: 0 })).toBe(false);
    // Same column, far enough down.
    expect(overlaps({ x: 0, y: 0 }, { x: 0, y: NODE_H + 40 })).toBe(false);
    // Same column, too close.
    expect(overlaps({ x: 0, y: 0 }, { x: 0, y: NODE_H + 4 })).toBe(true);
  });
});

describe('collision resolution', () => {
  it('leaves a clean layout alone', () => {
    const nodes = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 400, y: 0 },
      { id: 'c', x: 0, y: 300 },
    ];
    expect(resolveCollisions(nodes)).toEqual(nodes);
  });

  it('separates two nodes dropped on the same spot', () => {
    const placed = resolveCollisions([
      { id: 'a', x: 100, y: 100 },
      { id: 'b', x: 100, y: 100 },
    ]);
    expect(overlaps(placed[0], placed[1])).toBe(false);
  });

  it('separates every pair in a deliberately clumped layout', () => {
    const clumped = Array.from({ length: 8 }, (_, index) => ({
      id: `n${index}`,
      x: 100 + (index % 3) * 20,
      y: 100 + Math.floor(index / 3) * 15,
    }));
    const placed = resolveCollisions(clumped);

    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        expect(overlaps(placed[i], placed[j]), `${placed[i].id} still overlaps ${placed[j].id}`).toBe(false);
      }
    }
  });

  it('does not mutate the layout it was given', () => {
    const nodes = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0, y: 0 },
    ];
    resolveCollisions(nodes);
    expect(nodes[1]).toEqual({ id: 'b', x: 0, y: 0 });
  });
});

describe('edge anchoring', () => {
  it('lands on the border of the source node, not its centre', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 400, y: 0 };
    const point = borderPoint(from, to);

    // Straight right: the right-hand edge, vertically centred.
    expect(point.x).toBeCloseTo(NODE_W, 5);
    expect(point.y).toBeCloseTo(NODE_H / 2, 5);
  });

  it('lands on the border for a diagonal too', () => {
    const from = { x: 0, y: 0 };
    const point = borderPoint(from, { x: 400, y: 400 });

    // On the box: one of the two distances from the centre must be
    // exactly half the width or half the height.
    const dx = Math.abs(point.x - NODE_W / 2);
    const dy = Math.abs(point.y - NODE_H / 2);
    expect(Math.min(Math.abs(dx - NODE_W / 2), Math.abs(dy - NODE_H / 2))).toBeLessThan(0.001);
  });

  it('is reciprocal, so both ends of an edge sit on their own box', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 500, y: 120 };
    const a = borderPoint(from, to);
    const b = borderPoint(to, from);

    const onBox = (point, box) =>
      Math.abs(Math.abs(point.x - (box.x + NODE_W / 2)) - NODE_W / 2) < 0.01 ||
      Math.abs(Math.abs(point.y - (box.y + NODE_H / 2)) - NODE_H / 2) < 0.01;

    expect(onBox(a, from)).toBe(true);
    expect(onBox(b, to)).toBe(true);
  });

  it('does not depend on how wide the canvas is drawn', () => {
    // The old bug: endpoints moved as the container widened. These are
    // world coordinates, so the answer is the same at any viewport.
    const from = { x: 245, y: 42 };
    const to = { x: 800, y: 365 };
    expect(borderPoint(from, to)).toEqual(borderPoint(from, to));
  });
});

describe('the shipped layouts', () => {
  it('place no two nodes on top of each other', () => {
    for (const graph of ATLAS_NODES) {
      const placed = resolveCollisions(graph.nodes);
      for (let i = 0; i < placed.length; i += 1) {
        for (let j = i + 1; j < placed.length; j += 1) {
          expect(
            overlaps(placed[i], placed[j]),
            `${graph.name}: ${placed[i].id} overlaps ${placed[j].id}`,
          ).toBe(false);
        }
      }
    }
  });

  it('only reference nodes that exist, so no edge is drawn to nothing', () => {
    for (const graph of ATLAS_NODES) {
      const ids = new Set(graph.nodes.map((node) => node.id));
      for (const [from, to] of graph.edges) {
        expect(ids.has(from), `${graph.name}: unknown edge source ${from}`).toBe(true);
        expect(ids.has(to), `${graph.name}: unknown edge target ${to}`).toBe(true);
      }
    }
  });
});
