/**
 * localStorage wrapper with support for JSON and scalar values
 *
 * @example
 * storage.set('key', {a: 1});
 * storage.get('key');          // {a: 1}
 * storage.get('missing', 42);  // 42
 * storage.remove('key');
 */
export const storage = create(() => window.localStorage);

/**
 * sessionStorage wrapper with support for JSON and scalar values
 *
 * @example
 * session.set('token', 'example');
 * session.get('token');
 */
export const session = create(() => window.sessionStorage);

function create(store) {
  return {
    get(key, fallback) {
      const value = store().getItem(key);
      try {
        return value !== null ? JSON.parse(value) : fallback;
      } catch {
        return value;
      }
    },
    set(key, value) {
      store().setItem(key, JSON.stringify(value));
    },
    remove(key) {
      store().removeItem(key);
    }
  };
}
