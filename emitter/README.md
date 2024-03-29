# Emitter

A simple event emitter class, similar to [tiny-emitter](https://www.npmjs.com/package/tiny-emitter) and [mitt](https://www.npmjs.com/package/mitt).

```bash
npm install @tmbr/emitter
```

```js
import Emitter from '@tmbr/emitter';

const emitter = new Emitter();

function callback(e) {
  alert(`Hello, ${e.name}!`);
}

// subscribe to an event
emitter.on('example', callback);

// dispatch an event with data
emitter.emit('example', {name: 'World'});

// unsubscribe from an event
emitter.off('example', callback);

// unsubscribe from an event with the returned cleanup function
const off = emitter.on('example', e => alert(`Hello, ${e.name}!`));
off();

// destroy and remove all subscriptions
emitter.destroy();
```
