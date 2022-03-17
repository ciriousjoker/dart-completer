import { Completer } from "../src";

type TestValue = "Hello World!";
const value: TestValue = "Hello World!";

test("Complete via timeout.", async () => {
  await testVariant(async variant => {
    const completer = new Completer();

    let check = false;

    setTimeout(() => {
      check = true;
      completer.complete();
    }, 100);

    expect(completer.isCompleted).toBe(false);
    await promiseFrom(completer, variant);
    expect(completer.isCompleted).toBe(true);

    expect(check).toBe(true);
  });
});

test("Complete via timeout with value.", async () => {
  await testVariant(async variant => {
    const completer = new Completer<TestValue>();

    setTimeout(() => {
      completer.complete(value);
    }, 100);

    const result = await promiseFrom(completer, variant);
    expect(result).toStrictEqual(value);
  });
});

test("Complete via timeout with promise.", async () => {
  await testVariant(async variant => {
    const completer = new Completer<TestValue>();
    const completer2 = new Completer<TestValue>();

    setTimeout(() => {
      completer.complete(completer2);
    }, 100);

    setTimeout(() => {
      completer2.complete(value);
    }, 200);

    const result = await promiseFrom(completer, variant);
    expect(result).toStrictEqual(value);
  });
});

test("Complete via timeout with promise (reverse).", async () => {
  await testVariant(async variant => {
    const value: TestValue = "Hello World!";

    const completer = new Completer<TestValue>();
    const completer2 = new Completer<TestValue>();

    setTimeout(() => {
      completer.complete(completer2);
    }, 200);

    setTimeout(() => {
      completer2.complete(value);
    }, 100);

    const result = await promiseFrom(completer, variant);
    expect(result).toStrictEqual(value);
  });
});

test("Complete immediately, if the completer has already been commpleted.", async () => {
  await testVariant(async variant => {
    const completer = new Completer();
    completer.complete();
    expect(completer.isCompleted).toBe(true);

    let check = false;

    setTimeout(() => {
      check = true;
    }, 0);

    await promiseFrom(completer, variant);

    expect(check).toBe(false);
  });
});


test("Don't crash when trying to complete()/completeError() after complete().", async () => {
  await testVariant(async variant => {
    const completer = new Completer();
    completer.complete();


    setTimeout(() => {
      completer.complete();
    }, 100);

    try {
      await promiseFrom(completer, variant);
      expect(completer.isCompleted).toBe(true);
      completer.complete();
      completer.completeError();
    } catch (e) {
      fail();
    }
    await promiseFrom(completer, variant);

    expect(completer.isCompleted).toBe(true);
  });
});


test("Don't crash when trying to complete()/completeError() after completeError().", async () => {
  await testVariant(async variant => {
    const completer = new Completer();

    const error1 = "This should be thrown";
    const error2 = "This should be ignored";

    setTimeout(() => {
      completer.completeError(error1);
      completer.completeError(error2);
      completer.complete();
    }, 100);

    try {
      await promiseFrom(completer, variant);
      fail();
    } catch (e) {
      expect(e).toStrictEqual(error1);
    }

    expect(completer.isCompleted).toBe(true);
  });
});

test("completeError() should throw.", async () => {
  await testVariant(async variant => {
    const completer = new Completer();

    const error = "Some error message.";

    setTimeout(() => {
      completer.completeError(error);
    }, 100);

    try {
      await promiseFrom(completer, variant);
      fail();
    } catch (e) {
      expect(e).toStrictEqual(error);
    }
    expect(completer.isCompleted).toBe(true);
  });
});

test(".then()", async () => {
  await testVariant(async variant => {
    const completer = new Completer<string>();

    const val = "this should be returned in .then()";

    setTimeout(() => {
      completer.complete(val);
    }, 100);

    let isThenCalled = false;

    // Check if .catch() and .finally() is called
    promiseFrom(completer, variant).then(v => {
      isThenCalled = true;
      expect(completer.isCompleted).toBe(true);
      expect(v).toStrictEqual(val);
    });

    await promiseFrom(completer, variant);

    expect(completer.isCompleted).toBe(true);
    expect(isThenCalled).toBe(true);
  });
});

test(".catch(), .finally()", async () => {
  await testVariant(async variant => {
    const completer = new Completer();

    const error = "Some error message.";

    setTimeout(() => {
      completer.completeError(error);
    }, 100);

    let isCatchCalled = false;
    let isFinallyCalled = false;

    try {
      // This needs to be awaited so finally has time to run.
      await promiseFrom(completer, variant).catch(e => {
        isCatchCalled = true;
        expect(completer.isCompleted).toBe(true);
        expect(e).toStrictEqual(error);
      }).finally(() => {
        isFinallyCalled = true;
        expect(completer.isCompleted).toBe(true);
      });
    } catch (_) { }

    expect(completer.isCompleted).toBe(true);
    expect(isCatchCalled).toBe(true);
    expect(isFinallyCalled).toBe(true);
  });
});

test(".finally()", async () => {
  await testVariant(async variant => {
    const completer = new Completer();

    setTimeout(() => {
      completer.complete();
    }, 100);

    let isFinallyCalled = false;

    const test = promiseFrom(completer, variant);

    // Check if .catch() and .finally() is called
    completer.finally(() => {
      isFinallyCalled = true;
      expect(completer.isCompleted).toBe(true);
    });

    try {
      // This just makes sure the test doesn't fail due to an unhandled rejection
      await promiseFrom(completer, variant);
    } catch (_) { }

    expect(completer.isCompleted).toBe(true);
    expect(isFinallyCalled).toBe(true);
  });
});

test("toString()", async () => {
  expect(new Completer().toString()).toEqual("[object Completer]");
});

/** Test multiple variants with the same general code. */
async function testVariant(fn: (variant: Variant) => void): Promise<void> {
  await fn(Variant.completer);
  await fn(Variant.promise);
  await fn(Variant.thencatch);
  return;
}

/** `await completer;` or `await completer.promise;` based on variant. */
function promiseFrom<T>(completer: Completer<T>, variant: Variant): Promise<T> {
  if (variant === Variant.completer) return completer;
  if (variant === Variant.promise) return completer.promise;
  if (variant === Variant.thencatch) {
    return new Promise(async (resolve, reject) => {
      completer.promise.then(resolve).catch(reject);
    });
  }
  throw new Error("Unknown variant.");
}

function fail() {
  expect(true).toBe(false);
}

enum Variant {
  completer,
  promise,
  thencatch,
}
