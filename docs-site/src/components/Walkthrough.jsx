// ─────────────────────────────────────────────────────────────────
//  The guided-tour shell shared by Booth 101 and CRM 101.
//
//  A rail of steps on the left, a working mock in the middle, and
//  the explanation beside it. Arrow keys work, autoplay works, and
//  the highlighted control on the mock advances the tour.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

export default function Walkthrough({ steps, renderScreen, label, initialStepId }) {
  const initial = Math.max(
    0,
    steps.findIndex((step) => step.id === initialStepId),
  );
  const [index, setIndex] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const railRef = useRef(null);

  const step = steps[index];
  const last = index === steps.length - 1;

  const go = (next) => {
    const clamped = Math.min(Math.max(next, 0), steps.length - 1);
    setIndex(clamped);
    if (clamped === steps.length - 1) setPlaying(false);
  };

  // Handed to the mock so its own chrome can drive the tour — a
  // clickable CRM sidebar jumps to the step that page belongs to,
  // exactly as clicking the sidebar would in the real workspace.
  const jump = {
    to: (id) => {
      const target = steps.findIndex((item) => item.id === id);
      if (target >= 0) go(target);
    },
    nav: (label) => {
      const target = steps.findIndex((item) => item.nav === label);
      if (target >= 0) go(target);
    },
    steps,
  };

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      // The palette and the sign-in dialog own the keyboard while they
      // are open. The palette listens in the capture phase and calls
      // preventDefault, so defaultPrevented means "someone else has it".
      if (event.defaultPrevented) return;
      if (document.querySelector('.palette-backdrop, .modal-backdrop')) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(index - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => go(index + 1), 5200);
    return () => clearTimeout(timer);
  }, [playing, index]);

  useEffect(() => {
    const active = railRef.current?.querySelector('.rail-step.on');
    active?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  return (
    <div className="walkthrough">
      <ol className="walk-rail" ref={railRef}>
        {steps.map((item, itemIndex) => (
          <li key={item.id}>
            <button
              className={`rail-step ${itemIndex === index ? 'on' : ''} ${itemIndex < index ? 'done' : ''}`}
              onClick={() => go(itemIndex)}
              aria-current={itemIndex === index ? 'step' : undefined}
            >
              <span className="rail-num">{String(itemIndex + 1).padStart(2, '0')}</span>
              <span className="rail-text">
                <b>{item.title}</b>
                {item.who && <small>{item.who === 'operator' ? 'Operator' : 'Guest'}</small>}
                {item.nav && <small>{item.nav}</small>}
              </span>
            </button>
          </li>
        ))}
      </ol>

      

      <div className="walk-stage">
        <div className="walk-screen">{renderScreen(step, () => go(index + 1), jump)}</div>

<div className="walk-controls">
            <button className="walk-btn" onClick={() => go(index - 1)} disabled={index === 0}>
              ← Back
            </button>
            <span className="walk-progress" aria-hidden="true">
              {steps.map((item, itemIndex) => (
                <i key={item.id} className={itemIndex <= index ? 'on' : ''} />
              ))}
            </span>
            <button className="walk-btn primary" onClick={() => go(index + 1)} disabled={last}>
              {last ? 'End of the tour' : 'Next →'}
            </button>
            <button className="walk-btn quiet" onClick={() => setPlaying((value) => !value)}>
              {playing ? 'Pause' : 'Auto-play'}
            </button>
          </div>
          <p className="walk-hint">
            Use ← and → on your keyboard, or tap the highlighted control on the screen.
          </p>
          
        <div className="walk-notes">
          
          <div className="walk-notes-head">
            <span className="eyebrow">
              {label} · Step {index + 1} of {steps.length}
            </span>
            <h3 id={`walk-title-${step.id}`}>{step.title}</h3>
            {step.screen && <span className="walk-screen-name">{step.screen}</span>}
          </div>

          <dl className="walk-facts">
            <div>
              <dt>What this is for</dt>
              <dd>{step.what}</dd>
            </div>
            {step.guests && (
              <div>
                <dt>What guests see</dt>
                <dd>{step.guests}</dd>
              </div>
            )}
            <div>
              <dt>What you control</dt>
              <dd>{step.you}</dd>
            </div>
          </dl>

          {step.tip && (
            <div className="walk-tip">
              <span aria-hidden="true">✳</span>
              <p>{step.tip}</p>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}
