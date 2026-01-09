import { isFunction } from './isFunction.js';

/**
 * Combines multiple functions into a single callback that calls all of them
 *
 * @param {...Function} fns - functions to combine
 * @returns {Function} combined function
 */
export function combine(...fns) {
  return (...args) => fns.forEach(fn => isFunction(fn) && fn(...args));
};
