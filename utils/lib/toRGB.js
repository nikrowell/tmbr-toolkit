/**
 * Converts a hex color string to an RGB array
 *
 * @param {string} hex - hex color (with or without #)
 * @returns {number[]|null} [r, g, b] array (0-255) or null if invalid
 */
export function toRGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
};
