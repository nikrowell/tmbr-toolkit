/**
 * Creates a throttled function that only invokes once per wait period
 *
 * @param {Function} fn - function to throttle
 * @param {number} wait - minimum time between calls in milliseconds
 * @returns {Function} throttled function
 *
 * @example
 * const throttledFn = throttle(onScroll, 100);
 */
export function throttle(fn, wait) {
  let throttled;
  return function(...args) {
    if (throttled) return;
    fn.apply(this, args);
    throttled = true;
    setTimeout(() => throttled = false, wait);
  };
};
