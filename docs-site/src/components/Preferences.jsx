// ─────────────────────────────────────────────────────────────────
//  Reading controls — theme, contrast, text size, download, print
//  and the keyboard-shortcut list.
//
//  Lives in the top bar as one popover so the chrome stays quiet.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CONTRASTS, TEXT_SIZES, getPrefs, setPref, subscribe } from '../lib/prefs.js';

export default function Preferences({ onDownload, onShowShortcuts }) {
  const prefs = useSyncExternalStore(subscribe, getPrefs, getPrefs);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="prefs" ref={ref}>
      <button
        className="prefs-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Reading preferences"
        title="Theme, contrast and text size"
      >
        <span aria-hidden="true">{prefs.theme === 'dark' ? '☾' : '☀'}</span>
        <span className="prefs-trigger-text">Reading</span>
      </button>

      {open && (
        <div className="prefs-panel" role="dialog" aria-label="Reading preferences">
          <div className="prefs-row">
            <span className="prefs-label">Theme</span>
            <div className="prefs-seg">
              {['light', 'dark'].map((theme) => (
                <button
                  key={theme}
                  className={prefs.theme === theme ? 'on' : ''}
                  onClick={() => (prefs.theme === theme ? null : setPref('theme', theme))}
                  aria-pressed={prefs.theme === theme}
                >
                  <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
          </div>

          <div className="prefs-row">
            <span className="prefs-label">Contrast</span>
            <div className="prefs-seg">
              {CONTRASTS.map((contrast) => (
                <button
                  key={contrast}
                  className={prefs.contrast === contrast ? 'on' : ''}
                  onClick={() => (prefs.contrast === contrast ? null : setPref('contrast', contrast))}
                  aria-pressed={prefs.contrast === contrast}
                >
                  {contrast === 'high' ? 'High' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          <div className="prefs-row">
            <span className="prefs-label">Text size</span>
            <div className="prefs-seg prefs-text" role="group" aria-label="Text size">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size.id}
                  className={`text-${size.id} ${prefs.text === size.id ? 'on' : ''}`}
                  onClick={() => setPref('text', size.id)}
                  aria-pressed={prefs.text === size.id}
                  title={size.title}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div className="prefs-divider" />

          <button
            className="prefs-action"
            onClick={() => {
              onDownload();
              setOpen(false);
            }}
          >
            <span aria-hidden="true">↓</span> Download this page
            <small>Markdown</small>
          </button>
          <button
            className="prefs-action"
            onClick={() => {
              window.print();
              setOpen(false);
            }}
          >
            <span aria-hidden="true">⎙</span> Print
            <small>Clean layout</small>
          </button>
          <button
            className="prefs-action"
            onClick={() => {
              onShowShortcuts();
              setOpen(false);
            }}
          >
            <span aria-hidden="true">⌘</span> Keyboard shortcuts
            <small>?</small>
          </button>

          <p className="prefs-note">Theme, contrast and text size are remembered on this device.</p>
        </div>
      )}
    </div>
  );
}
