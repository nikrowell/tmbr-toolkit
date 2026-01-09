import { isUndefined } from './isUndefined.js';

/**
 * Calculates the distance between two points
 *
 * @param {number|Object} x1 - x coordinate or object with x and y properties
 * @param {number|Object} y1 - y coordinate or object with x and y properties
 * @param {number} x2 - x coordinate of the second point (when using coordinates)
 * @param {number} y2 - y coordinate of the second point (when using coordinates)
 * @returns {number} distance
 */
export function distance(x1, y1, x2, y2) {

  if (isUndefined(x2) && isUndefined(y2)) {
    x1 = x1.x;
    y1 = x1.y;
    x2 = y1.x;
    y2 = y1.y;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
};
