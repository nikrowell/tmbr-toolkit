import { findAll } from './findAll.js';
import { focusables } from './focusables.js';
import { isEmpty } from './isEmpty.js';
import { isFunction } from './isFunction.js';
import { noop } from './noop.js';
import { wrap } from './wrap.js';

/**
 * Traps focus within an element for keyboard navigation
 *
 * @param {Element} el - container element
 * @param {Function} callback - optional function to modify focusable elements (re-evaluated on each Tab press)
 * @returns {Function} cleanup function to restore previous focus
 */
export function trap(el, callback) {

  const previous = document.activeElement;
  const selector = focusables.join(',');

  let trapped = query();
  if (isEmpty(trapped)) return noop;

  trapped[0].focus();
  let index = 0;

  function query() {
    let elements = findAll(selector, el);
    if (isFunction(callback)) elements = callback(elements);
    return elements;
  }

  function keydown(event) {
    if (event.key !== 'Tab') return;
    event.preventDefault();

    trapped = query();
    if (isEmpty(trapped)) return;

    index = trapped.indexOf(document.activeElement);
    index = wrap(event.shiftKey ? index - 1 : index + 1, trapped);
    trapped[index].focus();
  }

  window.addEventListener('keydown', keydown);

  return () => {
    window.removeEventListener('keydown', keydown);
    previous?.focus();
  };
};
