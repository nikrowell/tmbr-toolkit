import { dot } from './dot.js';
import { isUndefined } from './isUndefined.js';

/**
 * Extracts specified keys from an object, with support for dot notation and renaming
 *
 * @param {Object} object - source object to extract from
 * @param {string|string[]} keys - key(s) to extract (supports dot notation and colon renaming)
 * @returns {Object} new object with only the specified keys
 *
 * @example
 * only(obj, 'name');                      // {name: 'John'}
 * only(obj, ['name', 'email']);           // {name: 'John', email: 'john@example.com'}
 * only(obj, 'stats.age');                 // {age: 45}
 * only(obj, 'stats.age:years');           // {years: 45}
 * only(obj, ['name', 'stats.age:years']); // {name: 'John', years: 45}
 */
export function only(object, keys) {

  keys = [].concat(keys);
  const result = {};

  for (let key of keys) {

    const [ path, rename ] = key.split(':');
    key = rename ?? (path.includes('.') ? path.slice(path.lastIndexOf('.') + 1) : path);

    const value = dot(object, path);
    isUndefined(value) || (result[key] = value);
  }

  return result;
};
