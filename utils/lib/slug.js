/**
 * Converts a string to a URL-friendly slug
 *
 * @param {string} str - string to convert
 * @returns {string} lowercase, hyphenated slug
 */
export function slug(str) {
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
