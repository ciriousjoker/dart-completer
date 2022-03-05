# dart-completer

[![npm](https://img.shields.io/npm/l/dart-completer.svg)](https://www.npmjs.com/package/dart-completer)
[![npm](./coverage/badge.svg)](./LICENSE)

A Typescript port of Dart's Completer.

### Usage

#### Without value

```ts
const completer = new Completer();

setTimeout(() => {
  completer.complete();
}, 1000);

await completer.promise; // => Completes after 1 second.
```

#### With value

```ts
const completer = new Completer<string>();

setTimeout(() => {
  completer.complete("done.");
}, 1000);

const result = await completer.promise; // => result == "done."
```
