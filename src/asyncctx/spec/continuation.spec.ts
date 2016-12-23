import { ContinuationLocalStorage } from '../ContinuationLocalStorage';

import * as fs from 'fs';


let cls: ContinuationLocalStorage<Number>;

const DODEBUG = 0;

function debugUid(prefix: string): void {
  if (!DODEBUG) {
    return;
  }
  cls.debugUid(prefix);
}

describe('test continuation:', () => {

  beforeEach((done) => {
    if (cls) {
      cls.dispose();
    }
    cls = new ContinuationLocalStorage<Number>();
    ContinuationLocalStorage.disable();
    done();
  });

  it('calling process.nextTick should preserve continuation local storage',
    async (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 11;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      process.nextTick(() => {
        debugUid('OUTER BEGIN');
        const outerUid = cls.currUid;
        const outerPreviousUid = cls.getPreviousUid();
        expect(outerPreviousUid).toBe(startUid, `previous uid (${outerPreviousUid}) is not the expected start uid (${startUid})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugUid('OUTER END  ');
        process.nextTick(() => {
          debugUid('INNER BEGIN');
          const innerUid = cls.currUid;
          const innerPreviousUid = cls.getPreviousUid();
          expect(innerPreviousUid).toBe(outerUid, `previous uid (${innerPreviousUid}) is not the expected outer uid (${outerUid})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugUid('INNER END  ');
          ContinuationLocalStorage.disable();
          done();
        });
      });
    });

  it('calling setImmediate should preserve continuation local storage',
    async (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 21;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      setImmediate(() => {
        debugUid('OUTER BEGIN');
        const outerUid = cls.currUid;
        const outerPreviousUid = cls.getPreviousUid();
        expect(outerPreviousUid).toBe(startUid, `previous uid (${outerPreviousUid}) is not the expected start uid (${startUid})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugUid('OUTER END  ');
        setImmediate(() => {
          debugUid('INNER BEGIN');
          const innerUid = cls.currUid;
          const innerPreviousUid = cls.getPreviousUid();
          expect(innerPreviousUid).toBe(outerUid, `previous uid (${innerPreviousUid}) is not the expected outer uid (${outerUid})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugUid('INNER END  ');
          ContinuationLocalStorage.disable();
          done();
        });
      });
    });

  it('calling setTimeout should preserve continuation local storage',
    async (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 31;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      setTimeout(() => {
        debugUid('OUTER BEGIN');
        const outerUid = cls.currUid;
        const outerPreviousUid = cls.getPreviousUid();
        expect(outerPreviousUid).toBe(startUid, `previous uid (${outerPreviousUid}) is not the expected start uid (${startUid})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugUid('OUTER END  ');
        setTimeout(() => {
          debugUid('INNER BEGIN');
          const innerUid = cls.currUid;
          const innerPreviousUid = cls.getPreviousUid();
          expect(innerPreviousUid).toBe(outerUid, `previous uid (${innerPreviousUid}) is not the expected outer uid (${outerUid})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugUid('INNER END  ');
          ContinuationLocalStorage.disable();
          done();
        }, 0);
      }, 0);
    });

  it('calling setInterval should preserve continuation local storage',
    async (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 41;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      const timer1 = setInterval(() => {
        debugUid('OUTER BEGIN');
        const outerUid = cls.currUid;
        const outerPreviousUid = cls.getPreviousUid();
        expect(outerPreviousUid).toBe(startUid, `previous uid (${outerPreviousUid}) is not the expected start uid (${startUid})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugUid('OUTER END  ');
        clearInterval(timer1);
        const timer2 = setInterval(() => {
          debugUid('INNER BEGIN');
          const innerUid = cls.currUid;
          const innerPreviousUid = cls.getPreviousUid();
          expect(innerPreviousUid).toBe(outerUid, `previous uid (${innerPreviousUid}) is not the expected outer uid (${outerUid})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugUid('INNER END  ');
          clearInterval(timer2);
          ContinuationLocalStorage.disable();
          done();
        }, 100);
      }, 100);
    });

  it('calling fs should preserve continuation local storage',
    async (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 51;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      fs.access(__filename, () => {
        debugUid('OUTER BEGIN');
        const outerUid = cls.currUid;
        const outerPreviousUid = cls.getPreviousUid();
        expect(outerPreviousUid).toBe(startUid, `previous uid (${outerPreviousUid}) is not the expected start uid (${startUid})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugUid('OUTER END  ');
        fs.access(__filename, () => {
          debugUid('INNER BEGIN');
          const innerUid = cls.currUid;
          const innerPreviousUid = cls.getPreviousUid();
          expect(innerPreviousUid).toBe(outerUid, `previous uid (${innerPreviousUid}) is not the expected outer uid (${outerUid})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugUid('INNER END  ');
          ContinuationLocalStorage.disable();
          done();
        });
      });
    });

  it('promise should preserve continuation local storage',
    (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 61;
      let outerValue: number;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      new Promise((resolve, reject) => {
        debugUid('OUTER BEGIN');
        const outerUid = cls.currUid;
        const outerPreviousUid = cls.getPreviousUid();
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);

        // unexpected behaviour using promises!!!
        // The executor function is running synchronously
        //   see: https://github.com/nodejs/node-eps/pull/18
        expect(outerUid).toBe(startUid, `my uid (${outerUid}) is not the expected start uid (${startUid})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        outerValue = startValue;

        debugUid('OUTER END  ');
        resolve(outerUid);
      }).then((val) => {
        return new Promise((resolve, reject) => {
          debugUid('INNER BEGIN');
          const innerUid = cls.currUid;
          const innerPreviousUid = cls.getPreviousUid();
          expect(innerPreviousUid).toBe(val, `previous uid (${innerPreviousUid}) is not the expected outer uid (${val})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugUid('INNER END  ');
          resolve(innerUid);
        });
      }).then((val) => {
        ContinuationLocalStorage.disable();
        done();
        return val;
      }).catch((err) => {
        ContinuationLocalStorage.disable();
        fail(err);
      });
    });

  it('awaited promise should preserve continuation local storage',
    async (done) => {
      ContinuationLocalStorage.enable();
      debugUid('START BEGIN');
      const startUid = cls.currUid;
      const startValue = 71;
      let outerValue: number;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugUid('START END  ');
      try {
        await new Promise((resolve, reject) => {
          debugUid('OUTER BEGIN');
          const outerUid = cls.currUid;
          const outerPreviousUid = cls.getPreviousUid();
          expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);

          // unexpected behaviour using promises!!!
          // The executor function is running synchronously
          //   see: https://github.com/nodejs/node-eps/pull/18
          expect(outerUid).toBe(startUid, `my uid (${outerUid}) is not the expected start uid (${startUid})`);
          expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
          outerValue = startValue;

          debugUid('OUTER END  ');
          resolve(outerUid);
        }).then((val) => {
          return new Promise((resolve, reject) => {
            debugUid('INNER BEGIN');
            const innerUid = cls.currUid;
            const innerPreviousUid = cls.getPreviousUid();
            expect(innerPreviousUid).toBe(val, `previous uid (${innerPreviousUid}) is not the expected outer uid (${val})`);
            expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
            const innerValue = outerValue + 1;
            expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
            debugUid('INNER END  ');
            resolve(innerUid);
          });
        });
        debugUid('END');
        ContinuationLocalStorage.disable();
        done();
      } catch (err) {
        ContinuationLocalStorage.disable();
        fail(err);
      }
    });

});
