/**
 * Appends the ordinal suffix ('st', 'nd', 'rd', or 'th') to a given number
 *
 * @param {number} number - input number
 *
 * @return {string} string with input number and oridinal suffix
 */
export function ordinal(n) {
  const r = n % 100;
  return n + (suffix[(r - 20) % 10] ?? suffix[r] ?? suffix[0]);
};
