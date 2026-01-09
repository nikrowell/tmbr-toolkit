/**
 * Gets or sets a CSS custom property on an element
 *
 * @param {Element} el - element
 * @param {string} name - property name (e.g., '--color')
 * @param {string} value - value to set (omit to get)
 * @returns {string|undefined} property value when getting
 */
export function prop(el, name, value) {
  if (arguments.length < 3) {
    return el.style.getPropertyValue(name);
  } else {
    el.style.setProperty(name, value);
  }
};
