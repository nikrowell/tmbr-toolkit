/**
 * Awaits a promise and returns [value, error] tuple for easier error handling
 *
 * @param {Promise} promise - promise to await
 * @param {Function} handler - optional custom result handler
 * @returns {Promise<Array>} [value, reason] tuple
 *
 * @example
 * const [data, err] = await settled(fetchUser(id));
 * if (err) handleError(err);
 */
export function settled(promise, handler) {
  handler ??= ({value, reason}) => [value, reason];
  return Promise.allSettled([promise]).then(([result]) => handler(result));
};
