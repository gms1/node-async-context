// tslint:disable: no-null-keyword
// tslint:disable-next-line: no-require-imports no-var-requires
const asyncHook = require('async-hook');

type initFunc = (uid: number, handle: any, provider: number, parentUid: number | null, parentHandle: any) => void;
type preFunc = (uid: number) => void;
type postFunc = (uid: number, didThrow: boolean) => void;
type destroyFunc = (uid: number) => void;

interface HookFuncs { init: initFunc; pre: preFunc; post: postFunc; destroy: destroyFunc; };

const MAIN_UID = 0;

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
  /**
   *
   *
   * @readonly
   * @type {number}
   */
  public get currUid(): number { return this._currUid; }

  private uidStack: Array<number>;
  private uidHookMap: Map<number, HookInfo<T>>;

  private deleteOnPostHack: boolean;
  /*
    see related issue: https://github.com/AndreasMadsen/async-hook/issues/12
  */

  private hooks: HookFuncs;
  private node_process: any = process;

  /**
   * Creates an instance of ContinuationLocalStorage.
   *
   */
  public constructor() {
    this._currUid = MAIN_UID;
    this.uidStack = [ MAIN_UID ];
    this.uidHookMap = new Map<number, HookInfo<T>>();
    this.uidHookMap.set(MAIN_UID, { uid: MAIN_UID, handle: undefined, provider: 0, previousUid: undefined, previousHook: undefined });
    this.deleteOnPostHack = false;
    this.hooks = {
        init: (uid, handle, provider, parentUid, parentHandle) => {
        // a new async handle gets initialized:

        let previousUid = parentUid === null ? this._currUid : parentUid;
        // tslint:disable triple-equals
        let previousHook = previousUid != undefined ? this.uidHookMap.get(previousUid) : undefined;

        this.uidHookMap.set(uid, { uid, handle, provider, previousUid, previousHook });
        // this.debugUid('init', uid);
        if (previousUid && !previousHook) {
          this.node_process._rawDebug(`init: WARNING: uid: ${previousUid} is not registered (3)`);
        }
      },
      pre: (uid) => {
        // an async handle starts
        this._currUid = uid;
        this.uidStack.push(this._currUid);
        let hi = this.uidHookMap.get(uid);
        if (hi) {
          hi.data = hi.previousHook ? hi.previousHook.data : undefined;
          if (!hi.previousHook) {
            this.node_process._rawDebug(`pre : WARNING: uid: ${hi.previousUid} is not registered (2)`);
          }
        // } else {
        //   this.node_process._rawDebug(`pre : WARNING: uid: ${this._currUid} is not registered (1)`);
        }
      },
      post: (uid, didThrow) => {
        // an async handle ends
        if (uid === this.uidStack[this.uidStack.length - 1]) {
          this.uidStack.pop();
          this._currUid = this.uidStack[this.uidStack.length - 1];
          if (this.deleteOnPostHack) {
            this.uidHookMap.delete(uid);
            this.deleteOnPostHack = false;
          }
        }
      },
      destroy: (uid) => {
        // an async handle gets destroyed
        // this.debugUid('destroy', uid);
        if (this.uidHookMap.has(uid)) {
           if (uid === this._currUid) {
             //
             this.deleteOnPostHack = true;
           } else {
             this.uidHookMap.delete(uid);
           }
        }
      }
    };
    asyncHook.addHooks(this.hooks);
    ContinuationLocalStorage.enable();
  }

  /**
   * Get the data stored on current execution context
   *
   * @param {number} [uid=this.currUid]
   * @returns {(T|undefined)}
   */
  public getData(uid: number = this.currUid): T|undefined {
    let hi = this.uidHookMap.get(uid);
    return hi ? hi.data : undefined;
  }

  /**
   * Set the data to store on current execution context
   *
   * @param {T} value
   * @param {number} [uid=this.currUid]
   * @returns {(T|undefined)}
   */
  public setData(value: T, uid: number = this.currUid): T|undefined {
    let hi = this.uidHookMap.get(uid);
    if (!hi) {
      if (!uid) {
        throw new Error('setData must be called in an async context!');
      }
      return undefined;
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
  public getPreviousUid(uid: number = this.currUid): number|undefined {
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
      let funcName;
      if (hi.handle) {
        if (hi.handle.constructor) {
          funcName = hi.handle.constructor.name;
        } else if (typeof hi.handle === 'function' && hi.handle.name ) {
          funcName = hi.handle.name;
        } else {
          funcName = hi.handle.toString().trim().match(/^function\s*([^\s(]+)/)[1];
        }
      }
      let data = hi.data ? hi.data.toString() : 'undefined';
      this.node_process._rawDebug(`${prefix}: uid: ${uid}  previousUid: ${hi.previousUid} ${funcName} (${data})`);
    } else {
      this.node_process._rawDebug(`${prefix}: uid: ${uid}`);
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
