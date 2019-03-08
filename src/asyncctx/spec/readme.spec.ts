// tslint:disable prefer-const
import { ContinuationLocalStorage } from '../ContinuationLocalStorage';

class MyLocalStorage {
  value?: number;
}

const cls = new ContinuationLocalStorage<MyLocalStorage>();
cls.disable();

cls.setRootContext({ value: 1 });

const DODEBUG = 0;

function debugId(prefix: string): void {
  if (!DODEBUG) {
    return;
  }
  cls.debugId(prefix);
}

describe('testing readme sample', () => {
  it('should succeed', (done) => {
    cls.enable();
    let cnt = 0;
    process.nextTick(() => {
      debugId('TICK 1.0.0 START');
      let curr1 = cls.getContext(); // value is 1
      expect(curr1 ? curr1.value : undefined).toBe(1);
      cls.setContext({ value: 2 }); // value should be 2 in the current execution context and below
      process.nextTick(() => {
        debugId('TICK 1.1.0 START');
        let curr2 = cls.getContext(); // value is 2
        expect(curr2 ? curr2.value : undefined).toBe(2);
        cls.setContext({ value: 3 }); // value should be 3 in the current execution context and below
        process.nextTick(() => {
          debugId('TICK 1.1.1 START');
          let curr3 = cls.getContext(); // value is 3
          expect(curr3 ? curr3.value : undefined).toBe(3);
          debugId('TICK 1.1.1 END');
          if (++cnt === 4) {
            cls.disable();
            done();
          }
        });
        debugId('TICK 1.1.0 END  ');
        if (++cnt === 4) {
          cls.disable();
          done();
        }
      });
      process.nextTick(() => {
        debugId('tick 1.2.0 START');
        let curr4 = cls.getContext(); // value is 2
        expect(curr4 ? curr4.value : undefined).toBe(2);
        debugId('tick 1.2.0 END  ');
        if (++cnt === 4) {
          cls.disable();
          done();
        }
      });
      debugId('TICK 1.0.0 END  ');
      if (++cnt === 4) {
        cls.disable();
        done();
      }
    });
  });
});
