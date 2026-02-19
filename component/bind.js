import { cx, isFunction } from '@tmbr/utils';

const BOOLEANS = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected'
]);

export function bindDirective(component, node, attr, expression) {

  const fn = new Function('state', `
    try {
      var result;
      with (state) { result = ${expression} };
      return result;
    } catch(e) {
      console.warn('[Component]', e);
    }`);

  let apply;

  if (attr === 'model') {

    const isCheckbox = node.type === 'checkbox';
    const isRadio = node.type === 'radio';
    const isNumber = node.type === 'number' || node.type === 'range';
    const isSelect = node.nodeName === 'SELECT';

    if (isCheckbox) {
      apply = value => node.checked = !!value;
    } else if (isRadio) {
      apply = value => node.checked = node.value === String(value);
    } else {
      apply = value => node.value = value ?? '';
    }

    component.controller ??= new AbortController();
    const type = (isCheckbox || isRadio || isSelect) ? 'change' : 'input';

    node.addEventListener(type, event => {
      const value = isCheckbox ? e.target.checked : event.target.value;
      component.state[expression] = isNumber ? Number(value) : value;
    }, {signal: component.controller.signal});

  } else if (attr === 'text') {
    apply = value => node.textContent = value;
  } else if (attr === 'html') {
    apply = value => node.innerHTML = value;
  } else if (attr === 'value') {
    apply = value => node.value = value;
  } else if (attr === 'show') {
    const display = node.style.display || '';
    apply = value => node.style.display = value ? display : 'none';
  } else if (attr === 'class') {
    const classes = node.className.split(' ').filter(Boolean);
    apply = value => cx(node, ...classes, value);
  } else if (BOOLEANS.has(attr)) {
    apply = value => value ? node.setAttribute(attr, '') : node.removeAttribute(attr);
  } else {
    apply = value => node.setAttribute(attr, value);
  }

  component.directives.push(state => apply(fn(state)));
}

export function bindEvent(component, node, attr, value) {

  const [name, ...modifiers] = attr.split('.');

  let target = node;

  if (modifiers.includes('window')) {
    target = window;
  } else if (modifiers.includes('document') || modifiers.includes('outside')) {
    target = document;
  }

  const callback = isFunction(component[value])
    ? component[value]
    : new Function('event', 'state', `
      try {
        with (state) { ${value} };
      } catch (e) {
        console.warn('[Component]', e);
      }`);

  component.controller ??= new AbortController();
  const signal = component.controller.signal;

  const options = {signal};
  if (modifiers.includes('once')) options.once = true;
  if (modifiers.includes('capture')) options.capture = true;
  if (modifiers.includes('passive')) options.passive = true;

  function listener(event) {
    if (modifiers.includes('outside') && node.contains(event.target)) return;
    if (modifiers.includes('self') && node !== event.target) return;
    if (modifiers.includes('stop')) event.stopPropagation();
    if (modifiers.includes('prevent')) event.preventDefault();
    callback.call(component, event, component.state);
  }

  target.addEventListener(name, listener, options);
}
