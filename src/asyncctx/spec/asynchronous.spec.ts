/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import * as fs from 'fs';

import { AsynchronousLocalStorage } from '../AsynchronousLocalStorage';

const cls: AsynchronousLocalStorage<Number> = new AsynchronousLocalStorage<Number>();

const DODEBUG = 0;

function debugId(prefix: string): void {
  if (!DODEBUG) {
    return;
  }
  console.log('TEST: ' + prefix);
}

// #######################################################################################################################

describe('test asynchronous:', () => {
  it('calling process.nextTick should preserve continuation local storage', (done) => {
    debugId('process.nextTick: START BEGIN');
    const startValue = 211;
    expect(cls.setContext(startValue))
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    debugId('process.nextTick: START END  ');
    process.nextTick(() => {
      debugId('process.nextTick: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue))
        .withContext(`outer value (${outerValue}) not set`)
        .toBe(outerValue);
      debugId('process.nextTick: OUTER END  ');
      process.nextTick(() => {
        debugId('process.nextTick: INNER BEGIN');
        expect(cls.getContext())
          .withContext(`inner value is not the expected outer value (${outerValue})`)
          .toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue))
          .withContext(`inner value (${innerValue}) not set`)
          .toBe(innerValue);
        debugId('process.nextTick: INNER END  ');
        done();
      });
    });
  });

  it('calling setImmediate should preserve continuation local storage', (done) => {
    debugId('setImmediate: START BEGIN');
    const startValue = 221;
    expect(cls.setContext(startValue))
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    debugId('setImmediate: START END  ');
    setImmediate(() => {
      debugId('setImmediate: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue))
        .withContext(`outer value (${outerValue}) not set`)
        .toBe(outerValue);
      debugId('setImmediate: OUTER END  ');
      setImmediate(() => {
        debugId('setImmediate: INNER BEGIN');
        expect(cls.getContext())
          .withContext(`inner value is not the expected outer value (${outerValue})`)
          .toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue))
          .withContext(`inner value (${innerValue}) not set`)
          .toBe(innerValue);
        debugId('setImmediate: INNER END  ');
        done();
      });
    });
  });

  it('calling setTimeout should preserve continuation local storage', (done) => {
    debugId('setTimeout: START BEGIN');
    const startValue = 231;
    expect(cls.setContext(startValue))
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    debugId('setTimeout: START END  ');
    setTimeout(() => {
      debugId('setTimeout: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue))
        .withContext(`outer value (${outerValue}) not set`)
        .toBe(outerValue);
      debugId('setTimeout: OUTER END  ');
      setTimeout(() => {
        debugId('setTimeout: INNER BEGIN');
        expect(cls.getContext())
          .withContext(`inner value is not the expected outer value (${outerValue})`)
          .toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue))
          .withContext(`inner value (${innerValue}) not set`)
          .toBe(innerValue);
        debugId('setTimeout: INNER END  ');
        done();
      }, 0);
    }, 0);
  });

  it('calling setInterval should preserve continuation local storage', (done) => {
    debugId('setInterval: START BEGIN');
    const startValue = 241;
    expect(cls.setContext(startValue))
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    debugId('setInterval: START END  ');
    const timer1 = setInterval(() => {
      debugId('setInterval: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue))
        .withContext(`outer value (${outerValue}) not set`)
        .toBe(outerValue);
      debugId('setInterval: OUTER END  ');
      clearInterval(timer1);
      const timer2 = setInterval(() => {
        debugId('setInterval: INNER BEGIN');
        expect(cls.getContext())
          .withContext(`inner value is not the expected outer value (${outerValue})`)
          .toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue))
          .withContext(`inner value (${innerValue}) not set`)
          .toBe(innerValue);
        debugId('setInterval: INNER END  ');
        clearInterval(timer2);
        done();
      }, 100);
    }, 100);
  });

  it('calling fs should preserve continuation local storage', (done) => {
    debugId('fs: START BEGIN');
    const startValue = 251;
    expect(cls.setContext(startValue))
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    debugId('fs: START END  ');
    fs.access(__filename, () => {
      debugId('fs: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      const outerValue = startValue + 1;
      expect(cls.setContext(outerValue))
        .withContext(`outer value (${outerValue}) not set`)
        .toBe(outerValue);
      debugId('fs: OUTER END  ');
      fs.access(__filename, () => {
        debugId('fs: INNER BEGIN');
        expect(cls.getContext())
          .withContext(`inner value is not the expected outer value (${outerValue})`)
          .toBe(outerValue);
        const innerValue = outerValue + 1;
        expect(cls.setContext(innerValue))
          .withContext(`inner value (${innerValue}) not set`)
          .toBe(innerValue);
        debugId('fs: INNER END  ');
        done();
      });
    });
  });

  // NOTES:
  // the executor function of the top most Promise is running synchronously
  //   see: https://github.com/nodejs/node-eps/pull/18
  // so the cls-context inside this executor function is the same as the
  // cls-context of the caller

  it('chained promises should preserve continuation local storage', () => {
    debugId('promise: START BEGIN');
    const startValue = 261;
    let outerValue: number;
    let innerValue: number;
    let innermostValue: number;
    expect(cls.setContext(startValue))
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    debugId('promise: START END  ');
    return new Promise<number>((resolve, reject) => {
      debugId('promise: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);

      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      outerValue = startValue;

      debugId('promise: OUTER END  ');
      resolve(outerValue);
    })
      .then((val) => {
        debugId('promise: OUTER THEN');
        return new Promise<number>((resolve, reject) => {
          debugId('promise: INNER BEGIN');
          expect(cls.getContext())
            .withContext(`inner value is not the expected outer value (${outerValue})`)
            .toBe(outerValue);
          innerValue = outerValue + 1;
          expect(cls.setContext(innerValue))
            .withContext(`inner value (${innerValue}) not set`)
            .toBe(innerValue);
          debugId('promise: INNER END  ');
          resolve(innerValue);
        }).then((val2) => {
          debugId('promise: INNER THEN');
          return new Promise<number>((resolve, reject) => {
            debugId('promise: INNERMOST BEGIN');
            expect(cls.getContext())
              .withContext(`innermost value is not the expected inner value (${innerValue})`)
              .toBe(innerValue);
            innermostValue = innerValue + 1;
            expect(cls.setContext(innermostValue))
              .withContext(`innermost value (${innermostValue}) not set`)
              .toBe(innermostValue);
            debugId('promise: INNERMOST END  ');
            resolve(innermostValue);
          });
        });
      })
      .then((val) => {
        return val;
      })
      .catch((err) => {
        fail(err);
      });
  });

  it('promise returned from promise executor function should preserve continuation local storage', async () => {
    debugId('promise: START');
    debugId('promise: START BEGIN');
    const startValue = 271;
    let outerValue = 0;
    let innerValue = 0;

    cls.setContext(startValue);
    expect(cls.getContext())
      .withContext(`start value (${startValue}) not set`)
      .toBe(startValue);
    await new Promise<number>((resolve1, reject1) => {
      debugId('promise: OUTER BEGIN');
      expect(cls.getContext())
        .withContext(`outer value is not the expected start value (${startValue})`)
        .toBe(startValue);
      cls.setContext(startValue + 1);
      outerValue = cls.getContext() as number;
      return new Promise<number>((resolve2, reject2) => {
        debugId('promise: INNER BEGIN');
        expect(cls.getContext())
          .withContext(`outer value is not the expected start value (${outerValue})`)
          .toBe(outerValue);
        cls.setContext(outerValue + 1);
        innerValue = cls.getContext() as number;
        resolve2(42);
      }).then(() => {
        resolve1(24);
      }); // <= resolving is requried
    })
      .catch((err) => {
        fail(err);
      })
      .then((val) => {
        return val;
      });
    expect(cls.getContext())
      .withContext(`start context value is not updated to inner value (${innerValue})`)
      .toBe(innerValue);
  });
});
