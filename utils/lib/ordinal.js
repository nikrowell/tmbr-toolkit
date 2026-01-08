/**
 * Appends ordinal suffix (st, nd, rd, th) to a number
 *
 * @param {number} n - input number
 * @returns {string} number with ordinal suffix (e.g., '1st', '2nd', '3rd')
 */
export function ordinal(n) {
  const r = n % 100;
  return n + (suffix[(r - 20) % 10] ?? suffix[r] ?? suffix[0]);
};

const suffix = ['th', 'st', 'nd', 'rd'];
