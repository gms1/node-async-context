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


export class ContinuationLocalStorage<T> {
  private type: { new (): T };

  private _currUid: number;
  public get currUid(): number { return this._currUid; }

  private uidStack: Array<number>;
  private uidHookMap: Map<number, HookInfo<T>>;

  private deleteOnPostHack: boolean;
  /*
    see related issue: https://github.com/AndreasMadsen/async-hook/issues/12
  */

  private hooks: HookFuncs;

  /**
   * Creates an instance of ContinuationLocalStorage.
   *
   * @param {{new (): T}} type - The class mapped to the base table
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
          this.debugWarning('init', `uid: ${previousUid} is not registered (3)`);
        }
      },
      pre: (uid) => {
        // an async handle starts
        // this.debugCurrUidChange('pre ', this._currUid, '=>', uid);
        this._currUid = uid;
        this.uidStack.push(this._currUid);
        let hi = this.getHookInfo();
        if (hi) {
          hi.data = hi.previousHook ? hi.previousHook.data : undefined;
          if (!hi.previousHook) {
            this.debugWarning('pre ', `uid: ${hi.previousUid} is not registered (2)`);
          }
        // } else {
        //   this.debugWarning('pre ', `uid: ${this._currUid} is not registered (1)`);
        }
      },
      post: (uid, didThrow) => {
        // an async handle ends
        if (uid === this.uidStack[this.uidStack.length - 1]) {
          this.uidStack.pop();
          // this.debugCurrUidChange('post', this.uidStack[this.uidStack.length - 1], '<=', uid);
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

  public getData(uid: number = this.currUid): T|undefined {
    let hi = this.uidHookMap.get(uid);
    return hi ? hi.data : undefined;
  }

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

  public getPreviousUid(uid: number = this.currUid): number|undefined {
    let hi = this.getHookInfo(uid);
    return hi ? hi.previousUid : undefined;
  }


  public debugCurrUidChange(prefix: string, uid1: number|undefined, sign: string, uid2: number|undefined): void {
      (process as any)._rawDebug(`${prefix}: uid: ${uid1} ${sign} ${uid2}`);
  }

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
      (process as any)._rawDebug(`${prefix}: uid: ${uid}  previousUid: ${hi.previousUid} ${funcName} (${data})`);
    } else {
      (process as any)._rawDebug(`${prefix}: uid: ${uid}`);
    }
  }

  public debugWarning(prefix: string, msg: string): void {
    (process as any)._rawDebug(`${prefix}: WARNING: ${msg}`);
  }


  public dispose(): void {
    asyncHook.removeHooks(this.hooks);
    this.uidHookMap.clear();
  }

  private getHookInfo(uid: number = this.currUid): HookInfo<T>|undefined {
    return this.uidHookMap.get(uid);
  }

  public static enable(): void {
    asyncHook.enable();
  }

  public static disable(): void {
    asyncHook.disable();
  }


}
