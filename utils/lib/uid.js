/**
 * Generates a unique base-16 string ID
 *
 * @param {string} prefix - optional prefix
 * @param {string} suffix - optional suffix
 * @returns {string} unique identifier
 */
export function uid(prefix = '', suffix = '') {
  return prefix + now().toString(16) + suffix;
};

function now() {
  const time = Date.now();
  const last = now.last || time;
  return now.last = (time > last ? time : last + 1);
}
