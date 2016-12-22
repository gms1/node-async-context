export {ContinuationLocalStorage} from './ContinuationLocalStorage';

/*
// tslint:disable
const asyncHook = require('async-hook');
const node_process: any = process;


asyncHook.addHooks({
      init: (uid:number, handle: any, provider:number, parentUid: number|null, parentHandle:any) => {
        let fn = handle ? handle.constructor ? handle.constructor.name : handle.toString() : 'null';
        node_process._rawDebug(`init   : uid: ${uid} handle: ${fn}`);
      },
      pre: (uid: number) => {
        node_process._rawDebug(`pre    : uid: ${uid}`);
      },
      post: (uid: number, didThrow: boolean) => {
        node_process._rawDebug(`post   : uid: ${uid}`);
      },
      destroy: (uid: number) => {
        node_process._rawDebug(`destroy: uid: ${uid}`);
      }
});


asyncHook.enable();

// see
// https://github.com/nodejs/node-eps/pull/18
//  quote: Promise executors run synchronously, so only the 'then' will trigger events

new Promise((resolve, reject)=>{
  node_process._rawDebug('resolving promise');
  resolve(42);
}).then((val) => {
  node_process._rawDebug(`promise resolved ${val}`);
  asyncHook.disable();
  return val;
});
*/
