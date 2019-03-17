[![npm version](https://badge.fury.io/js/asyncctx.svg)](https://badge.fury.io/js/asyncctx)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/node-async-context/badge.svg)](https://snyk.io/test/github/gms1/node-async-context)
[![Build Status](https://api.travis-ci.org/gms1/node-async-context.svg?branch=master)](https://travis-ci.org/gms1/node-async-context)
[![Coverage Status](https://coveralls.io/repos/github/gms1/node-async-context/badge.svg?branch=master)](https://coveralls.io/github/gms1/node-async-context?branch=master)
[![Dependency Status](https://david-dm.org/gms1/node-async-context.svg)](https://david-dm.org/gms1/node-async-context)
[![Greenkeeper badge](https://badges.greenkeeper.io/gms1/node-async-context.svg)](https://greenkeeper.io/)

# node-async-context (asyncctx)

This module allows you to create an asynchronous execution context for JavaScript or TypeScript

> NOTE: This module is based on [async_hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md) an experimental built-in node.js module introduced in v8.0.0

> NOTE: Your contribution is highly welcome!

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

| Release  | Notes                                                                                   |
| -------- | --------------------------------------------------------------------------------------- |
| 2.0.3-5  | maintenance release                                                                     |
| 2.0.2    | fixed loosing context; thanks to Pasi Tuominen                                          |
| 2.0.1    | maintenance release                                                                     |
| 2.0.0    | targeting es2015; dropped support for nodejs < v8                                       |
|          | please use asyncctx@<2.0 for nodejs v4 - v11 support                                    |
| 1.1.0    | fixed support for nodes < v8                                                            |
| 1.0.5-10 | maintenance release                                                                     |
| 1.0.4    | node 10                                                                                 |
| 1.0.3    | node 9                                                                                  |
| 1.0.2    | maintenance release                                                                     |
| 1.0.1    | added support for older nodejs versions (4,6,7) using internal copy of async-hook@1.7.1 |
| 1.0.0    | is now based on 'async_hooks' (a built-in nodejs v8.0 module)                           |
| 0.0.6    | maintenance releases                                                                    |
| 0.0.5    | async-hook 1.7.1                                                                        |
| 0.0.1-4  | initial version                                                                         |
