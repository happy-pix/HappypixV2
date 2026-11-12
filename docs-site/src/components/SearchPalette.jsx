// ─────────────────────────────────────────────────────────────────
//  The command palette — ⌘K / Ctrl+K, or /.
//
//  Searches every page, every walkthrough step, every FAQ answer and
//  every camera and printer model in one place. Private pages only
//  enter the index once the backend has authorised the visitor.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { searchIndex, snippet, highlight } from '../lib/search.js';

const KIND_LABEL = {
  page: 'Page',
  section: 'Section',
  step: 'Walkthrough step',
  faq: 'Frequent question',
  setup: 'Setup guide',
  camera: 'Camera',
  printer: 'Printer',
  member: 'Platform note',
};

export default function SearchPalette({ open, index, onNavigate, onClose }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => searchIndex(index, query, { limit: 14 }), [index, query]);

  useEffect(() => {
    if (open) {
      setCursor(0);
      // Wait a frame so the input exists before focusing it.
      const frame = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    setQuery('');
    return undefined;
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor((value) => Math.min(value + 1, Math.max(results.length - 1, 0)));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor((value) => Math.max(value - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const hit = results[cursor];
        if (hit) onNavigate(hit.pageId, hit.sectionId);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, results, cursor, onNavigate, onClose]);

  useEffect(() => {
    const active = listRef.current?.querySelector('.palette-item.on');
    active?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) return null;

  const grouped = results.reduce((acc, hit) => {
    const key = hit.pageId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(hit);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div
      className="palette-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search the documentation">
        <div className="palette-input">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cameras, screens, settings, anything…"
            aria-label="Search the documentation"
          />
          <kbd>esc</kbd>
        </div>

        <div className="palette-results" ref={listRef}>
          {query.trim().length === 0 && (
            <div className="palette-empty">
              <p>Try a camera model, a booth screen, or a question.</p>
              <div className="palette-suggestions">
                {['D5600', 'DS-RX1HS', 'kiosk mode', 'guest photos', 'Canon R50', 'coupons'].map((idea) => (
                  <button key={idea} onClick={() => setQuery(idea)}>
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length > 0 && results.length === 0 && (
            <div className="palette-empty">
              <p>Nothing matches “{query}”.</p>
              <small>
                If it is a camera or printer we do not list, write to us from the contact form — we would
                rather tell you now.
              </small>
            </div>
          )}

          {Object.entries(grouped).map(([pageId, hits]) => (
            <div className="palette-group" key={pageId}>
              <span className="palette-group-title">{hits[0]?.context || pageId}</span>
              {hits.map((hit) => {
                flatIndex += 1;
                const position = flatIndex;
                const active = position === cursor;
                return (
                  <button
                    key={`${hit.pageId}-${hit.sectionId || hit.title}-${position}`}
                    className={`palette-item ${active ? 'on' : ''}`}
                    onMouseEnter={() => setCursor(position)}
                    onClick={() => onNavigate(hit.pageId, hit.sectionId)}
                  >
                    <span className="palette-item-kind">{KIND_LABEL[hit.kind] || 'Result'}</span>
                    <span className="palette-item-title">
                      {highlight(hit.title, query).map((part, index) => (
                        <mark key={index}>{part.text}</mark>
                      ))}
                    </span>
                    <span className="palette-item-snippet">
                      {snippet(hit.haystack.replace(/^[^ ]+ /, ''), query)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span>{results.length > 0 && `${results.length} result${results.length === 1 ? '' : 's'}`}</span>
        </div>
      </div>
    </div>
  );
}
