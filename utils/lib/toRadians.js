const TO_RADIANS = /* @__PURE__ */ (() => Math.PI / 180)();

/**
 * Converts degrees to radians
 *
 * @param {number} degrees - angle in degrees
 * @returns {number} angle in radians
 */
export function toRadians(degrees) {
  return degrees * TO_RADIANS;
};
