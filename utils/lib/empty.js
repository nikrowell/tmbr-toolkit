/**
 * Removes all children from an element (can be significantly faster than `innerHTML`)
 *
 * @param {Element} el - element to empty
 * @returns {Element} the emptied element for chaining
 *
 * @example
 * const div = document.querySelector('.example');
 * empty(div).append(fragment);
 */
export function empty(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
};
