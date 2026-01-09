import { isObject } from './isObject.js';

/**
 * Converts between JSON strings and objects
 *
 * @param {string|Object} value - string to parse or object to stringify
 * @param {Object} defaults - default values to merge (when parsing) or extend (when stringifying)
 * @returns {Object|string} parsed object or JSON string
 */
export function toJSON(value, defaults) {

  let result;

  if (isObject(value)) {
    result = {...value, ...(defaults ?? {})};
    return JSON.stringify(result);
  }

  try {
    result = Function(`"use strict"; return ${value.trim()}`)();
  } catch (e) {
    result = {};
  }

  return Object.assign(result || {}, defaults);
};
