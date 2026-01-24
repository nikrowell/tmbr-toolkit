import { isFunction } from './isFunction.js';

/**
 * Checks if a value is an iterator (has a next method)
 */
export function isIterator(value) {
  return isFunction(value?.next);
};
