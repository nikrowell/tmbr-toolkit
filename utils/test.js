import { suite } from 'uvu';
import { JSDOM } from 'jsdom';
import { snoop } from 'snoop';
import * as assert from 'uvu/assert';

import {
  attr,
  combine,
  cx,
  distance,
  dot,
  empty,
  fill,
  format,
  html,
  isElement,
  isEmpty,
  isIterator,
  isObject,
  noop,
  observable,
  on,
  once,
  only,
  ordinal,
  pipe,
  pluck,
  safe,
  settled,
  slug,
  template,
  toBoolean,
  toJSON,
  toRGB,
  toRelativeTime,
  traverse,
  validate,
  wrap
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
  div?.remove();
  div = document.createElement('div');
});

test('attr', () => {
  div.setAttribute('id', 'test');
  assert.is(attr(div, 'id'), 'test');
  assert.is(attr(div, 'missing'), null);
  attr(div, 'role', 'button');
  assert.is(div.getAttribute('role'), 'button');
  attr(div, 'role', null);
  assert.is(div.getAttribute('role'), null);
  attr(div, 'disabled', true);
  assert.is(div.getAttribute('disabled'), '');
  attr(div, 'disabled', false);
  assert.is(div.getAttribute('disabled'), null);
});

test('combine', () => {
  const b = snoop(noop);
  const a = snoop(noop);
  const combined = combine(a.fn, undefined, null, 0, b.fn);
  combined('foo', 'bar');
  assert.equal(a.calls[0].arguments, ['foo', 'bar']);
  assert.equal(b.calls[0].arguments, ['foo', 'bar']);
});

test('distance', () => {
  // coordinate mode
  assert.is(distance(0, 0, 3, 4), 5);
  assert.is(distance(1, 1, 1, 1), 0);
  assert.is(distance(-1, -1, 2, 3), 5);
  // object mode
  assert.is(distance({x: 0, y: 0}, {x: 3, y: 4}), 5);
  assert.is(distance({x: 1, y: 1}, {x: 1, y: 1}), 0);
  assert.is(distance({x: -1, y: -1}, {x: 2, y: 3}), 5);
});

