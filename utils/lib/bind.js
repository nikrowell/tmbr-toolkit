import { isFunction } from './isFunction.js';

/**
 * Bind functions to a context or class instance
 * https://www.npmjs.com/package/auto-bind
 *
 * @param  {object}
 * @param  {array}
 * @return {void}
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