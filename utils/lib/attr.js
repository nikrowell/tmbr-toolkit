import { isBoolean } from './isBoolean.js';

/**
 * Gets, sets or removes an attribute from an element
 *
 * @param {Element} el - element
 * @param {string} name - attribute name
 * @param {string|boolean} value - attribute value (falsy to remove)
 * @returns {string|undefined} attribute value when getting
 */
export function attr(el, name, value) {
  if (arguments.length < 3) {
    return el.getAttribute(name);
  } else if (value) {
    el.setAttribute(name, isBoolean(value) ? '' : value);
  } else {
    el.removeAttribute(name);
  }
};
