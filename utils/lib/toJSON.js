import { isObject } from './isObject.js';

/**
 * Converts a JSON string to an object or an object to a JSON string
 *
 * @param value    - string or object to convert
 * @param defaults - optional defaults if parsing a string
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
