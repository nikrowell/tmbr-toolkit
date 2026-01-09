/**
 * Clamps a value between two bounds
 *
 * @param {number} value - value to clamp
 * @param {number} min - minimum boundary (default: 0)
 * @param {number} max - maximum boundary (default: 1)
 * @returns {number} clamped value
 */
export function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
};
