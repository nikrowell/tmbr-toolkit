/**
 * Returns a promise that resolves after a delay
 *
 * @param {number} delay - time in milliseconds
 * @returns {Promise} promise that resolves after delay
 */
export function wait(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
};
