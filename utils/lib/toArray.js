/**
 * Converts a value to an array
 *
 * @param {*} value - value to convert (NodeList, HTMLCollection, or any value)
 * @returns {Array} array containing the value(s)
 */
export function toArray(value) {
  return (
    value instanceof NodeList ||
    value instanceof DOMTokenList ||
    value instanceof HTMLCollection
  ) ? Array.from(value) : [].concat(value);
};
