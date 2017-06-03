// tslint:disable: no-unused-variable
import { ContinuationLocalStorage } from '../ContinuationLocalStorage';

import * as fs from 'fs';


let cls: ContinuationLocalStorage<Number>;

const DODEBUG = 0;

function debugId(prefix: string): void {
  if (!DODEBUG) {
    return;
  }
  cls.debugId(prefix);
}

describe('test continuation:', () => {

  beforeEach((done) => {
    if (cls) {
      cls.dispose();
    }
    cls = new ContinuationLocalStorage<Number>();
    cls.disable();
    done();
  });

  it('calling process.nextTick should preserve continuation local storage',
    async (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 11;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      process.nextTick(() => {
        debugId('OUTER BEGIN');
        const outerId = cls.currId;
        const outerPreviousId = cls.getTriggerId();
        expect(outerPreviousId).toBe(startId, `previous id (${outerPreviousId}) is not the expected start id (${startId})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugId('OUTER END  ');
        process.nextTick(() => {
          debugId('INNER BEGIN');
          const innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId, `previous id (${innerPreviousId}) is not the expected outer id (${outerId})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugId('INNER END  ');
          cls.disable();
          done();
        });
      });
    });

  it('calling setImmediate should preserve continuation local storage',
    async (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 21;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      setImmediate(() => {
        debugId('OUTER BEGIN');
        const outerId = cls.currId;
        const outerPreviousId = cls.getTriggerId();
        expect(outerPreviousId).toBe(startId, `previous id (${outerPreviousId}) is not the expected start id (${startId})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugId('OUTER END  ');
        setImmediate(() => {
          debugId('INNER BEGIN');
          const innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId, `previous id (${innerPreviousId}) is not the expected outer id (${outerId})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugId('INNER END  ');
          cls.disable();
          done();
        });
      });
    });

  it('calling setTimeout should preserve continuation local storage',
    async (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 31;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      setTimeout(() => {
        debugId('OUTER BEGIN');
        const outerId = cls.currId;
        const outerPreviousId = cls.getTriggerId();
        expect(outerPreviousId).toBe(startId, `previous id (${outerPreviousId}) is not the expected start id (${startId})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugId('OUTER END  ');
        setTimeout(() => {
          debugId('INNER BEGIN');
          const innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId, `previous id (${innerPreviousId}) is not the expected outer id (${outerId})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugId('INNER END  ');
          cls.disable();
          done();
        }, 0);
      }, 0);
    });

  it('calling setInterval should preserve continuation local storage',
    async (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 41;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      const timer1 = setInterval(() => {
        debugId('OUTER BEGIN');
        const outerId = cls.currId;
        const outerPreviousId = cls.getTriggerId();
        expect(outerPreviousId).toBe(startId, `previous id (${outerPreviousId}) is not the expected start id (${startId})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugId('OUTER END  ');
        clearInterval(timer1);
        const timer2 = setInterval(() => {
          debugId('INNER BEGIN');
          const innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId, `previous id (${innerPreviousId}) is not the expected outer id (${outerId})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugId('INNER END  ');
          clearInterval(timer2);
          cls.disable();
          done();
        }, 100);
      }, 100);
    });

  it('calling fs should preserve continuation local storage',
    async (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 51;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      fs.access(__filename, () => {
        debugId('OUTER BEGIN');
        const outerId = cls.currId;
        const outerPreviousId = cls.getTriggerId();
        expect(outerPreviousId).toBe(startId, `previous id (${outerPreviousId}) is not the expected start id (${startId})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        const outerValue = startValue + 1;
        expect(cls.setContext(outerValue)).toBe(outerValue, `outer value (${outerValue}) not set`);
        debugId('OUTER END  ');
        fs.access(__filename, () => {
          debugId('INNER BEGIN');
          const innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(outerId, `previous id (${innerPreviousId}) is not the expected outer id (${outerId})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugId('INNER END  ');
          cls.disable();
          done();
        });
      });
    });

  it('promise should preserve continuation local storage',
    (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 61;
      let outerValue: number;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      return new Promise<number>((resolve, reject) => {
        debugId('OUTER BEGIN');
        const outerId = cls.currId;
        const outerPreviousId = cls.getTriggerId();
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);

        // unexpected behaviour using promises!!!
        // The executor function is running synchronously
        //   see: https://github.com/nodejs/node-eps/pull/18
        expect(outerId).toBe(startId, `my id (${outerId}) is not the expected start id (${startId})`);
        expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
        outerValue = startValue;

        debugId('OUTER END  ');
        resolve(outerId);
      }).then((val) => {
        return new Promise<number>((resolve, reject) => {
          debugId('INNER BEGIN');
          const innerId = cls.currId;
          const innerPreviousId = cls.getTriggerId();
          expect(innerPreviousId).toBe(val, `previous id (${innerPreviousId}) is not the expected outer id (${val})`);
          expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
          const innerValue = outerValue + 1;
          expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
          debugId('INNER END  ');
          resolve(innerId);
        });
      }).then((val) => {
        cls.disable();
        done();
        return val;
      }).catch((err) => {
        cls.disable();
        fail(err);
      });
    });

  it('awaited promise should preserve continuation local storage',
    async (done) => {
      cls.enable();
      debugId('START BEGIN');
      const startId = cls.currId;
      const startValue = 71;
      let outerValue: number;
      expect(cls.setRootContext(startValue)).toBe(startValue, `start value (${startValue}) not set`);
      debugId('START END  ');
      try {
        await new Promise<number>((resolve, reject) => {
          debugId('OUTER BEGIN');
          const outerId = cls.currId;
          const outerPreviousId = cls.getTriggerId();
          expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);

          // unexpected behaviour using promises!!!
          // The executor function is running synchronously
          //   see: https://github.com/nodejs/node-eps/pull/18
          expect(outerId).toBe(startId, `my id (${outerId}) is not the expected start id (${startId})`);
          expect(cls.getContext()).toBe(startValue, `outer value is not the expected start value (${startValue})`);
          outerValue = startValue;

          debugId('OUTER END  ');
          resolve(outerId);
        }).then((val) => {
          return new Promise<number>((resolve, reject) => {
            debugId('INNER BEGIN');
            const innerId = cls.currId;
            const innerPreviousId = cls.getTriggerId();
            expect(innerPreviousId).toBe(val, `previous id (${innerPreviousId}) is not the expected outer id (${val})`);
            expect(cls.getContext()).toBe(outerValue, `inner value is not the expected outer value (${outerValue})`);
            const innerValue = outerValue + 1;
            expect(cls.setContext(innerValue)).toBe(innerValue, `inner value (${innerValue}) not set`);
            debugId('INNER END  ');
            resolve(innerId);
          });
        });
        debugId('END');
        cls.disable();
        done();
      } catch (err) {
        cls.disable();
        fail(err);
      }
    });

});
