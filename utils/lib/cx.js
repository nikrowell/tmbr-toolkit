import { isElement } from './isElement.js';
import { isObject } from './isObject.js';
import { isString } from './isString.js';
import { isArray } from './isArray.js';

/**
 * Conditionally toggles classes on an element or generates a string of classes,
 * similar to {@link https://www.npmjs.com/package/classnames classnames}
 *
 * @param {Element} el - optional element to modify
 * @param {...(string|Object|Array)} args - class names, objects, or arrays
 * @returns {string|DOMTokenList} class string, or classList if element passed with no args
 *
 * @example
 * cx('a', {'b': false, 'c': true}, [null && 'd', 'e']); // 'a c e'
 * cx(el, 'active', {'visible': isVisible});
 */
export function cx(...args) {

  const el = isElement(args[0]) ? args.shift() : null;

  if (el && args.length === 0) {
    return el.classList;
  }

  const tokenize = str => {
    return str.split(/\s+/).filter(Boolean).map(token => [token, true]);
  };

  const classes = args.reduce((result, item) => {
    if (isArray(item))  item = item.filter(Boolean).flatMap(tokenize);
    if (isObject(item)) item = Object.entries(item);
    if (isString(item)) item = tokenize(item);
    return item ? result.concat(item) : result;
  }, []);

  return el
    ? classes.forEach(([name, bool]) => el.classList[bool ? 'add' : 'remove'](name))
    : classes.filter (([name, bool]) => bool).map(([name]) => name).join(' ');
};
