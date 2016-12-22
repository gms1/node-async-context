import { ContinuationLocalStorage } from '../ContinuationLocalStorage';

class MyLocalStorage {
  value: number;
}

let cls = new ContinuationLocalStorage<MyLocalStorage>();

describe('testing readme sample', () => {

  it('should succeed', () => {
    process.nextTick(() => {
      cls.setData({ value: 1});  // value should be 1 in the current execution context and below
      process.nextTick(() => {
        let curr1 = cls.getData(); // value is 1
        expect(curr1 ? curr1.value : undefined).toBe(1);
        cls.setData({ value: 2});  // value should be 2 in the current execution context and below
        process.nextTick(() => {
          let curr2 = cls.getData(); // value is 2
          expect(curr2 ? curr2.value : undefined).toBe(2);
        });
      });
      process.nextTick(() => {
        let curr3 = cls.getData(); // value is 1
        expect(curr3 ? curr3.value : undefined).toBe(1);
      });
    });
  });
});



