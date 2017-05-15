// tslint:disable: no-null-keyword
// tslint:disable-next-line: no-require-imports no-var-requires
const asyncHook = require('async-hook');

type initFunc = (uid: number, handle: any, provider: number, parentUid: number | null, parentHandle: any) => void;
type preFunc = (uid: number) => void;
type postFunc = (uid: number, didThrow: boolean) => void;
type destroyFunc = (uid: number) => void;

interface HookFuncs { init: initFunc; pre: preFunc; post: postFunc; destroy: destroyFunc; }

let nodeproc: any = process;

const ROOT_UID = 0;

interface HookInfo<T> {
  uid: number;
  handle: any;
  provider: number;
  previousUid?: number;
  previousHook?: HookInfo<T>;
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

  private _currUid: number;
  public get currUid(): number { return this._currUid; }

  private uidHookMap: Map<number, HookInfo<T>>;

  private hooks: HookFuncs;

  /**
   * Creates an instance of ContinuationLocalStorage.
   *
   */
  public constructor() {
    this._currUid = ROOT_UID;
    this.uidHookMap = new Map<number, HookInfo<T>>();
    this.uidHookMap.set(ROOT_UID, { uid: ROOT_UID, handle: undefined, provider: 0, previousUid: undefined, previousHook: undefined });
    this.hooks = {
      init: (uid, handle, provider, parentUid, parentHandle) => {
        // a new async handle gets initialized:

        // tslint:disable-next-line strict-type-predicates
        let previousUid = parentUid !== null ? parentUid : this._currUid;
        let previousHook = this.uidHookMap.get(previousUid);

        this.uidHookMap.set(uid, { uid, handle, provider, previousUid, previousHook });
        if (previousUid && !previousHook) {
          nodeproc._rawDebug(`init: WARNING: uid: ${previousUid} is not registered (3)`);
        }
        // this.debugUid('init', uid);
      },
      pre: (uid) => {
        // an async handle starts
        this._currUid = uid;
        let hi = this.uidHookMap.get(uid);
        if (hi) {
          hi.data = hi.previousHook ? hi.previousHook.data : undefined;
          if (!hi.previousHook) {
            nodeproc._rawDebug(`pre : WARNING: uid: ${hi.previousUid} is not registered (2)`);
          }
          // } else {
          //   this.nodeproc._rawDebug(`pre : WARNING: uid: ${this._currUid} is not registered (1)`);
        }
        // this.debugUid('pre', uid);
      },
      post: (uid, didThrow) => {
        // an async handle ends
        if (uid === this._currUid) {
          this._currUid = ROOT_UID;
        }
        // this.debugUid('post', uid);
      },
      destroy: (uid) => {
        // an async handle gets destroyed
        // this.debugUid('destroy', uid);
        if (this.uidHookMap.has(uid)) {
          if (uid === this._currUid) {
            nodeproc._rawDebug(`asyncctx: destroy hook called for current context (${this.currUid})!`);
          }
          this.uidHookMap.delete(uid);
        }
      }
    };
    asyncHook.addHooks(this.hooks);
    ContinuationLocalStorage.enable();
  }

  /**
   * Get the current execution context data
   *
   * @returns {(T|undefined)}
   */
  public getContext(): T | undefined {
    let hi = this.uidHookMap.get(this.currUid);
    return hi ? hi.data : undefined;
  }

  /**
   * Set the current execution context data
   *
   * @param {T} value
   * @returns {(T)}
   */
  public setContext(value: T): T {
    if (!this.currUid || this.currUid === ROOT_UID) {
      throw new Error(`setContext must be called in an async context (${this.currUid})!`);
    }
    let hi = this.uidHookMap.get(this.currUid);
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
    let hi = this.uidHookMap.get(ROOT_UID);
    if (!hi) {
      throw new Error('internal error: root node not found (1)!');
    }
    return hi ? hi.data : undefined;
  }

  /**
   * Set the current execution context data
   *
   * @param {T} value
   * @returns {(T)}
   */
  public setRootContext(value: T): T {
    let hi = this.uidHookMap.get(ROOT_UID);
    if (!hi) {
      throw new Error('internal error: root node not found (2)!');
    }
    hi.data = value;
    return value;
  }


  /**
   * Get the Uid of the caller (for debugging purpose)
   *
   * @param {number} [uid=this.currUid]
   * @returns {(number|undefined)}
   */
  public getPreviousUid(uid: number = this.currUid): number | undefined {
    let hi = this.uidHookMap.get(uid);
    return hi ? hi.previousUid : undefined;
  }



  /**
   * debug output
   *
   * @param {string} prefix
   * @param {number} [uid=this.currUid]
   */
  public debugUid(prefix: string, uid: number = this.currUid): void {
    let hi = this.uidHookMap.get(uid);
    if (hi) {
      let funcName: string | undefined;
      if (hi.handle) {
        if (hi.handle.constructor) {
          funcName = hi.handle.constructor.name;
        } else if (typeof hi.handle === 'function' && hi.handle.name) {
          funcName = hi.handle.name;
        } else {
          funcName = hi.handle.toString().trim().match(/^function\s*([^\s(]+)/)[1];
        }
      }
      let data: string = 'undefined';
      if (hi.data) {
        try {
          data = JSON.stringify(hi.data);
        } catch (_ignore) {
          data = hi.data.toString();
        }
      }
      nodeproc._rawDebug(`${prefix}: uid: ${uid}  previousUid: ${hi.previousUid} ${funcName} (${data})`);
    } else {
      nodeproc._rawDebug(`${prefix}: uid: ${uid}`);
    }
  }


  /**
   * clean up
   */
  public dispose(): void {
    asyncHook.removeHooks(this.hooks);
    this.uidHookMap.clear();
  }


  /**
   * enable AsyncWrap globally
   *
   * @static
   */
  public static enable(): void {
    asyncHook.enable();
  }

  /**
   * disable AsyncWrap globally
   *
   * @static
   */
  public static disable(): void {
    asyncHook.disable();
  }


}
