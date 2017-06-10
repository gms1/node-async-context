const asyncHooks = require('async_hooks');

let beforeId;
asyncHooks
    .createHook({
      init: (id, type, triggerId) => {
        process._rawDebug(`init: id:${id} type:${type} triggerId:${triggerId}`);
      },
      before: (id) => {
        process._rawDebug(`before: id:${id}`);
        beforeId = id;
      }
    })
    .enable();

function tracePromise(prefix) {
  process._rawDebug(
      `promise : ${prefix}: currId:${asyncHooks.currentId()} lastId:${beforeId}`);
}

setImmediate(() => {
  doTrace = true;
  return new Promise((resolve, reject) => {
           tracePromise('P1: EXECUTOR FUNC');
           return new Promise((resolve, reject) => {
                    tracePromise('P2: EXECUTOR FUNC');
                    return new Promise((resolve, reject) => {
                             tracePromise('P3: EXECUTOR FUNC');
                             resolve();
                           })
                        .then(() => { tracePromise('P3: THEN'); });
                  })
               .then(() => { tracePromise('P2: THEN'); })
         })
      .then(() => { tracePromise('P1: THEN'); });
  ;
});
