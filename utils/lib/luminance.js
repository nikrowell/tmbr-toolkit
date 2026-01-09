/**
 * Calculates relative luminance from an RGB array
 *
 * @param {number[]} rgb - [r, g, b] values (0-255)
 * @returns {number} luminance value (0-255)
 */
export function luminance(rgb) {
  return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]);
};
