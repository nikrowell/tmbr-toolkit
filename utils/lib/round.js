/**
 * Rounds a value to the specified number of decimal places
 *
 * @param {number} n - number to round
 * @param {number} precision - decimal places (default: 2)
 * @returns {number} rounded value
 */
export function round(n, precision = 2) {
  const d = 10 ** precision;
  return Math.round(n * d) / d;
};
