import { suite } from 'uvu';
import { JSDOM } from 'jsdom';
import { snoop } from 'snoop';
import * as assert from 'uvu/assert';

import {
  combine,
  cx,
  dot,
  format,
  html,
  isElement,
  isEmpty,
  isIterator,
  isObject,
  noop,
  observable,
  on,
  ordinal,
  pipe,
  safe,
  settled,
  toJSON,
  toRelativeTime,
  traverse
} from './index.js';

const test = suite('utils');

let div;

test.before(async () => {
  const { window } = await JSDOM.fromFile('./utils/test.html');

  global.window = window; [
    'document',
    'DocumentFragment',
    'HTMLElement',
    'NodeFilter',
    'AbortController'
  ].forEach(key => global[key] = window[key]);
});

test.before.each(() => {
  div = document.createElement('div');
});

test('combine', () => {
  const b = snoop(noop);
  const a = snoop(noop);
  const combined = combine(a.fn, undefined, null, 0, b.fn);
  combined('foo', 'bar');
  assert.equal(a.calls[0].arguments, ['foo', 'bar']);
  assert.equal(b.calls[0].arguments, ['foo', 'bar']);
});

test('cx', () => {
  const classes = cx('one', {'two': true, 'three': 0}, [true && 'four', null && 'five']);
  /*      */ cx(div, 'one', {'two': true, 'three': 0}, [true && 'four', null && 'five']);
  assert.is(classes, 'one two four');
  assert.is(classes, div.className);
  assert.is(cx(div), div.classList);
});

test('dot', () => {

  const o = {
    u: undefined,
    f: false,
    n: null,
    z: 0,
    a: {b: {c: 'Colorado'}}
  };

  assert.is(dot(o, 'one.two'), undefined);
  dot(o, 'one.two', 3);
  assert.is(dot(o, 'one.two'), 3);

  assert.is(dot(o, 'u'), undefined);
  assert.is(dot(o, 'f'), false);
  assert.is(dot(o, 'n'), null);
  assert.is(dot(o, 'z'), 0);
  assert.is(dot(o, 'x.y.z'), undefined);
  assert.is(dot(o, 'a.poo'), undefined);
  assert.is(dot({}, 'one.two', 3).one.two, 3);

  assert.equal(dot(o, 'a.b'), {c: 'Colorado'});
  assert.equal(dot(o, 'a.b.c', 'Minnesota'), o);
  assert.equal(dot(o, 'a.b.c.d', 'Montana'), o);
  assert.equal(dot(o, 'a.b.c'), {d: 'Montana'});
});

test('format', () => {
  let date = new Date(2012, 5, 2, 16, 5, 30);
  assert.is(format(`DDDD, MMMM Do, YYYY [at] h:mm:ss a`, date), 'Saturday, June 2nd, 2012 at 4:05:30 pm');

  date = new Date(1999, 11, 31);
  assert.is(format('Do', date), '31st');
  date.setDate(23);
  assert.is(format('Do', date), '23rd');
  date.setDate(22);
  assert.is(format('Do', date), '22nd');
  date.setDate(21);
  assert.is(format('Do', date), '21st');
  date.setDate(11);
  assert.is(format('Do', date), '11th');
});

test('html', () => {
  const frag = new DocumentFragment();
  frag.append(html`<li>foo</li>`);
  frag.append(html`<li>bar</li> <li>${div}</li>`);

  const arrayOfElements = [
    html`<li>array of</li>`,
    html`<li>elements</li>`,
  ];

  const arrayOfStrings = [
    `<li>array of</li>`,
    `<li>strings</li>`,
  ];

  const list = html`<ul>${frag} ${arrayOfElements} ${arrayOfStrings}</ul>`;

  assert.is(list.children.length, 7);
  assert.is(list.children[2].firstElementChild, div);

  assert.is(list.innerHTML, [
    '<li>foo</li>',
    '<li>bar</li>',
    ' <li><div></div></li>',
    ' <li>array of</li><li>elements</li>',
    ' <li>array of</li><li>strings</li>',
  ].join(''));

  const button = html`<button type="button" class="button">Submit</button>`;
  assert.is(button.className, 'button');
  assert.is(button.textContent, 'Submit');
});

