import { isObject } from './isObject.js';

/**
 * Gets or sets a value at a dot-notated path within a nested object
 *
 * @param {Object} object - target object
 * @param {string} path - dot-notated path (e.g., 'a.b.c')
 * @param {*} value - value to set (omit to get)
 * @returns {*} nested value when getting, or object when setting
 *
 * @example
 * dot(obj, 'user.name');        // get
 * dot(obj, 'user.name', 'Nik'); // set
 */
export function dot(object, path, value) {
  return arguments.length === 3 ? set(object, path, value) : get(object, path);
};

function get(object, path) {

  const keys = path.split('.');
  let target = object;

  for (const key of keys) {
    target = target?.[key];
  }

  return target;
}

function set(object, path, value) {

  const keys = path.split('.');
  const last = keys.pop();
  let target = object;

  for (const key of keys) {
    target = isObject(target[key]) ? target[key] : (target[key] = {});
  }

  target[last] = value;
  return object;
}
