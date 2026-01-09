/**
 * Creates a function that pipes input through multiple functions
 *
 * @param {...Function} fns - functions to chain
 * @returns {Function} composed function
 *
 * @example
 * pipe(trim, lowercase, slugify)('  Hello World  '); // 'hello-world'
 */
export function pipe(...fns) {
  return input => fns.reduce((result, fn) => fn(result), input);
};
