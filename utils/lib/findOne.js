/**
 * querySelector wrapper with optional parent context
 *
 * @param {string} selector - CSS selector
 * @param {Element} parent - parent element (default: document)
 * @returns {Element|null} matching element or null
 */
export function findOne(selector, parent) {
  return (parent || document).querySelector(selector);
};
