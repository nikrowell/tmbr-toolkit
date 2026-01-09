/**
 * Shuffles an array in place, or returns a random sort comparator
 *
 * @param {Array} array - array to shuffle (optional)
 * @returns {Array|number} shuffled array, or random comparator if no array provided
 */
export function shuffle(array) {
  const rand = () => 0.5 - Math.random();
  return (arguments.length === 1) ? array.sort(rand) : rand();
};
