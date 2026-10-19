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

  mount() {
    console.log('mount', this.el);
  }

  unmount() {
    console.log('unmount', this.el);
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

## Lifecycle

Subclasses can define optional `mount()` and `unmount()` hooks. `mount()` runs at the end of the constructor, once `this.dom`, `this.props`, and `this.state` are ready. `unmount()` runs when `destroy()` is called, before the component event listeners and directives are removed.

## State

State is deeply reactive so mutations to nested objects and arrays trigger a render.

```js
class Form extends Component {
  static state = {
    fields: {name: '', email: ''},
    errors: {}
  };
}
```

```html
<input type="text" :model="fields.name" />
<span :text="errors.name"></span>
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

## Scope

Nested components can read and write ancestor state via `scope`:

```html
<div data-state="{type: null}">
  <div data-state="{open: false}" @click.outside="open = false">
    <button type="button" aria-controls="example" :aria-expanded="open" @click="open = !open">
      <span :text="scope.type ?? 'Select Type'"></span>
    </button>
    <menu id="example">
      <li><button type="button" @click="scope.type = 'standard'">Standard</button></li>
      <li><button type="button" @click="scope.type = 'delux'">Delux</button></li>
    </menu>
  </div>
</div>
```

Parent components must be instantiated before their children. When a parent's state changes, any child that has accessed `scope` is automatically re-rendered.

## DOM References

Elements with a `data-dom` attribute are collected into `this.dom`. Multiple elements with the same name are grouped into an array. Use bracket syntax `data-dom="[items]"` or `data-dom="items[]"` to force an array even with a single element.

```html
<div>
  <input data-dom="input" />
  <ul>
    <li data-dom="[items]">one</li>
    <li data-dom="[items]">two</li>
  </ul>
</div>
```

```js
this.dom.input // input
this.dom.items // [li, li]
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

## Instance API

| Property or Method                | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `el`                              | root element                                        |
| `dom`                             | child elements collected from `data-dom` attributes |
| `props`                           | parsed from `data-props` attribute                  |
| `state`                           | reactive proxy where changes trigger a rerender     |
| `findOne(selector)`               | scoped `querySelector`                              |
| `findAll(selector)`               | scoped `querySelectorAll`                           |
| `mount()`                         | called after constructor — define in subclass       |
| `update(state)`                   | called after each render — define in subclass       |
| `unmount()`                       | called by `destroy()` — define in subclass          |
| `on(event, target, fn, scope)`    | delegate event listener, cleaned up on `.destroy()` |
| `dispatch(type, detail, options)` | dispatches a `CustomEvent` from `.el`               |
| `destroy()`                       | calls `unmount()`, removes listeners and directives |
| `destroyed`                       | `true` after `destroy()` has been called            |
