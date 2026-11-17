// The contents rail reads section titles from the DOM. The setup guide
// rewrites three of its section titles when you change camera or
// printer, without changing the page id — and the rail used to keep
// showing whichever camera was selected first.
//
// These tests reproduce that directly: render the rail over a
// heading, change the heading, and assert the rail follows.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import OnThisPage from '../components/OnThisPage.jsx';

/** A stand-in for the article: a container with titled sections. */
function mountArticle(html) {
  const article = document.createElement('article');
  article.className = 'article-content';
  article.innerHTML = html;
  document.body.appendChild(article);
  return article;
}

/** Let the rAF-based refresh run. */
async function flushFrames() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('the contents rail', () => {
  it('reads the section titles from the article', async () => {
    mountArticle(`
      <section class="doc-section" id="setup-intro"><h2>Start with your case</h2></section>
      <section class="doc-section" id="setup-camera"><h2>Connect your Canon EOS R6 over Wi-Fi</h2></section>
    `);

    render(<OnThisPage pageId="make-it-run" onCopyLink={() => {}} copiedId={null} />);
    await flushFrames();

    const rail = screen.getByRole('navigation', { name: 'On this page' });
    expect(rail.textContent).toContain('Connect your Canon EOS R6 over Wi-Fi');
  });

  it('updates when the camera changes and the page id does not', async () => {
    const article = mountArticle(`
      <section class="doc-section" id="setup-camera"><h2>Connect your Canon EOS R6 over Wi-Fi</h2></section>
    `);

    render(<OnThisPage pageId="make-it-run" onCopyLink={() => {}} copiedId={null} />);
    await flushFrames();

    const rail = screen.getByRole('navigation', { name: 'On this page' });
    expect(rail.textContent).toContain('Canon EOS R6');

    // Same page, same section ids — only the heading text changes,
    // exactly as picking a different camera does.
    article.querySelector('h2').textContent = 'Connect your Nikon Z6 II by USB';
    await flushFrames();

    expect(rail.textContent).toContain('Connect your Nikon Z6 II by USB');
    expect(rail.textContent).not.toContain('Canon EOS R6');
  });

  it('follows a printer change the same way', async () => {
    const article = mountArticle(`
      <section class="doc-section" id="setup-printer"><h2>Connect your DNP DS620A</h2></section>
    `);

    render(<OnThisPage pageId="make-it-run" onCopyLink={() => {}} copiedId={null} />);
    await flushFrames();
    const rail = screen.getByRole('navigation', { name: 'On this page' });
    expect(rail.textContent).toContain('DNP DS620A');

    article.querySelector('h2').textContent = 'Connect your DNP QW410';
    await flushFrames();
    expect(rail.textContent).toContain('DNP QW410');
  });

  it('adds and removes sections, not just relabels them', async () => {
    const article = mountArticle(`
      <section class="doc-section" id="setup-camera"><h2>Connect your camera</h2></section>
    `);

    render(<OnThisPage pageId="make-it-run" onCopyLink={() => {}} copiedId={null} />);
    await flushFrames();
    const rail = screen.getByRole('navigation', { name: 'On this page' });
    expect(rail.querySelectorAll('li')).toHaveLength(1);

    // The "camera address" section only exists on Wi-Fi setups.
    article.insertAdjacentHTML(
      'beforeend',
      '<section class="doc-section" id="setup-address"><h2>The address your camera should have</h2></section>',
    );
    await flushFrames();

    expect(rail.querySelectorAll('li')).toHaveLength(2);
    expect(rail.textContent).toContain('The address your camera should have');
  });

  it('keeps its last label when a section is briefly empty', async () => {
    const article = mountArticle(`
      <section class="doc-section" id="setup-camera"><h2>Connect your Canon EOS R6 over Wi-Fi</h2></section>
    `);

    render(<OnThisPage pageId="make-it-run" onCopyLink={() => {}} copiedId={null} />);
    await flushFrames();

    // React swaps the heading out before the new one lands.
    article.querySelector('h2').remove();
    await flushFrames();

    const rail = screen.getByRole('navigation', { name: 'On this page' });
    expect(rail.textContent).not.toContain('setup-camera');
  });

  it('ignores sections that belong to something else', async () => {
    // The footer and the drawer also carry ids; they must not appear.
    const aside = document.createElement('div');
    aside.innerHTML = '<section class="doc-section" id="elsewhere"><h2>Not part of this page</h2></section>';
    document.body.appendChild(aside);
    mountArticle('<section class="doc-section" id="real"><h2>Real section</h2></section>');

    render(<OnThisPage pageId="make-it-run" onCopyLink={() => {}} copiedId={null} />);
    await flushFrames();

    const rail = screen.getByRole('navigation', { name: 'On this page' });
    expect(rail.textContent).toContain('Real section');
    expect(rail.textContent).not.toContain('Not part of this page');
  });
});
