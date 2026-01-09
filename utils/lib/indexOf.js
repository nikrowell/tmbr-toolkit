import { toArray } from './toArray.js';

/**
 * Gets the index of an element among its siblings
 *
 * @param {Element} el - element to find index of
 * @returns {number} index within parent's children
 */
export function indexOf(el) {
  return toArray(el.parentNode.children).indexOf(el);
};
