/**
 * querySelectorAll wrapper with optional parent context
 *
 * @param {string} selector - CSS selector
 * @param {Element} parent - parent element (default: document)
 * @returns {Element[]} array of matching elements
 */
export function findAll(selector, parent) {
  return Array.from((parent || document).querySelectorAll(selector));
};
