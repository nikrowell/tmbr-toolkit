/**
 * Creates a reactive proxy with subscribe method for state changes
 *
 * @param {Object} initial - initial state object
 * @param {Function} callback - optional subscriber called on changes
 * @returns {Proxy} proxied object with subscribe method
 *
 * @example
 * const store = observable({count: 0});
 * const unsubscribe = store.subscribe((newState, oldState, key) => {
 *   console.log(`${key} changed from ${oldState.count} to ${newState.count}`);
 * });
 * store.count = 10;
 * unsubscribe();
 */
export function observable(initial, callback) {

  const subscribers = [];

  const proxy = new Proxy(initial, {
    set(state, key, value) {
      if (state[key] === value) return true;
      const { subscribe: oldSubscribe, ...oldState } = state;
      state[key] = value;
      const { subscribe: newSubscribe, ...newState } = state;
      subscribers.forEach(fn => fn(newState, oldState, key));
      return true;
    }
  });

  proxy.subscribe = function(fn) {
    subscribers.push(fn);
    return () => subscribers.splice(subscribers.indexOf(fn), 1);
  };

  callback && proxy.subscribe(callback);
  return proxy;
};
