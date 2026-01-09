import { isEmpty } from './isEmpty.js';
import { isString } from './isString.js';

/**
 * Adds event listeners with optional delegation support
 *
 * @param {string|string[]} events - event name(s), space-separated or array
 * @param {string|Element|Element[]} target - CSS selector (delegation) or element(s)
 * @param {Function} callback - event handler
 * @param {Element} scope - delegation scope (default: document)
 * @returns {Function} cleanup function to remove listeners
 *
 * @example
 * const off = on('click', '.button', handleClick);
 * const off = on('mouseenter mouseleave', el, handleHover);
 */
export function on(events, target, callback, scope = document) {

  const controller = new AbortController();
  const signal = controller.signal;

  if (isString(events)) {
    events = events.split(' ');
  }

  if (isString(target)) {

    const selector = target;

    function listener(event) {
      const match = event.bubbles
        ? event.target.closest?.(selector)
        : event.target.matches?.(selector);

      if (isEmpty(match)) {
        return;
      }
      if (event.bubbles && !event.target.matches(selector)) {
        Object.defineProperty(event, 'target', {enumerable: true, value: match});
      }

      callback(event);
    }

    events.forEach(e => {
      scope.addEventListener(e, listener, {signal, capture: true});
    });

  } else {

    const elements = [].concat(target);

    events.forEach(e => {
      elements.forEach(el => el.addEventListener(e, callback, {signal}));
    });
  }

  return () => controller.abort();
};
