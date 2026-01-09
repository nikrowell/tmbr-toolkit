import { isString } from './isString.js';
import { isObject } from './isObject.js';

/**
 * Validates data against a set of rules
 *
 * @param {Object} data - data to validate
 * @param {Object} rules - object of validator functions (return true or error string)
 * @returns {Object|null} errors object, or null if valid
 *
 * @example
 * const data = {
 *   email: 'hello@example.com',
 *   password: 'password',
 *   passwordConfirm: null
 * };
 *
 * const rules = {
 *   email(value) {
 *     return /.+\@.+\..+/.test(value) || 'Invalid email';
 *   },
 *   password(value) {
 *     if (!value) return 'Required';
 *     return value.length >= 8 || 'Must be at least 8 characters';
 *   },
 *   passwordConfirm(value, data) {
 *     return value === data.password || 'Must match your password';
 *   },
 * };
 *
 * const errors = validate(data, rules);
 */
export function validate(data, rules) {
  const errors = {};

  for (let key in rules) {
    const value = data[key];
    const error = rules[key](isString(value) ? value.trim() : value, data);

    if (isString(error)) {
      errors[key] = error;
    }
    if (isObject(error)) {
      Object.assign(errors, error);
    }
  }

  return Object.keys(errors).length ? errors : null;
};
