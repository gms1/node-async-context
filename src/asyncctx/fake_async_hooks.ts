// tslint:disable: no-require-imports no-var-requires
const asyncHook = require('./async-hook/index.js');

const ROOT_UID = 1;

interface InternalHooks {
  init(id: number, handle: any, provider: number, triggerId: number|null, parentHandle: any): void;
  pre(id: number): void;
  post(id: number): void;
  destroy(id: number): void;
}


interface ExternalHooks {
  init(id: number, type: string, triggerId: number): void;
  before(id: number): void;
  after(id: number): void;
  destroy(id: number): void;
}

class FakeAsyncHooks {
  private static internalHooksEnabled: boolean = false;
  private static providers: string[];

  private readonly internalHooks: InternalHooks;
  private enabled: boolean;
  private currId: number;

  constructor(private readonly externalHooks: ExternalHooks) {
    if (!FakeAsyncHooks.providers) {
      FakeAsyncHooks.providers = Object.keys(asyncHook.providers).map((key) => key);
    }
    this.enabled = false;
    this.currId = ROOT_UID;
    this.internalHooks = {
      init: (id: number, handle: any, provider: number, parentId: number | null, parentHandle: any): void => {
        // TODO: set type
        if (this.enabled) {
          // tslint:disable-next-line: triple-equals strict-type-predicates no-null-keyword
          this.externalHooks.init(id, FakeAsyncHooks.providers[provider], parentId !== null ? parentId : this.currId);
        }
      },
      pre: (id: number): void => {
        this.currId = id;
        if (this.enabled) {
          this.externalHooks.before(id);
        }
      },
      post: (id: number): void => {
        if (id === this.currId) {
          this.currId = ROOT_UID;
        }
        if (this.enabled) {
          this.externalHooks.after(id);
        }
      },
      destroy: (id: number): void => {
        if (this.enabled) {
          this.externalHooks.destroy(id);
        }
      }
    };
    asyncHook.addHooks(this.internalHooks);
  }

  enable(): void {
    this.enabled = true;
    if (!FakeAsyncHooks.internalHooksEnabled) {
      asyncHook.enable();
      FakeAsyncHooks.internalHooksEnabled = true;
    }
  }
  disable(): void {
    this.enabled = false;
  }

  dispose(): void {
    asyncHook.removeHooks(this.internalHooks);
  }
}


export function createHook(hooks: any): any {
  return new FakeAsyncHooks(hooks);
}
