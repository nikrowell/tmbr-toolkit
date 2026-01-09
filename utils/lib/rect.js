/**
 * Gets the size and position of an element relative to the viewport using {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect getBoundingClientRect}
 *
 * @param {Element} el - element to measure
 * @returns {DOMRect} bounding client rect
 */
export function rect(el) {
  return el.getBoundingClientRect();
};
