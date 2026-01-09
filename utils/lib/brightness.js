/**
 * Calculates perceived brightness from an RGB array
 *
 * @param {number[]} rgb - [r, g, b] values (0-255)
 * @returns {number} brightness value (0-255)
 */
export function brightness(rgb) {
  return (0.299 * rgb[0]) + (0.587 * rgb[1]) + (0.114 * rgb[2]);
};
