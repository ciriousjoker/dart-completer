import { Completer } from "../src";

type TestValue = "Hello World!";
const value: TestValue = "Hello World!";

test("Complete via timeout.", async () => {
  const completer = new Completer();

  let check = false;

  setTimeout(() => {
    check = true;
    completer.complete();
  }, 100);

  expect(completer.isCompleted).toBe(false);
  await completer.promise;
  expect(completer.isCompleted).toBe(true);

  expect(check).toBe(true);
});

test("Complete via timeout with value.", async () => {
  const completer = new Completer<TestValue>();

  setTimeout(() => {
    completer.complete(value);
  }, 100);

  expect(await completer.promise).toStrictEqual(value);
});

test("Complete via timeout with promise.", async () => {
  const completer = new Completer<TestValue>();
  const completer2 = new Completer<TestValue>();

  setTimeout(() => {
    completer.complete(completer2.promise);
  }, 100);

  setTimeout(() => {
    completer2.complete(value);
  }, 200);

  expect(await completer.promise).toStrictEqual(value);
});

test("Complete via timeout with promise (reverse).", async () => {
  const value: TestValue = "Hello World!";

  const completer = new Completer<TestValue>();
  const completer2 = new Completer<TestValue>();

  setTimeout(() => {
    completer.complete(completer2.promise);
  }, 200);

  setTimeout(() => {
    completer2.complete(value);
  }, 100);

  expect(await completer.promise).toStrictEqual(value);
});

test("Complete immediately, if the completer has already been commpleted.", async () => {
  const completer = new Completer();
  completer.complete();
  expect(completer.isCompleted).toBe(true);

  let check = false;

  setTimeout(() => {
    check = true;
  }, 1);

  await completer.promise;

  expect(check).toBe(false);
});

test("Don't crash when trying to complete() or completeError() twice.", async () => {
  const completer = new Completer();
  completer.complete();

  try {
    completer.complete();
    completer.completeError();
    expect(completer.isCompleted).toBe(true);
  } catch (e) {
    fail();
  }
});

test("Throw after completeError()", async () => {
  const completer = new Completer();

  const error = "Some error message.";

  setTimeout(() => {
    completer.completeError(error);
  }, 100);

  try {
    await completer.promise;
    fail();
  } catch (e) {
    expect(e).toStrictEqual(error);
  }
  expect(completer.isCompleted).toBe(true);
});
