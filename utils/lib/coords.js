import { isElement } from './isElement.js';

/**
 * Gets x and y coordinates from a pointer event, optionally relative to a target element
 *
 * @param {Event} event - mouse or touch event
 * @param {Element} target - optional element for relative coordinates
 * @returns {Object} object with x, y (and px, py percentages if target provided)
 */
export function coords(event, target) {

  const point = {
    x: event.touches?.[0].pageX || event.clientX,
    y: event.touches?.[0].pageY || event.clientY
  };

  if (isElement(target)) {
    const rect = target.getBoundingClientRect();
    point.x -= rect.left;
    point.y -= rect.top;
    point.px = point.x / (rect.right - rect.left);
    point.py = point.y / (rect.bottom - rect.top);
  }

  return point;
};
