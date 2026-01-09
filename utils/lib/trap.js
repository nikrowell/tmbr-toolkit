import { findAll } from './findAll.js';
import { focusables } from './focusables.js';
import { isFunction } from './isFunction.js';
import { wrap } from './wrap.js';

/**
 * Traps focus within an element for keyboard navigation
 *
 * @param {Element} el - container element
 * @param {Function} callback - optional function to filter/modify focusable elements
 * @returns {Function} cleanup function to restore previous focus
 */
export function trap(el, callback) {

  const previous = document.activeElement;

  let elements = findAll(focusables.join(','), el);
  if (isFunction(callback)) elements = callback(elements);

  elements[0].focus();
  let index = 0;

  function keydown(event) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    index = wrap(event.shiftKey ? index - 1 : index + 1, elements);
    elements[index].focus();
  }

  window.addEventListener('keydown', keydown);

  return () => {
    window.removeEventListener('keydown', keydown);
    previous?.focus();
  };
};
