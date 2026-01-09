import { isNumber } from './isNumber.js';
import { isObject } from './isObject.js';

/**
 * Gets, sets, or deletes a cookie
 *
 * @param {string} name - cookie name
 * @param {string|null} value - value to set, or null to delete
 * @param {number|Date|Object} options - expiration days, Date, or cookie attributes
 * @returns {string|undefined} cookie value when getting
 *
 * @example
 * cookie('name', 'value');      // set
 * cookie('name');               // get
 * cookie('name', null);         // delete
 * cookie('name', 'value', 30);  // expires in 30 days
 */
export function cookie(name, value, options) {

  if (arguments.length === 1) {
    return document.cookie.split('; ').find(pair => pair.startsWith(`${name}=`))?.split('=')[1];
  }

  if (value === null) {
    document.cookie = `${name}=; path=/; max-age=0`;
    return;
  }

  let attrs = {[name]: value, path: '/'};

  if (options instanceof Date) {
    attrs.expires = options;
  } else if (isNumber(options)) {
    attrs.expires = new Date( + new Date + 1000 * 60 * 60 * 24 * options);
  } else if (isObject(options)) {
    attrs = Object.assign(attrs, options);
  }

  document.cookie = Object.keys(attrs).map(key => `${key}=${attrs[key]}`).join('; ')
};
