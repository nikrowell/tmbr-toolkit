/**
 * Tracks resize events on an element using ResizeObserver
 *
 * @param {Element} el - element to observe
 * @param {Function} fn - callback receiving ResizeObserverEntry
 * @returns {Function} cleanup function to stop observing
 */
export function ro(el, fn) {
  const observer = new ResizeObserver(entries => fn(entries[0]));
  observer.observe(el);
  return () => observer.disconnect();
};
