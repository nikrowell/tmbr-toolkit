import { on, findOne, findAll, isDefined, isString, toJSON, traverse } from '@tmbr/utils';
import { bindDirective, bindEvent } from './bind.js';

let queue;
let scheduled = false;

function enqueue(component) {
  queue ??= new Set();
  queue.add(component);

  if (scheduled) return;
  queueMicrotask(flush);
  scheduled = true;
}

function flush() {
  for (const component of queue) render(component);
  queue.clear();
  scheduled = false;
}

function render(component) {
  const state = component.state;
  const proto = Object.getPrototypeOf(component);

  const context = proto === Component.prototype ? state : new Proxy(state, {
    has(target, key) {
      return Object.getOwnPropertyDescriptor(proto, key)?.get ? true : key in target;
    },
    get(target, key, receiver) {
      const d = Object.getOwnPropertyDescriptor(proto, key);
      return d?.get ? d.get.call(component) : Reflect.get(target, key, receiver);
    }
  });

  for (const apply of component.directives) apply(context);
  component.update?.(context);
}

export default class Component {

  static state = {};

  constructor(el) {
    this.el = isString(el) ? findOne(el) : el;

    if (!this.el) {
      console.warn(`[Component] ${el} element not found`);
      return;
    }

    this.dom = this.findAll('[ref]').reduce((result, child) => {

      let key = child.getAttribute('ref');
      child.removeAttribute('ref');

      const hasBrackets = key.includes('[');
      hasBrackets && (key = key.replace(/[\[\]]/g, ''));

      const asArray = hasBrackets || isDefined(result[key]);

      result[key] = asArray ? [].concat(result[key] ?? [], child) : child;
      return result;

    }, {});

    this.controller = null;
    this.directives = [];

    const hasProps = this.el.hasAttribute('data-props');
    this.props = hasProps ? toJSON(this.el.dataset.props) : {};

    const hasState = this.el.hasAttribute('data-state') || this.constructor.state;
    this.state = hasState ? this.#state() : {};

    this.el.removeAttribute('data-props');
    this.el.removeAttribute('data-state');
    this.init?.();
  }

  #state() {

    traverse(this.el, child => {
      for (const {name, value} of [...child.attributes]) {
        if (name.startsWith(':')) {
          bindDirective(this, child, name.slice(1), value);
          child.removeAttribute(name);
        } else if (name.startsWith('@')) {
          bindEvent(this, child, name.slice(1), value);
          child.removeAttribute(name);
        }
      }
    });

    const state = this.el.dataset.state
      ? toJSON(this.el.dataset.state)
      : structuredClone(this.constructor.state);

    const set = (target, key, value) => {
      target[key] = value;
      enqueue(this);
      return true;
    };

    enqueue(this);
    return new Proxy(state, {set});
  }

  findOne(s) {
    return findOne(s, this.el);
  }

  findAll(s) {
    return findAll(s, this.el);
  }

  on(event, target, fn) {
    const off = on(event, target, fn, this.el);
    this.on.destroy ??= [];
    this.on.destroy.push(off);
    return off;
  }

  dispatch(type, detail, options = {}) {
    const e = new CustomEvent(type, {detail, ...options});
    return this.el.dispatchEvent(e);
  }

  destroy() {
    this.on.destroy?.forEach(off => off());
    this.controller?.abort();
    this.directives.length = 0;
    queue.delete(this);
  }
}
