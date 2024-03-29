# node-async-context (asyncctx)

**THIS PROJECT HAS BEEN MOVED!**

**THE NEW LOCATION IS HERE: [asyncctx](https://github.com/gms1/HomeOfThings/tree/master/packages/node/asyncctx)**


[![npm version](https://badge.fury.io/js/asyncctx.svg)](https://badge.fury.io/js/asyncctx)
[![Build Workflow](https://github.com/gms1/node-async-context/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/node-async-context/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/node-async-context/branch/master/graph/badge.svg)](https://codecov.io/gh/gms1/node-async-context)
[![Dependency Status](https://david-dm.org/gms1/node-async-context.svg)](https://david-dm.org/gms1/node-async-context)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/node-async-context/badge.svg)](https://snyk.io/test/github/gms1/node-async-context)

![NPM](https://img.shields.io/npm/l/asyncctx)

This module allows you to create an asynchronous execution context for JavaScript or TypeScript

> NOTE: This module is based on [async_hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md) an experimental built-in node.js module introduced in v8.0.0

## Deprecation
<!-- -->
> NOTE: This module is now deprecated in favour of [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_new_asynclocalstorage)
> which is available for nodejs >= 12

### quick start using AsyncLocalStorage

```Typescript
 class ContinuationLocalStorage<T> extends AsyncLocalStorage<T> {
   public getContext(): T | undefined {
      return this.getStore();
    }
    public setContext(value: T): T {
      this.enterWith(value);
      return value;
    }
  }
```

## Introduction

To give you an idea of how **asyncctx** is supposed to be used:

```TypeScript
import { ContinuationLocalStorage } from 'asyncctx';

class MyLocalStorage {
  value: number;
}

let cls = new ContinuationLocalStorage<MyLocalStorage>();
cls.setRootContext({ value: 1});

process.nextTick(() => {
  let curr1 = cls.getContext(); // value is 1
  cls.setContext({ value: 2});  // value should be 2 in the current execution context and below
  process.nextTick(() => {
    let curr2 = cls.getContext(); // value is 2
    cls.setContext({ value: 3});  // value should be 3 in the current execution context and below
    process.nextTick(() => {
      let curr3 = cls.getContext(); // value is 3
    });
  });
  process.nextTick(() => {
    let curr4 = cls.getContext(); // value is 2
  });
});
```

## License

**node-async-context (asyncctx)** is licensed under the MIT License:
[LICENSE](./LICENSE)

## Release Notes

| Release   | Notes                                                                                   |
|-----------|-----------------------------------------------------------------------------------------|
| 2.0.18-19 | deprecated in favour of AsyncLocalStorage                                               |
| 2.0.12-17 | maintenance release, nodejs 14 support                                                  |
| 2.0.11    | #54: fixed memory leak for chaining asynchronous calls infinitely; thanks to Reko Tiira |
| 2.0.10    | maintenance release                                                                     |
| 2.0.9     | node 13 supported                                                                       |
| 2.0.3-8   | maintenance release                                                                     |
| 2.0.2     | #47: fixed loosing context for unknown resource types; thanks to Pasi Tuominen          |
| 2.0.1     | maintenance release                                                                     |
| 2.0.0     | targeting es2015; dropped support for nodejs < v8                                       |
|           | please use asyncctx@<2.0 for nodejs v4 - v11 support                                    |
| 1.1.0     | fixed support for nodes < v8                                                            |
| 1.0.5-10  | maintenance release                                                                     |
| 1.0.4     | node 10 supported                                                                       |
| 1.0.3     | node 9 supported                                                                        |
| 1.0.2     | maintenance release                                                                     |
| 1.0.1     | added support for older nodejs versions (4,6,7) using internal copy of async-hook@1.7.1 |
| 1.0.0     | is now based on 'async_hooks' (a built-in nodejs v8.0 module)                           |
| 0.0.6     | maintenance releases                                                                    |
| 0.0.5     | async-hook 1.7.1                                                                        |
| 0.0.1-4   | initial version                                                                         |
