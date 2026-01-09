import { isFunction } from './isFunction.js';

/**
 * Creates a Web Worker from a function or string
 *
 * @param {Function|string} code - worker code as function or string
 * @returns {Worker} Web Worker instance
 */
export function worker(code) {
  if (isFunction(code)) {
    code = `(${code.toString()})()`;
  }
  return new Worker(
    URL.createObjectURL(new Blob([code]))
  );
};