test('cx', () => {
  const classes = cx('one', {'two': true, 'three': 0}, [true && 'four', null && 'five', 'six-seven lol']);
  /*      */ cx(div, 'one', {'two': true, 'three': 0}, [true && 'four', null && 'five', 'six-seven lol']);
  assert.is(classes, 'one two four six-seven lol');
  assert.is(classes, div.className);
  assert.is(cx(div), div.classList);

  cx(div, {'a': true, 'b': true});
  assert.ok(div.classList.contains('a'));
  assert.ok(div.classList.contains('b'));

  cx(div, {'b': false});
  assert.ok(div.classList.contains('a'));
  assert.not.ok(div.classList.contains('b'));
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

test('empty', () => {
  div.innerHTML = '<p>a</p><p>b</p><p>c</p>';
  assert.is(div.children.length, 3);
  const returned = empty(div);
  assert.is(returned, div);
  assert.is(div.children.length, 0);
});

test('fill', () => {
  assert.equal(fill(0, 'x'), []);
  assert.equal(fill(3, 'x'), ['x', 'x', 'x']);
  assert.equal(fill(1, null), [null]);
  assert.equal(fill(3, i => i * 2), [0, 2, 4]);
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

  date = new Date(2012, 2, 7, 9, 3, 5);
  assert.is(format('YY', date), '12');
  assert.is(format('M', date), '3');
  assert.is(format('MM', date), '03');
  assert.is(format('MMM', date), 'Mar');
  assert.is(format('D', date), '7');
  assert.is(format('DD', date), '07');
  assert.is(format('DDD', date), 'Wed');
  assert.is(format('H', date), '9');
  assert.is(format('HH', date), '09');
  assert.is(format('hh', date), '09');
  assert.is(format('A', date), 'AM');

  // afternoon hours for hh 12-hour with padding
  date = new Date(2012, 0, 1, 15, 0, 0);
  assert.is(format('hh', date), '03');
  assert.is(format('h', date), '3');
  assert.is(format('A', date), 'PM');

  // midnight edge case hour 0 → 12 in 12-hour format
  date = new Date(2012, 0, 1, 0, 0, 0);
  assert.is(format('h', date), '12');
  assert.is(format('hh', date), '12');

  // date as string
  assert.is(format('YYYY', '2020-06-15'), '2020');
  // date as number
  assert.is(format('YYYY', new Date(2020, 0, 1).getTime()), '2020');
  // no date defaults to now
  assert.is(format('YYYY'), String(new Date().getFullYear()));
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

  const multi = html`<p>a</p><p>b</p>`;
  assert.ok(multi instanceof DocumentFragment);
  assert.is(multi.childElementCount, 2);
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
});

test('isIterator', () => {
  function* gen() { yield 1 }
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
  let store = observable({count: 0}, cb1.fn);
  let unsubscribe = store.subscribe(cb2.fn);

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

  // multiple keys trigger independent callbacks
  const multi = snoop(noop);
  store = observable({x: 0, y: 0}, multi.fn);
  store.x = 1;
  store.y = 2;
  assert.ok(multi.callCount === 2);
  assert.equal(multi.calls[0].arguments[2], 'x');
  assert.equal(multi.calls[1].arguments[2], 'y');
});

test('on', () => {

  div.innerHTML = /* html */`
  <div id="on">
    <header><button type="button" class="button"><span>a</span></button></header>
    <footer><button type="button" class="button"><span>b</span></button></footer>
  </div>`

  document.body.append(div);
  const [ a, b ] = document.querySelectorAll('#on button');

  let callback;
  let off;

  const trigger = (el, event, bubbles = true) => {
    el.dispatchEvent(new window.Event(event, {bubbles}));
  };

  // event with selector
  callback = snoop(noop);
  off = on('click', '#on button', callback.fn);
  trigger(a, 'click');
  off();
  trigger(a, 'click');
  assert.ok(callback.calledOnce);
  assert.is(callback.firstCall.arguments[0].target, a);

  // event with element
  callback = snoop(noop);
  off = on('click', a, callback.fn);
  trigger(a, 'click');
  off();
  trigger(a, 'click');
  assert.ok(callback.calledOnce);

  // event with array of elements
  callback = snoop(noop);
  off = on('click', [a, b], callback.fn);
  trigger(a, 'click');
  trigger(b, 'click');
  off();
  trigger(a, 'click');
  assert.ok(callback.callCount === 2);

  // multiple events with selector
  callback = snoop(noop);
  off = on('mouseenter mouseleave', '#on button', callback.fn);
  trigger(a, 'mouseenter', false);
  trigger(a, 'mouseleave', false);
  off();
  trigger(a, 'mouseenter', false);
  assert.ok(callback.callCount === 2);

  // multiple events with element
  callback = snoop(noop);
  off = on('mouseenter mouseleave', a, callback.fn);
  trigger(a, 'mouseenter', false);
  trigger(a, 'mouseleave', false);
  off();
  trigger(a, 'mouseenter', false);
  assert.ok(callback.callCount === 2);

  // multiple events with array of elements
  callback = snoop(noop);
  off = on('mouseenter mouseleave', [a, b], callback.fn);
  trigger(a, 'mouseenter', false);
  trigger(b, 'mouseleave', false);
  off();
  trigger(a, 'mouseenter', false);
  assert.ok(callback.callCount === 2);

  // multiple events as array with selector
  callback = snoop(noop);
  off = on(['click', 'dblclick'], '#on button', callback.fn);
  trigger(a, 'dblclick');
  off();
  trigger(a, 'dblclick');
  assert.ok(callback.calledOnce);

  // event with selector and scope
  callback = snoop(noop);
  off = on('click', '#on button', callback.fn, div.querySelector('header'));
  trigger(a, 'click');
  trigger(b, 'click');
  off();
  trigger(a, 'click');
  assert.ok(callback.calledOnce);
  assert.is(callback.firstCall.arguments[0].target, a);

  // delegated event sets event.target when child triggers bubbling event
  callback = snoop(noop);
  off = on('click', '#on button', callback.fn);
  trigger(a.firstElementChild, 'click');
  off();
  assert.is(callback.firstCall.arguments[0].target, a);
});

test('once', () => {
  const callback = snoop(noop);
  const btn = document.createElement('button');
  document.body.append(btn);
  once('click', btn, callback.fn);
  btn.dispatchEvent(new window.Event('click', {bubbles: true}));
  btn.dispatchEvent(new window.Event('click', {bubbles: true}));
  assert.ok(callback.calledOnce);
  btn.remove();
});

test('only', () => {

  const fields = {
    name: {
      first: 'John',
      last: 'Smith'
    },
    stats: {
      age: 45,
      weight: 150,
      height: 68,
    },
    email: 'john@example.com',
    password: 'password',
  };

  assert.equal(only(fields, 'email'), {email: 'john@example.com'});
  assert.equal(only(fields, 'name.first:firstName'), {firstName: 'John'});
  assert.equal(only(fields, ['name.first', 'email']), {first: 'John', email: 'john@example.com'});
  assert.equal(only(fields, ['name.first', 'stats.age:years']), {first: 'John', years: 45});
  assert.equal(only(fields, ['name.first:name', 'nonexistent']), {name: 'John'});
  assert.equal(only(fields, 'stats.nonexistent'), {});
  assert.equal(only(fields, 'stats.age'), {age: 45});
  assert.equal(only(fields, 'stats.age:years'), {years: 45});
  assert.equal(only(fields, ['stats.age', 'stats.weight']), {age: 45, weight: 150});
  assert.equal(only(fields, []), {});

  const deep = {a: {b: {c: 'value'}}};
  assert.equal(only(deep, 'a.b.c'), {c: 'value'});
  assert.equal(only(deep, 'a.b.c:deep'), {deep: 'value'});
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

test('pluck', () => {

  const users = [
    {name: 'John', email: 'john@example.com', stats: {age: 45}},
    {name: 'Jane', email: 'jane@example.com', stats: {age: 39}},
  ];

  // single key returns array of values
  assert.equal(pluck(users, 'name'), ['John', 'Jane']);
  assert.equal(pluck(users, 'email'), ['john@example.com', 'jane@example.com']);
  assert.equal(pluck(users, 'stats.age'), [45, 39]);

  // array of keys returns array of objects via only()
  assert.equal(pluck(users, ['name', 'email']), [
    {name: 'John', email: 'john@example.com'},
    {name: 'Jane', email: 'jane@example.com'},
  ]);
  // supports dot notation via only()
  assert.equal(pluck(users, ['name', 'stats.age']), [
    {name: 'John', age: 45},
    {name: 'Jane', age: 39},
  ]);
  // supports renaming via only()
  assert.equal(pluck(users, ['name', 'stats.age:years']), [
    {name: 'John', years: 45},
    {name: 'Jane', years: 39},
  ]);
});

test('safe', async () => {
  // error path (handler called)
  const errorFn = snoop(async () => fail());
  const errorHandler = snoop(noop);
  await safe(errorFn.fn, errorHandler.fn)();
  assert.ok(errorFn.called);
  assert.ok(errorHandler.called);
  // success path (handler not called)
  const successFn = snoop(async () => 'ok');
  const successHandler = snoop(noop);
  await safe(successFn.fn, successHandler.fn)();
  assert.ok(successFn.called);
  assert.not.ok(successHandler.called);
  // args forwarded to fn
  const argFn = snoop(async (a, b) => a + b);
  const argHandler = snoop(noop);
  await safe(argFn.fn, argHandler.fn)(1, 2);
  assert.equal(argFn.firstCall.arguments, [1, 2]);
});

test('settled', async () => {
  const [res,] = await settled(Promise.resolve('Success'));
  assert.equal(res, 'Success');
  const [,err] = await settled(Promise.reject('Fail'));
  assert.equal(err, 'Fail');
  const data = await settled(Promise.resolve({message: 'Hello'}), ({value}) => value);
  assert.equal(data.message, 'Hello');
});

test('slug', () => {
  assert.is(slug('  Hello  World  '), 'hello-world');
  assert.is(slug('dashes--and_underscores'), 'dashes-and_underscores');
  assert.is(slug('--Special!@#$%Characters--'), 'specialcharacters');
  assert.is(slug('MiXeD CaSe 123'), 'mixed-case-123');
  assert.is(slug(123), '123');
});

test('template', () => {
  // template string with interpolation
  assert.is(template('<span>{{ name }}</span>', {name: 'Nik'}), '<span>Nik</span>');
  // template string with evaluation
  assert.is(template('{# for (var i = 0; i < n; i++) { #}<i>{{ i }}</i>{# } #}', {n: 3}), '<i>0</i><i>1</i><i>2</i>');

  // returns a reusable function when no data is passed
  const render = template('<div>{{ x }}</div>');
  assert.type(render, 'function');
  assert.is(render({x: 'a'}), '<div>a</div>');
  assert.is(render({x: 'b'}), '<div>b</div>');

  const script = html`
  <script type="text/template" id="example">
    <p>{{ content }}</p>
  </script>`

  document.body.append(script);
  assert.is(template('#example', {content: 'Lorem ipsum dolor'}), '<p>Lorem ipsum dolor</p>');

  // selector returns a cached function
  const a = template('#example');
  const b = template('#example');
  assert.is(a, b);

  script.remove();
});

test('toBoolean', () => {
  assert.is(toBoolean(true), true);
  assert.is(toBoolean(false), false);
  // truthy strings
  assert.is(toBoolean('true'), true);
  assert.is(toBoolean('yes'), true);
  assert.is(toBoolean('1'), true);
  assert.is(toBoolean('TRUE'), true);
  assert.is(toBoolean('anything'), true);
  // falsy strings
  assert.is(toBoolean('false'), false);
  assert.is(toBoolean('no'), false);
  assert.is(toBoolean('0'), false);
  assert.is(toBoolean('null'), false);
  assert.is(toBoolean('undefined'), false);
  // non-boolean, non-string values use Boolean()
  assert.is(toBoolean(0), false);
  assert.is(toBoolean(1), true);
  assert.is(toBoolean(42), true);
  assert.is(toBoolean(''), false);
  assert.is(toBoolean(null), false);
  assert.is(toBoolean(undefined), false);
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

test('toRGB', () => {
  assert.equal(toRGB('#ff0000'), [255, 0, 0]);
  assert.equal(toRGB('FF0000'),  [255, 0, 0]);
  assert.equal(toRGB('#00ff00'), [0, 255, 0]);
  assert.equal(toRGB('#0000ff'), [0, 0, 255]);
  assert.equal(toRGB('#ffffff'), [255, 255, 255]);
  assert.equal(toRGB('#000000'), [0, 0, 0]);
  assert.equal(toRGB('#1a2b3c'), [26, 43, 60]);
  // shorthand and invalid inputs return null
  assert.is(toRGB('#fff'), null);
  assert.is(toRGB('abc'), null);
  assert.is(toRGB(''), null);
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
  assert.is(toRelativeTime(now - 1 * 7 * 24 * 60 * 60 * 1000), '1 week ago');
  assert.is(toRelativeTime(now - 2 * 30 * 24 * 60 * 60 * 1000), '2 months ago');
  assert.is(toRelativeTime(now - 3 * 365 * 24 * 60 * 60 * 1000), '3 years ago');
  // future
  assert.is(toRelativeTime(now + 45 * 1000), 'in 45 seconds');
  assert.is(toRelativeTime(now + 10 * 60 * 1000), 'in 10 minutes');
  assert.is(toRelativeTime(now + 1 * 24 * 60 * 60 * 1000), 'in 1 day');
  assert.is(toRelativeTime(now + 2 * 7 * 24 * 60 * 60 * 1000), 'in 2 weeks');
});

test('traverse', () => {
  const node = document.createElement('div');
  node.innerHTML = /* html */`
  <header>
    <h1>Hello</h1>
  </header>
  <main>
    <p>Lorem <strong>ipsum</strong> dolor</p>
    <ul>
      <li>Minnesota</li>
      <li>Colorado</li>
    </ul>
  </main>`

  const tags = [];
  const text = [];
  traverse(node, el => tags.push(el.nodeName.toLowerCase()));
  traverse(node, el => text.push(el.wholeText?.trim()), NodeFilter.SHOW_TEXT);
  assert.equal(tags.join(' '), 'div header h1 main p strong ul li li');
  assert.equal(text.filter(Boolean).join(' '), 'Hello Lorem ipsum dolor Minnesota Colorado');
});

test('validate', () => {
  const rules = {
    email    : (value) => /.+@.+\..+/.test(value) || 'invalid email',
    password : (value) => value?.length >= 8 || 'too short',
    confirm  : (value, data) => value === data.password || 'must match',
  };

  let errors = validate({email: 'hello@exmple.com', password: 'password', confirm: 'password'}, rules)
  assert.is(errors, null);

  errors = validate({name: ' Nik '}, {name: value => value === 'Nik' || 'Not trimmed'});
  assert.is(errors, null);

  errors = validate({email: 'bad', password: 'abc', confirm: '123'}, rules);
  assert.is(errors.email, 'invalid email');
  assert.is(errors.password, 'too short');
  assert.is(errors.confirm, 'must match');

  // rule returning true means valid
  assert.is(validate({x: false}, {x: () => true}), null);

  // object error merges into errors
  const objRules = {field: () => ({a: 'error a', b: 'error b'})};
  assert.equal(validate({field: ''}, objRules), {a: 'error a', b: 'error b'});
});

test('wrap', () => {
  assert.is(wrap(0, 3), 0);
  assert.is(wrap(2, 3), 2);
  assert.is(wrap(3, 3), 0);
  assert.is(wrap(5, 3), 2);
  assert.is(wrap(-1, 3), 2);
  assert.is(wrap(-4, 3), 2);
  assert.is(wrap(-1, ['a', 'b', 'c']), 2);
  assert.is(wrap(3,  ['a', 'b', 'c']), 0);
});

test.run();
