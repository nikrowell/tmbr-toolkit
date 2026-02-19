import { suite } from 'uvu';
import { JSDOM } from 'jsdom';
import { snoop } from 'snoop';
import * as assert from 'uvu/assert';
import Component from './index.js';

const test = suite('component');

let document;
let spy;

test.before(async () => {
  const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');

  global.window = window;
  global.document = window.document;
  global.NodeFilter = window.NodeFilter;
  global.CustomEvent = window.CustomEvent;
  global.AbortController = window.AbortController;
  global.queueMicrotask = global.queueMicrotask || (fn => Promise.resolve().then(fn));

  document = window.document;
});

test.before.each(() => {
  spy = snoop(() => {});
});

function create(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return document.body.appendChild(template.content.firstChild);
}

async function tick() {
  await new Promise(resolve => queueMicrotask(resolve));
}

test('findOne returns child', () => {
  const el = create('<div><span class="target"></span></div>');
  const c = new Component(el);
  assert.is(c.findOne('.target').parentElement, el);
});

test('findAll returns array', () => {
  const el = create('<ul><li class="item">a</li><li class="item">b</li></ul>');
  const c = new Component(el);
  const items = c.findAll('.item');
  assert.ok(Array.isArray(items));
  assert.is(items.length, 2);
});

test('parses data-props', () => {
  let el = create('<div></div>');
  let c = new Component(el);
  assert.type(c.props, 'object');

  el = create(`<div data-props="{foo: 'bar'}"></div>`);
  c = new Component(el);
  assert.is(c.props.foo, 'bar');
});

test('instance from data-state attribute', () => {
  const el = create(`<div data-state="{count: 0, message: 'hello'}"></div>`);
  const c = new Component(el);
  assert.is(c.el, el);
  assert.is(c.state.count, 0);
  assert.is(c.state.message, 'hello');
});

test('instance from static state', () => {

  class Counter extends Component {
    static state = {count: 10}
  }

  const el = create('<div></div>');
  const c = new Counter(el);
  assert.is(c.state.count, 10);
});

test('static state returns fresh object per instance', () => {

  class Shared extends Component {
    static state = {items: []}
  }

  const a = new Shared(create('<div></div>'));
  const b = new Shared(create('<div></div>'));
  a.state.items.push('a');
  assert.is(b.state.items.length, 0);
});

test('empty data-state defaults to object', () => {
  const el = create('<div></div>');
  const c = new Component(el);
  assert.type(c.state, 'object');
});

test('proxy setter triggers render', async () => {
  const el = create('<div data-state="{count: 0}"><span :text="count"></span></div>');
  const c = new Component(el);
  c.state.count = 5;
  await tick();
  assert.is(c.findOne('span').textContent, '5');
});

test('multiple mutations batch into single render', async () => {

  class Batched extends Component {
    static state = { a: 0, b: 0 }
    update() { spy.fn() }
  }

  const el = create('<div></div>');
  const c = new Batched(el);
  await tick();
  const initial = spy.callCount;
  c.state.a = 1;
  c.state.b = 2;
  c.state.a = 3;
  await tick();
  assert.is(spy.callCount - initial, 1);
});

test(':text sets textContent', async () => {
  const el = create(`<div data-state="{message: 'hello'}"><p :text="message"></p></div>`);
  new Component(el);
  await tick();
  assert.is(el.querySelector('p').textContent, 'hello');
});

test(':html sets innerHTML', async () => {
  const el = create(`<div data-state="{content: '<b>bold</b>'}"><p :html="content"></p></div>`);
  new Component(el);
  await tick();
  assert.is(el.querySelector('p').innerHTML, '<b>bold</b>');
});

test(':class with string', async () => {
  const el = create(`<div data-state="{status: 'active'}" class="foo bar" :class="status"></div>`);
  new Component(el);
  await tick();
  assert.is(el.className, 'foo bar active');
});

test(':class with object', async () => {
  const el = create('<div data-state="{foo: true, bar: false}" :class="{active: foo, hidden: bar}"></div>');
  new Component(el);
  await tick();
  assert.is(el.className, 'active');
});

