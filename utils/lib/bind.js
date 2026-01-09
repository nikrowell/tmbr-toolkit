import { isFunction } from './isFunction.js';

/**
 * Binds methods to an instance, including class getters and setters (based on {@link https://www.npmjs.com/package/auto-bind auto-bind})
 *
 * @param {Object} self - target instance
 * @param {string|string[]} methods - specific method name(s) to bind, or omit for all
 * @returns {Object} self for chaining
 *
 * @example
 * class Example {
 *   constructor() { bind(this); }
 * }
 */
export function bind(self, methods) {

  if (methods) {
    [].concat(methods).forEach(fn => isFunction(self[fn]) && (self[fn] = self[fn].bind(self)));
    return self;
  }

  const properties = new Set();
  let object = self.constructor.prototype;

  do {

    for (const key of Reflect.ownKeys(object)) {
      if (key === 'constructor') continue;
      properties.add([object, key]);
    }

  } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

  for (const [object, key] of properties) {
    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor && isFunction(descriptor.value)) self[key] = self[key].bind(self);
  }

  return self;
};
