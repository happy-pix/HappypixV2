// ─────────────────────────────────────────────────────────────────
//  Keyboard shortcut reference — opened with "?" or from the
//  reading menu.
// ─────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

export const SHORTCUTS = [
  { keys: ['⌘', 'K'], alt: 'Ctrl K', what: 'Search every page, screen, camera and printer' },
  { keys: ['/'], what: 'Search (when not typing in a field)' },
  { keys: ['←'], what: 'Previous step in a walkthrough' },
  { keys: ['→'], what: 'Next step in a walkthrough' },
  { keys: ['T'], what: 'Switch between light and dark' },
  { keys: ['?'], what: 'This list' },
  { keys: ['Esc'], what: 'Close search, this list, or the preferences menu' },
];

export default function ShortcutsDialog({ onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <section className="shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <button className="modal-close" onClick={onClose} aria-label="Close shortcuts">
          ×
        </button>
        <span className="eyebrow">HAPPYPIX DOCUMENTATION</span>
        <h2 id="shortcuts-title">Keyboard shortcuts</h2>

        <ul className="shortcut-list">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.what}>
              <span className="shortcut-keys">
                {shortcut.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
                {shortcut.alt && <em>or {shortcut.alt}</em>}
              </span>
              <span>{shortcut.what}</span>
            </li>
          ))}
        </ul>

        <p className="fine-print">Shortcuts stay out of the way while you are typing in a form field.</p>
      </section>
    </div>
  );
}
