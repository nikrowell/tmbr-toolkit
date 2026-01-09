import { isFunction } from './isFunction.js';

/**
 * Creates an array of specified length filled with values
 *
 * @param {number} n - array length
 * @param {*|Function} value - fill value, or function receiving index
 * @returns {Array} filled array
 */
export function fill(n, value) {
	const fn = isFunction(value) ? (undef, i) => value(i) : () => value;
	return [...Array(n)].map(fn);
};
