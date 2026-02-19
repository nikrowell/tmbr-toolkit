# Component

A base class for enhancing DOM elements with reactive state, similar to [Alpine.js](https://alpinejs.dev/) and [petite-vue](https://github.com/vuejs/petite-vue), but without loops and conditionals.

```bash
npm install @tmbr/component
```

## Simple

Define state inline with a `data-state` attribute.

```html
<div data-state="{count: 0}">
  <button type="button" @click="count--">Remove</button>
  <span :text="count"></span>
  <button type="button" @click="count++">Add</button>
</div>
```
```js
document.querySelectorAll('[data-state]').forEach(el => {
  new Component(el);
});
```

## Extended

Subclass `Component` to define reusable components with DOM refs, methods, and lifecycle hooks.

```html
<div id="counter">
  <button type="button" @click="dec" :disabled="count <= 0">Remove</button>
  <span :text="count"></span>
  <button type="button" @click="inc">Add</button>
  <span :show="count >= 10">Count is dangerously high</span>
</div>
```
```js
class Counter extends Component {

  static state = {
    count: 0
  };

  init() {
    console.log('mounted', this.el);
  }

  inc() {
    this.state.count++;
  }

  dec() {
    this.state.count--;
  }

  update(state) {
    console.log('updated', state.count);
  }
}

new Counter('#counter');
```

## Directives

Directives are expressions evaluated with the current state.

| Directive                    | Effect                                                        |
| -----------------------------| --------------------------------------------------------------|
| `:text`                      | sets `textContent`                                            |
| `:html`                      | sets `innerHTML`                                              |
| `:show`                      | toggles `display: none`                                       |
| `:value`                     | sets `.value` on inputs (one-way)                             |
| `:model`                     | two-way binding for form elements                             |
| `:class`                     | merges classes from a string, array, or `{name: bool}` object |
| `:disabled`, `:hidden`, etc. | boolean attributes — set when truthy, removed when falsy      |
| `:attribute`                 | `setAttribute` fallback for any other attribute               |

## Events

Events are attached with `@event.modifier="handler"` where handler is an expression or component method.

| Modifier    | Effect                                                |
| ----------- | ----------------------------------------------------- |
| `.prevent`  | calls `preventDefault()`                              |
| `.stop`     | calls `stopPropagation()`                             |
| `.self`     | only fires when `event.target` is the current element |
| `.once`     | auto-removes after first invocation                   |
| `.passive`  | passive event listener                                |
| `.capture`  | capture phase listener                                |
| `.outside`  | fires on events outside the element                   |
| `.window`   | listens to `window`                                   |
| `.document` | listens to `document`                                 |

## Refs

Elements with a `ref` attribute are collected into `this.dom`. Multiple elements with the same name are grouped into an array. Use bracket syntax `ref="[items]"` to force an array even with a single element.

```html
<div>
  <input ref="input" />
  <ul>
    <li ref="[items]">one</li>
    <li ref="[items]">two</li>
  </ul>
</div>
```

## Computed

Getters on the subclass expose derived values that are accessible in template expressions and the `update()` hook.

```js
class Example extends Component {

  static state = {
    name: 'Jane Doe'
  };

  get firstName() {
    return this.state.name.split(' ')[0];
  }
}
```

```html
<input type="text" :model="name" />
First name is <span :text="firstName"></span>
```

```js
this.dom.input // input
this.dom.items // [li, li]
```

## Instance API

| Property or Method                | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `el`                              | root element                                        |
| `dom`                             | child elements collected from `ref` attributes      |
| `props`                           | parsed from `data-props` attribute                  |
| `state`                           | reactive proxy where changes trigger a rerender     |
| `findOne(selector)`               | scoped `querySelector`                              |
| `findAll(selector)`               | scoped `querySelectorAll`                           |
| `init()`                          | called after constructor — override in subclass     |
| `update(state)`                   | called after each render — override in subclass     |
| `on(event, target, fn)`           | delegate event listener, cleaned up on `.destroy()` |
| `dispatch(type, detail, options)` | dispatches a `CustomEvent` from `.el`               |
| `destroy()`                       | removes all listeners and directives                |