test('isElement', () => {
  assert.not.ok(isElement({}));
  assert.not.ok(isElement(null));
  assert.not.ok(isElement(true));
  assert.not.ok(isElement(false));
  assert.not.ok(isElement('div'));
  assert.ok(isElement(div));
  assert.ok(isElement(div, 'div'));
});

test('isEmpty', () => {
  assert.not.ok(isEmpty('hello'));
  assert.not.ok(isEmpty(new String('hello')));
  assert.not.ok(isEmpty({hello: 'world'}));
  assert.not.ok(isEmpty([1, 2]));
  assert.not.ok(isEmpty(new Set([1, 2, 2])));
  assert.not.ok(isEmpty(new Map([['a', 1]])));
  assert.not.ok(isEmpty(true));
  assert.not.ok(isEmpty(1));

  assert.ok(isEmpty(undefined));
  assert.ok(isEmpty(null));
  assert.ok(isEmpty(false));
  assert.ok(isEmpty(0));
  assert.ok(isEmpty(''));
  assert.ok(isEmpty([]));
  assert.ok(isEmpty({}));
  // assert.ok(isEmpty(new Boolean()));
  // assert.ok(isEmpty(new String()));
  // assert.ok(isEmpty(new Set()));
  // assert.ok(isEmpty(new Map()));
  // assert.ok(isEmpty(Symbol('abc')));
});

test('isIterator', () => {
  function* gen() { yield 1; }
  const iterator = gen();
  const arrayIterator = [1, 2, 3][Symbol.iterator]();

  assert.ok(isIterator(iterator));
  assert.ok(isIterator(arrayIterator));
  assert.ok(isIterator({next: () => {}}));

  assert.not.ok(isIterator(null));
  assert.not.ok(isIterator(undefined));
  assert.not.ok(isIterator({}));
  assert.not.ok(isIterator([]));
  assert.not.ok(isIterator('string'));
  assert.not.ok(isIterator(42));
  assert.not.ok(isIterator({next: 'not a function'}));
});

test('isObject', () => {
  assert.ok(isObject({}));
  assert.not.ok(isObject());
  assert.not.ok(isObject(''));
  assert.not.ok(isObject([]));
  assert.not.ok(isObject(null));
  assert.not.ok(isObject(fn => fn));
});

test('observable', () => {

  const cb1 = snoop(noop);
  const cb2 = snoop(noop);
  const store = observable({count: 0}, cb1.fn);
  const unsubscribe = store.subscribe(cb2.fn);

  store.count = 1;
  store.count = 1;
  unsubscribe();
  store.count = 2;

  // callback passed on creation
  assert.ok(cb1.callCount === 2);
  assert.equal(cb1.firstCall.arguments[0].count, 1);
  assert.equal(cb1.firstCall.arguments[1].count, 0);

  // callback passed to subscribe
  assert.ok(cb2.callCount === 1);
  assert.equal(cb2.firstCall.arguments[0].count, 1);
  assert.equal(cb2.firstCall.arguments[1].count, 0);

  // callbacks receive key that changed
  assert.equal(cb1.calls[0].arguments[2], 'count');
  assert.equal(cb2.calls[0].arguments[2], 'count');

  // subscribe is removed from state arguments
  assert.equal(cb1.calls[0].arguments[0].subscribe, undefined);
  assert.equal(cb1.calls[0].arguments[1].subscribe, undefined);
});

test('on', () => {

  const [ a, b ] = document.querySelectorAll('#on button');

  let callback = snoop(noop);
  let off;

  function trigger(el, event) {
    el.dispatchEvent(new window.Event(event));
  }

  // on | off : event with selector
  // on | off : event with element
  // on | off : event with array
  // on | off : multiple events with selector
  // on | off : multiple events with element
  // on | off : multiple events with array

  off = on('click', '#on button', callback.fn);
  // on('click', a, callback.fn);
  // on('click', [a, b], callback.fn);
  // on('mouseenter mouseleave', '#on button', callback.fn);
  // on('mouseenter mouseleave', a, callback.fn);
  // on('mouseenter mouseleave', [a, b], callback.fn);

  trigger(a, 'click');
  off();
  trigger(a, 'click');

  assert.equal(callback.firstCall.arguments[0].target, a);
  assert.ok(callback.calledOnce);
});

