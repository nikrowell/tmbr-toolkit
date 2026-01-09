/**
 * Multi-purpose random function:
 * - no arguments: returns random float 0-1
 * - array: returns random element from the array
 * - min: returns random float in range 0-min
 * - min and max: returns random float in range min-max
 *
 * @param {number|Array} min - upper bound, or array to pick from
 * @param {number} max - upper bound when min is provided
 * @returns {number|*} random number or random array element
 */
export function random(min, max) {

  if (arguments.length === 0) {
    return Math.random();
  }

  if (Array.isArray(min)) {
    return min[ Math.floor(Math.random() * min.length) ];
  }

  if (min === undefined) min = 1;
  if (max === undefined) max = min || 1, min = 0;

  return min + Math.random() * (max - min);
};
