/**
 * Creates a deferred promise with external resolve/reject
 * (consider using {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers Promise.withResolvers()} instead)
 *
 * @returns {Object} object with promise, resolve, and reject properties
 */
export function pledge() {

  let resolve, reject;

  const promise = new Promise((pass, fail) => {
    resolve = pass;
    reject = fail;
  });

  return { promise, resolve, reject };
};
