import { isFunction } from './isFunction.js';

/**
 * Tracks enter and leave events on an element using IntersectionObserver
 *
 * @param {Element} el - element to observe
 * @param {Object} options - enter/leave callbacks, once boolean, and IntersectionObserver options
 * @returns {Function} cleanup function to stop observing
 *
 * @example
 * const unobserve = io(el, {
 *   enter: () => console.log('enter'),
 *   leave: () => console.log('leave'),
 * });
 */
export function io(el, {enter, leave, once = false, ...rest}) {

  const observer = new IntersectionObserver(([entry]) => {

    if (entry.isIntersecting) {
      isFunction(enter) && enter(entry);
      once && unobserve();
    } else {
      isFunction(leave) && leave(entry);
    }

  }, rest);

  observer.observe(el);
  const unobserve = () => observer.disconnect();

  return unobserve;
};