test(':class with array', async () => {
  const el = create(`<div data-state="{a: true}" :class="[a && 'yes', !a && 'no']"></div>`);
  new Component(el);
  await tick();
  assert.is(el.className, 'yes');
});

test(':show', async () => {
  const el = create('<div data-state="{visible: false}"><div :show="visible">hidden</div></div>');
  const c = new Component(el);
  const p = el.children[0];
  await tick();
  assert.is(p.style.display, 'none');
  c.state.visible = true;
  await tick();
  assert.is(p.style.display, '');
});

test(':value', async () => {
  const el = create(`<div data-state="{name: 'Nik'}"><input :value="name"></div>`);
  new Component(el);
  await tick();
  assert.is(el.querySelector('input').value, 'Nik');
});

test(':disabled boolean attribute', async () => {
  const el = create('<div data-state="{loading: true}"><button :disabled="loading">btn</button></div>');
  const c = new Component(el);
  await tick();
  assert.ok(c.findOne('button').hasAttribute('disabled'));
  c.state.loading = false;
  await tick();
  assert.not.ok(c.findOne('button').hasAttribute('disabled'));
});

test(':hidden boolean attribute', async () => {
  const el = create('<div data-state="{hide: true}"><span :hidden="hide"></span></div>');
  new Component(el);
  await tick();
  assert.ok(el.querySelector('span').hidden);
});

test('generic attribute fallback', async () => {
  const el = create(`<div data-state="{url: 'https://example.com'}"><a :href="url">link</a></div>`);
  new Component(el);
  await tick();
  assert.is(el.querySelector('a').getAttribute('href'), 'https://example.com');
});

test('directive attributes removed', () => {
  const el = create('<div data-state="{x: 1}"><span :text="x"></span></div>');
  new Component(el);
  assert.not.ok(el.querySelector('span').hasAttribute(':text'));
});

test('@event calls component method', async () => {

  class Clicker extends Component {
    click(event) { spy.fn() }
  }

  const el = create('<div><button @click="click">go</button></div>');
  new Clicker(el);
  el.querySelector('button').click();
  assert.ok(spy.called);
});

test('@event with inline expression', async () => {
  const el = create('<div data-state="{count: 0}"><button @click="count++">+</button><span :text="count"></span></div>');
  new Component(el);
  await tick();
  assert.is(el.querySelector('span').textContent, '0');
  el.querySelector('button').click();
  await tick();
  assert.is(el.querySelector('span').textContent, '1');
});

test('@event.prevent modifier', async () => {
  const el = create('<div><form @submit.prevent="void 0"><button type="submit">go</button></form></div>');
  new Component(el);

  let prevented = false;
  const event = new window.Event('submit');

  Object.defineProperty(event, 'preventDefault', {
    value: () => prevented = true
  });

  el.querySelector('form').dispatchEvent(event);
  assert.ok(prevented);
});

test('@event.stop modifier', async () => {
  const el = create('<div><button @click.stop="void 0">go</button></div>');
  new Component(el);
  el.addEventListener('click', spy.fn);
  el.querySelector('button').click();
  assert.ok(spy.notCalled);
});

test('@event.self modifier', async () => {

  class Tester extends Component {
    handle() { spy.fn() }
  }

  const el = create('<div @click.self="handle"><button>inner</button></div>');
  new Tester(el);

  el.querySelector('button').click();
  assert.ok(spy.notCalled);
  el.click();
  assert.ok(spy.called);
});

test('event attributes removed', () => {
  const el = create('<button @click="void 0">go</button>');
  new Component(el);
  assert.not.ok(el.hasAttribute('@click'));
});

test('ref as element', () => {
  const el = create('<div><span ref="label"></span><input ref="input"></div>');
  const c = new Component(el);
  assert.is(c.dom.label, el.children[0]);
  assert.is(c.dom.input, el.children[1]);
});

test('ref as array', () => {
  const el = create('<ul><li ref="items">a</li><li ref="items">b</li><li ref="items">c</li></ul>');
  const c = new Component(el);
  assert.is(c.dom.items.length, 3);
  assert.is(c.dom.items[1], el.children[1]);
});

test('ref as forced array', () => {
  const el = create('<ul><li ref="[items]">a</li></ul>');
  const c = new Component(el);
  assert.ok(Array.isArray(c.dom.items));
});

