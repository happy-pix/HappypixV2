// jsdom leaves a few browser APIs unimplemented; the guide uses all
// three for scrolling, so stub them once for every test.
import { vi } from 'vitest';

Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

// jsdom has IntersectionObserver only in very recent versions, and no
// MutationObserver timing of our own. Provide both so a component that
// observes the DOM can be tested deterministically.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}
