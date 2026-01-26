import { isArray } from './isArray.js';
import { only } from './only.js';

/**
 * Extracts a property value from each item in an array, or multiple properties using {@link only}
 *
 * @param {Object[]} array - array of objects to pluck from
 * @param {string|string[]} key - property name or array of keys (supports dot notation and colon renaming via {@link only})
 * @returns {Array} array of values when key is a string, or array of objects when key is an array
 *
 * @example
 * pluck(users, 'name')                // ['John', 'Jane']
 * pluck(users, ['name', 'email'])     // [{name: 'John', email: '...'}, {name: 'Jane', email: '...'}]
 * pluck(users, ['name', 'stats.age']) // [{name: 'John', age: 45}, {name: 'Jane', age: 32}]
 */
export function pluck(array, key) {
  return isArray(key) ? array.map(item => only(item, key)) : array.map(item => item[key]);
};
