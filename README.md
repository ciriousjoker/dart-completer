# Dart Completer

[![npm](https://img.shields.io/npm/l/dart-completer.svg)](https://github.com/ciriousjoker/dart-completer/blob/main/LICENSE)
![npm](coverage/badge.svg)

A Typescript port of Dart's Completer.

Use it like a `Promise` that you can complete from the outside.

Note that you can only complete a `Completer` once, either by calling `.complete()` or `.completeError()`.
Subsequent calls to `.complete()` or `.completeError()` are ignored.

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
