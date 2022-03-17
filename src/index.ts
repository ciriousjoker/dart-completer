export class Completer<T = void> implements Promise<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
    // return this as unknown as Promise<TResult1 | TResult2>;
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult> {
    return this.promise.catch(onrejected);
    // return this;
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    this.promise.finally(onfinally);
    return this;
  }

  get [Symbol.toStringTag]() {
    return 'Completer';
  }

  public readonly promise = new Promise<T>((resolve, reject) => {
    this._resolve = resolve;
    this._reject = reject;
  });

  public get isCompleted(): boolean {
    return this._isCompleted;
  }
  private _isCompleted = false;

  private _resolve!: (value: PromiseLike<T> | T) => void;
  private _reject!: (reason?: any) => void;

  public complete(value: T | PromiseLike<T>) {
    if (this._isCompleted) return;
    this._resolve(value);
    this._isCompleted = true;
  }

  public async completeError(reason?: any) {
    if (this._isCompleted) return;
    this._reject(reason);
    this._isCompleted = true;
  }
}
