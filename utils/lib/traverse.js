/**
 * Walks a DOM tree and calls callback for each node
 *
 * @param {Element} el - root element to traverse
 * @param {Function} callback - function called for each node
 * @param {number} filter - NodeFilter constant (default: NodeFilter.SHOW_ELEMENT)
 */
export function traverse(el, callback, filter) {
  const walker = document.createTreeWalker(el, filter || NodeFilter.SHOW_ELEMENT);
  callback(el);
  while (walker.nextNode()) callback(walker.currentNode);
};
