/**
 * {@link https://wesbos.com/javascript/12-advanced-flow-control/71-async-await-error-handling Async/Await Error Handling}
 *
 * @param fn      - try function
 * @param handler - catch function
 */
export function safe(fn, handler) {
  return () => fn().catch(handler);
};