test('ref attributes removed', () => {
  const el = create('<div><span ref="test"></span></div>');
  new Component(el);
  assert.not.ok(el.querySelector('span').hasAttribute('ref'));
});

test('update called after each render', async () => {

  class Tester extends Component {
    static state = { count: 0 }
    update(state) { spy.fn(state) }
    increment() { this.state.count++ }
  }

  const el = create('<div></div>');
  const c = new Tester(el);
  await tick();
  assert.ok(spy.called);
  c.increment();
  await tick();
  assert.is(spy.callCount, 2);
  assert.is(spy.lastCall.arguments[0], c.state);
});

test('destroy removes listeners', async () => {

  class Tester extends Component {
    handle() { spy.fn() }
  }

  const el = create('<div><button @click="handle">go</button></div>');
  const c = new Tester(el);
  el.querySelector('button').click();
  assert.ok(spy.called);
  c.destroy();
  el.querySelector('button').click();
  assert.is(spy.callCount, 1);
});

test('destroy clears directives', () => {
  const el = create('<div data-state="{x: 1}" :text="x"></div>');
  const c = new Component(el);
  assert.ok(c.directives.length, 1);
  c.destroy();
  assert.is(c.directives.length, 0);
});

test('dispatch event', async () => {
  const el = create('<div></div>');
  const c = new Component(el);
  el.addEventListener('custom', spy.fn);
  c.dispatch('custom', {foo: 'bar'});
  assert.ok(spy.called);
  assert.is(spy.lastCall.arguments[0].detail.foo, 'bar');
});

test('dispatch event with options', async () => {
  const el = create('<div></div>');
  const c = new Component(el);
  document.body.addEventListener('bubble', spy.fn);
  c.dispatch('bubble', null, {bubbles: true});
  assert.ok(spy.called);
  document.body.removeEventListener('bubble', spy.fn);
});

test(':model text input sets value from state', async () => {
  const el = create(`<div data-state="{name: 'Nik'}"><input type="text" :model="name" /></div>`);
  new Component(el);
  await tick();
  assert.is(el.querySelector('input').value, 'Nik');
});

test(':model text input updates state on input event', async () => {
  const el = create(`<div data-state="{name: ''}"><input :model="name" type="text"></div>`);
  const c = new Component(el);
  await tick();
  const input = el.querySelector('input');
  input.value = 'Jane';
  input.dispatchEvent(new window.Event('input'));
  assert.is(c.state.name, 'Jane');
});

test(':model checkbox sets checked from state', async () => {
  const el = create('<div data-state="{active: true}"><input :model="active" type="checkbox"></div>');
  new Component(el);
  await tick();
  assert.ok(el.querySelector('input').checked);
});

test(':model checkbox updates state on change event', async () => {
  const el = create('<div data-state="{active: false}"><input :model="active" type="checkbox"></div>');
  const c = new Component(el);
  const input = el.querySelector('input');
  input.checked = true;
  input.dispatchEvent(new window.Event('change'));
  assert.is(c.state.active, true);
});

test(':model number input coerces value to number', async () => {
  const el = create('<div data-state="{age: 0}"><input :model="age" type="number"></div>');
  const c = new Component(el);
  const input = el.querySelector('input');
  input.value = '25';
  input.dispatchEvent(new window.Event('input'));
  assert.is(c.state.age, 25);
  assert.type(c.state.age, 'number');
});

test(':model select updates state on change event', async () => {
  const el = create(`<div data-state="{color: 'red'}"><select :model="color"><option value="red">Red</option><option value="blue">Blue</option></select></div>`);
  const c = new Component(el);
  await tick();
  const select = el.querySelector('select');
  assert.is(select.value, 'red');
  select.value = 'blue';
  select.dispatchEvent(new window.Event('change'));
  assert.is(c.state.color, 'blue');
});

test(':model cleans up listener on destroy', async () => {
  const el = create(`<div data-state="{name: ''}"><input :model="name" type="text"></div>`);
  const c = new Component(el);
  c.destroy();
  const input = el.querySelector('input');
  input.value = 'after-destroy';
  input.dispatchEvent(new window.Event('input'));
  assert.is(c.state.name, '');
});

test.run();
