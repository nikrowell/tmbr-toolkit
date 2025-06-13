/**
 * {@link https://youtu.be/wsoQ-fgaoyQ Await Error Handling}
 *
 * @param promise - Promise to await
 * @param handler - optional function to handle the resolved or rejected promise
 */
export function settled(promise, handler) {
  handler ??= ({value, reason}) => [value, reason];
  return Promise.allSettled([promise]).then(([result]) => handler(result));
};
