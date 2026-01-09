/**
 * Creates DOM elements using template literals, inspired by {@link https://www.npmjs.com/package/facon facon}
 *
 * @param {TemplateStringsArray} strings - template literal strings
 * @param {...*} vars - template literal values (strings, elements, or arrays)
 * @returns {Element|DocumentFragment} single element or fragment if multiple root nodes
 *
 * @example
 * const img = html`<img src="/image.jpg" alt="">`;
 * const list = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`;
 */
export function html(strings, ...vars) {

  let result = '';
  const appends = [];

  for (let i = 0; i < vars.length; i++) {
    const value = [].concat(vars[i]);

    if (value[0] instanceof HTMLElement || value[0] instanceof DocumentFragment) {
      appends.push(value);
      result += strings[i] + `<div append="${i}"></div>`;
    } else {
      result += strings[i] + value.join('');
    }
  }

  result += strings[strings.length - 1];

  template ??= document.createElement('template');
  template.innerHTML = result.trim();

  const content = template.content;

  [...content.querySelectorAll('[append]')].forEach((temp, i) => {
    temp.before(...appends[i]);
    temp.remove();
  });

  return content.childElementCount === 1 ? content.firstElementChild : content;
};

let template;
