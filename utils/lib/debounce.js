/**
 * Creates a debounced function that delays invocation until after wait ms have elapsed
 * since the last call
 *
 * @param {Function} fn - function to debounce
 * @param {number} wait - delay in milliseconds
 * @returns {Function} debounced function
 *
 * @example
 * const debouncedFn = debounce(onInput, 300);
 */
export function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};
