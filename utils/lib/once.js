import { on } from './on.js';

/**
 * Creates an event listener using [on](#on) that fires only once
 *
 * @param {string|string[]} type - event name(s)
 * @param {string|Element|Element[]} target - CSS selector or element(s)
 * @param {Function} callback - event handler
 * @param {Element} scope - delegation scope (default: document)
 * @returns {Function} cleanup function to remove listener
 */
export function once(type, target, callback, scope) {

  function listener(event) {
    off();
    callback(event);
  }

  const off = on(type, target, listener, scope);
  return off;
};
