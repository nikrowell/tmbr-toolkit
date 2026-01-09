/**
 * Calculates the average from an array of numbers
 *
 * @param {number[]} values - array of numbers
 * @returns {number} average value
 */
export function average(values) {
  return values.reduce((result, value) => result + value, 0) / values.length;
};
