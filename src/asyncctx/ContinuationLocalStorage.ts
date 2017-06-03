// tslint:disable: no-null-keyword
// tslint:disable-next-line: no-require-imports no-var-requires
const asyncHooks = require('async_hooks');

type initFunc = (id: number, type: string, triggerId: number) => void;
type beforeFunc = (id: number) => void;
type afterFunc = (id: number) => void;
type destroyFunc = (id: number) => void;

interface HookFuncs { init: initFunc; before: beforeFunc; after: afterFunc; destroy: destroyFunc; }
interface HookInstance { enable(): void; disable(): void; }

let nodeproc: any = process;

const ROOT_ID = 1;

interface HookInfo<T> {
  id: number;
  type: string;
  triggerId: number;
  triggerHook?: HookInfo<T>;
  data?: T;
}


/**
 *
 *
 * @export
 * @class ContinuationLocalStorage
 * @template T
 */
export class ContinuationLocalStorage<T> {

  private _currId: number;
  public get currId(): number { return this._currId; }

  private idHookMap: Map<number, HookInfo<T>>;

  private hookFuncs: HookFuncs;

  private hookInstance: HookInstance;

  /**
   * Creates an instance of ContinuationLocalStorage.
   *
   */
  public constructor() {
    this._currId = ROOT_ID;
    this.idHookMap = new Map<number, HookInfo<T>>();
    this.idHookMap.set(ROOT_ID, { id: ROOT_ID, type: 'C++', triggerId: 0});
    this.hookFuncs = {
      init: (id, type, triggerId) => {
        // a new async handle gets initialized:

        // tslint:disable-next-line strict-type-predicates
        if (triggerId == null) {
          triggerId = this._currId;
        }
        let triggerHook = this.idHookMap.get(triggerId);
        if (triggerId && !triggerHook) {
          // nodeproc._rawDebug(`init:   id: ${id}: WARNING: triggerId: ${triggerId} is not registered (3)`);
          // nodeproc._rawDebug(`  currId: ${this.currId}  or ${asyncHooks.currentId()}`);
          triggerId = ROOT_ID;
          triggerHook = this.idHookMap.get(triggerId);
        }
        this.idHookMap.set(id, { id, type, triggerId, triggerHook });
        // this.debugId('init', id);
      },
      before: (id) => {
        // an async handle starts
        this._currId = id;
        let hi = this.idHookMap.get(id);
        if (hi) {
          hi.data = hi.triggerHook ? hi.triggerHook.data : undefined;
        } else {
          this._currId = ROOT_ID;
        }
        // this.debugId('before', id);
      },
      after: (id) => {
        // an async handle ends
        if (id === this._currId) {
          this._currId = ROOT_ID;
        }
        // this.debugId('after', id);
      },
      destroy: (id) => {
        // an async handle gets destroyed
        // this.debugid('destroy', id);
        if (this.idHookMap.has(id)) {
          if (id === this._currId) {
            nodeproc._rawDebug(`asyncctx: destroy hook called for current context (id: ${this.currId})!`);
          }
          this.idHookMap.delete(id);
        }
      }
    };
    this.hookInstance = asyncHooks.createHook(this.hookFuncs) as HookInstance;
    this.enable();
  }

  /**
   * Get the current execution context data
   *
   * @returns {(T|undefined)}
   */
  public getContext(): T | undefined {
    let hi = this.idHookMap.get(this.currId);
    return hi ? hi.data : undefined;
  }

  /**
   * Set the current execution context data
   *
   * @param {T} value
   * @returns {(T)}
   */
  public setContext(value: T): T {
    if (!this.currId || this.currId === ROOT_ID) {
      throw new Error(`setContext must be called in an async context (${this.currId})!`);
    }
    let hi = this.idHookMap.get(this.currId);
    if (!hi) {
      throw new Error('setContext must be called in an async context (2)!');
    }
    hi.data = value;
    return value;
  }

  /**
   * Get the root execution context data
   *
   * @returns {(T|undefined)}
   */
  public getRootContext(): T | undefined {
    let hi = this.idHookMap.get(ROOT_ID);
    if (!hi) {
      throw new Error('internal error: root node not found (1)!');
    }
    return hi ? hi.data : undefined;
  }

  /**
   * Set the root execution context data
   *
   * @param {T} value
   * @returns {(T)}
   */
  public setRootContext(value: T): T {
    let hi = this.idHookMap.get(ROOT_ID);
    if (!hi) {
      throw new Error('internal error: root node not found (2)!');
    }
    hi.data = value;
    return value;
  }


  /**
   * Get the id of the caller (for debugging purpose)
   *
   * @param {number} [id=this.currId]
   * @returns {(number|undefined)}
   */
  public getTriggerId(id: number = this.currId): number | undefined {
    let hi = this.idHookMap.get(id);
    return hi ? hi.triggerId : undefined;
  }



  /**
   * debug output
   *
   * @param {string} prefix
   * @param {number} [id=this.currId]
   */
  public debugId(prefix: string, id: number = this.currId): void {
    let hi = this.idHookMap.get(id);
    if (hi) {
      let data: string = 'undefined';
      if (hi.data) {
        try {
          data = JSON.stringify(hi.data);
        } catch (_ignore) {
          data = hi.data.toString();
        }
      }
      nodeproc._rawDebug(`${prefix}: id: ${id} trigger: ${hi.type}/${hi.triggerId} (${data})`);
    } else {
      nodeproc._rawDebug(`${prefix}: id: ${id}`);
    }
  }


  /**
   * clean up
   */
  public dispose(): void {
    // asyncHook.removeHooks(this.hooks);
    this.disable();
    this.idHookMap.clear();
  }


  /**
   * enable AsyncWrap globally
   *
   */
  public enable(): void {
    this.hookInstance.enable();
  }

  /**
   * disable AsyncWrap globally
   *
   */
  public disable(): void {
    this.hookInstance.disable();
  }


}
