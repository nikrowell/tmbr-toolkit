/**
 * Normalizes a value between two bounds
 *
 * @param {number} value - value to normalize
 * @param {number} min - minimum boundary
 * @param {number} max - maximum boundary
 * @returns {number} normalized value (0-1)
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
};
