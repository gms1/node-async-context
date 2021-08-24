import { AsyncLocalStorage } from 'async_hooks';

/**
 *
 *
 * @export
 * @class AsynchronousLocalStorage
 * @template T
 */
export class AsynchronousLocalStorage<T> extends AsyncLocalStorage<T> {
  /**
   * Get the current execution context data
   *
   * @returns {(T|undefined)}
   */
  public getContext(): T | undefined {
    return this.getStore();
  }

  /**
   * Set the current execution context data
   *
   * @param {T} value
   * @returns {(T)}
   */
  public setContext(value: T): T {
    this.enterWith(value);
    return value;
  }
}
