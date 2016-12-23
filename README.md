[![Build Status](https://api.travis-ci.org/gms1/node-async-context.svg?branch=master)](https://travis-ci.org/gms1/node-async-context)
[![npm version](https://badge.fury.io/js/asyncctx.svg)](https://badge.fury.io/js/asyncctx)
[![Dependency Status](https://david-dm.org/gms1/node-async-context.svg)](https://david-dm.org/gms1/node-async-context)
[![devDependency Status](https://david-dm.org/gms1/node-async-context/dev-status.svg)](https://david-dm.org/gms1/node-async-context#info=devDependencies)

# node-async-context (asyncctx)
This module allows you to create a asynchronouse execution context for JavaScript or TypeScript

> NOTE: This module is based on [async-hook](https://github.com/AndreasMadsen/async-hook), which in turn is based 
on the undocumented API [AsyncWrap](https://github.com/nodejs/diagnostics/blob/master/tracing/AsyncWrap/README.md)

This is the reason why **async-hook** will show this warning on startup:

> WARNING: 'you are using async-hook which is unstable.'

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

| Release   | Notes                                                                                                                            |
|-----------|----------------------------------------------------------------------------------------------------------------------------------|
| 0.0.04    | recovery version fixed 'ERROR: No README data found!'                                                                            |
| 0.0.01-03 | initial version                                                                                                                  |

## Downloads

[![NPM](https://nodei.co/npm/asyncctx.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/asyncctx)
