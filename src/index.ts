export class Completer<T = void> {
  public readonly promise = new Promise<T>((resolve, reject) => {
    this._complete = resolve;
    this._completeError = reject;
  });

  public get isCompleted(): boolean {
    return this._isCompleted;
  }
  private _isCompleted = false;

  public _complete!: (value: PromiseLike<T> | T) => void;
  public _completeError!: (reason?: any) => void;

  public complete(value: T | PromiseLike<T>) {
    if (this._isCompleted) return;
    this._complete.call(this, value);
    this._isCompleted = true;
  }

  public completeError(reason?: any) {
    if (this._isCompleted) return;
    this._completeError.call(this, reason);
    this._isCompleted = true;
  }
}
