/**
 * Wraps an async function with error handling
 *
 * @param {Function} fn - async function to wrap
 * @param {Function} handler - error handler
 * @returns {Function} wrapped function that catches errors
 */
export function safe(fn, handler) {
  return () => fn().catch(handler);
};
