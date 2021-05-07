
function uid(prefix = '', suffix = '') {
  return prefix + now().toString(36) + suffix;
}

function now() {
  const time = Date.now();
  const last = uid.last || time;
  return now.last = time > last ? time : last + 1;
}

function slug(str) {
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function html(strings, ...vars) {

  let result = '';
  const appends = [];

  for (let i = 0; i < vars.length; i++) {
    if (vars[i] instanceof HTMLElement || vars[i] instanceof DocumentFragment) {
      appends.push(vars[i]);
      result += strings[i] + `<div append="${i}"></div>`;
    } else {
      result += strings[i] + vars[i];
    }
  }

  result += strings[strings.length - 1];

  const template = document.createElement('template');
  template.innerHTML = result.trim();

  const content = template.content;

  [...content.querySelectorAll('[append]')].forEach((node, i) => {
    node.parentNode.insertBefore(appends[i], node);
    node.parentNode.removeChild(node);
  });

  return content.childElementCount === 1 ? content.firstElementChild : content;
}