test('ordinal', () => {
  assert.equal(ordinal(1), '1st');
  assert.equal(ordinal(2), '2nd');
  assert.equal(ordinal(3), '3rd');
  assert.equal(ordinal(4), '4th');
  assert.equal(ordinal(11), '11th');
  assert.equal(ordinal(21), '21st');
  assert.equal(ordinal(42), '42nd');
  assert.equal(ordinal(103), '103rd');
});

test('pipe', () => {
  const fn = pipe(
    value => value.replace(/[^a-zA-Z]/g, ''),
    value => value.toUpperCase(),
    value => `${value}!`
  );
  assert.equal(fn('Hello, World?'), 'HELLOWORLD!');
});

test('safe', async () => {
  const errorTrigger = snoop(async () => fail());
  const errorHandler = snoop(noop);
  await safe(errorTrigger.fn, errorHandler.fn)();
  assert.ok(errorTrigger.called);
  assert.ok(errorHandler.called);
});

test('settled', async () => {
  const [res,] = await settled(Promise.resolve('Success'));
  assert.equal(res, 'Success');
  const [,err] = await settled(Promise.reject('Fail'));
  assert.equal(err, 'Fail');
  const data = await settled(Promise.resolve({message: 'Hello'}), ({value}) => value);
  assert.equal(data.message, 'Hello');
});

test('toJSON', () => {
  // string to object
  const a =    { string : 'Hello World',  number : 42,  nope : null,  yes : true,  no : false,};
  const b = "\n{ string : 'Hello World',  number : 42, 'nope': null,  yes : true,  no : false,} ";
  const c = '  {"string": "Hello World", "number": 42, "nope": null, "yes": true, "no": false,} ';
  const o = {};
  assert.equal(a, toJSON(b));
  assert.equal(a, toJSON(c));
  assert.equal(o, toJSON());
  assert.equal(o, toJSON(0));
  assert.equal(o, toJSON(' '));
  assert.equal(o, toJSON(' null '));
  assert.equal(o, toJSON('undefined'));
  assert.equal(o, toJSON(null));
  assert.equal(o, toJSON(false));
  assert.equal(a, toJSON(undefined, a));
  // object to string
  const string = '{"string":"Hello World","number":44,"nope":null,"yes":true,"no":false,"name":"Nik"}';
  assert.equal(toJSON(a, {number: 44, name: 'Nik'}), string);
});

test('toRelativeTime', () => {
  const now = Date.now();
  assert.is(toRelativeTime(new Date(now - 60 * 1000)), '1 minute ago');
  assert.is(toRelativeTime(null), null);
  assert.is(toRelativeTime(undefined), null);
  assert.is(toRelativeTime('invalid'), null);
  assert.is(toRelativeTime(Infinity), null);
  // past
  assert.is(toRelativeTime(now - 30 * 1000), '30 seconds ago');
  assert.is(toRelativeTime(now - 5 * 60 * 1000), '5 minutes ago');
  assert.is(toRelativeTime(now - 3 * 60 * 60 * 1000), '3 hours ago');
  assert.is(toRelativeTime(now - 2 * 24 * 60 * 60 * 1000), '2 days ago');
  // future
  assert.is(toRelativeTime(now + 45 * 1000), 'in 45 seconds');
  assert.is(toRelativeTime(now + 10 * 60 * 1000), 'in 10 minutes');
});

test('traverse', () => {
  const node = document.getElementById('traverse');
  const tags = [];
  const text = [];
  traverse(node, el => tags.push(el.nodeName.toLowerCase()));
  traverse(node, el => text.push(el.wholeText?.trim()), NodeFilter.SHOW_TEXT);
  assert.equal(tags.join(' '), 'div header h1 main p strong ul li li');
  assert.equal(text.filter(Boolean).join(' '), 'Hello Lorem ipsum dolor Minnesota Colorado');
});

test.run();
