/*
 * @Author: 钟媛
 * @Date: 2021-09-07 13:24:41
 * @LastEditTime: 2021-09-10 21:25:02
 * @Description: promise深度解析
 */

// 遵循Promise A+规范，模拟实现

// 三种状态：pending fulfilled rejected
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MPromise {
  fulfilledCallbackList = [];
  rejectedCallbackList = [];
  _status = PENDING;

  constructor(fn) {
    // 初始状态为pending, promise成功时的值value，失败时的值reason
    this.status = PENDING;
    this.value = null;
    this.reason = null;

    // 状态流转，pending ——》resolve(value) ——》fulfilled
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
      }
    };

    // 状态流转，pending ——》reject(reason) ——》rejected
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
      }
    };

    try {
      // promise 回调函数立即调用
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // 通过getter setter 监听状态的改变
  get status() {
    return this._status;
  }

  // 监听status 状态，按顺序执行注册回调，前提条件是，在resolve/reject 时，提前更新最新的value
  set status(newStatus) {
    this._status = newStatus;
    switch (newStatus) {
      case FULFILLED:
        this.fulfilledCallbackList.forEach((cb) => {
          cb(this.value);
        });
        break;
      case REJECTED:
        this.rejectedCallbackList.forEach((cb) => {
          cb(this.reason);
        });
        return;
    }
  }

  // then 方法用来访问最终决议的结果， ** 可以链式调用 ** **也可以通过实例多次调用** 返回值是一个新的promise
  then(onFulfilledCb, onRejectedCb) {
    // 1、onFulfilledCb, onRejectedCb，必须是函数，非函数时, 默认做值的透传
    const realFulfilledCb = this.isFunctionType(onFulfilledCb)
      ? onFulfilledCb
      : (value) => value;
    const realRejectedCb = this.isFunctionType(onRejectedCb)
      ? onRejectedCb
      : (reason) => {
          throw reason;
        };

    // 2、onFulfilledCb, onRejectedCb,只能调用一次，需要变量来控制
    // 3、onFulfilledCb, onRejectedCb 应该是微任务
    const newPromise = new MPromise((resolve, reject) => {
      const resolveFulfilledMicrotask = () => {
        // 通过queueMicrotask使用微任务: https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide
        queueMicrotask(() => {
          // onFulfilledCb, onRejectedCb，执行异常需要被reject
          try {
            const res = realFulfilledCb(this.value);
            this.resolvePromise(newPromise, res, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      const resolveRejectedMicrotask = () => {
        // 通过queueMicrotask使用微任务: https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide
        queueMicrotask(() => {
          // onFulfilledCb, onRejectedCb，执行异常需要被reject
          try {
            const res = realRejectedCb(this.reason);
            this.resolvePromise(newPromise, res, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      switch (this.status) {
        case FULFILLED:
          resolveFulfilledMicrotask();
          break;
        case REJECTED:
          resolveRejectedMicrotask();
          return;
        case PENDING:
          // 注：异步任务时，注册then时异步任务未结束，此时我们可以将回调函数通过一个数组装载起来，等待promise决议后顺序调用
          // 为啥用数组，then有两种调用形式，链式调用和实例多次调用，这里正是适配同一个实例多次调用then的情况
          this.fulfilledCallbackList.push(resolveFulfilledMicrotask);
          this, this.rejectedCallbackList.push(resolveRejectedMicrotask);
          return;
      }
    });

    return newPromise;
  }
  // resolvePromise： 主要是解析回调函数执行的值，直到返回的是一个基础值
  // res 可能的值有一下几种情况
  resolvePromise(newPromise, res, resolve, reject) {
    // 1、 当 res  === newPromise 时，会进入死循环；
    if (res === newPromise) {
      return reject(
        new TypeError('promise 与 返回值 指向同一个值（引用空间）'),
      );
    }

    // 2、res 为 promise
    if (res instanceof MPromise) {
      // 🔥 如果返回值为promise，则会产生两个微任务
      queueMicrotask(() => {
        res.then((y) => {
          this.resolvePromise(newPromise, y, resolve, reject);
        }, reject);
      });
    } else if (typeof res === 'object' || typeof res === 'function') {
      // 3、res是一个对象或者函数
      let then = null;

      try {
        // 把 x.then 赋值给 then
        then = res.then;
      } catch (error) {
        return reject(error);
      }
      // 3.1 res 为thenable （一个具有then方法的函数或者对象）
      if (this.isFunctionType(then)) {
        // 由于功和失败的回调只能执行一个，要么成功，要么失败，不可能既成功有失败，用called来控制
        let called = false;
        try {
          then.call(
            res,
            (v) => {
              if (called) return;
              called = true;
              this.resolvePromise(newPromise, v, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            },
          );
        } catch (e) {
          // 决议后的抛错忽略
          if (called) return;
          reject(e);
        }
      } else {
        resolve(res);
      }
    } else {
      resolve(res);
    }
  }

  isFunctionType(fn) {
    return typeof fn === 'function';
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // 不管 Promise 对象最后状态如何，都会执行的操作, 并且将状态和值透传
  finally(callback) {
    return this.then(
      (value) => MPromise.resolve(callback).then(() => value),
      (reason) =>
        MPromise.resolve(callback).then(() => {
          throw reason;
        }),
    );
  }

  static resolve(value) {
    if (value instanceof MPromise) {
      return value;
    }
    return new MPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MPromise((resolve, reject) => reject(reason));
  }

  // 接受多个promise，返回一个新的promise
  // 返回率先resolve的promise，不管是fulfilled/rejected
  static race(promises) {
    return new MPromise((resolve, reject) => {
      if (promises.length === 0) {
        return resolve();
      }
      promises.forEach((p) => {
        MPromise.resolve(p).then(
          (res) => resolve(res),
          (reason) => reject(reason),
        );
      });
    });
  }

  // 接受多个promise，返回一个新的promise，
  // all fulfilled 按顺序返回所有值，反之，返回率先失败的值；
  static all(promises) {
    return new MPromise((resolve, reject) => {
      if (promises.length === 0) {
        return resolve([]);
      }
      const results = [];
      for (let i = 0; i < promises.length; i++) {
        const p = promises[i];
        MPromise.resolve(p).then((res) => {
          results[i] = res;
          if (results.length === promises.length) {
            resolve(results);
          }
        }, reject);
      }
    });
  }

  // 接受多个promise，返回一个新的promise 状态总是fulfilled
  // allSettled 不管promise最终是fulfilled/rejected, 按顺序返回所有的值
  static allSettled(promises) {
    return new MPromise((resolve, reject) => {
      if (promises.length === 0) {
        return resolve([]);
      }
      const results = [];
      for (let i = 0; i < promises.length; i++) {
        const p = promises[i];
        MPromise.resolve(p).then(
          (value) => {
            results[i] = {
              status: 'fulfilled',
              value,
            };
            if (results.length === promises.length) {
              resolve(results);
            }
          },
          (reason) => {
            results[i] = {
              status: 'rejected',
              reason,
            };
            if (results.length === promises.length) {
              resolve(results);
            }
          },
        );
      }
    });
  }

  // 接受多个promise，返回一个新的promise
  // any one fulfilled promise最终就是fulfilled, 只有所有的promise都是rejected时，才会返回rejected状态
  static any(promises) {
    return new MPromise((resolve, reject) => {
      if (promises.length === 0) {
        return resolve([]);
      }
      const reasons = [];
      for (let i = 0; i < promises.length; i++) {
        const p = promises[i];
        MPromise.resolve(p).then(resolve, (reason) => {
          reasons[i] = reason;
          if (reasons.length === promises.length) {
            reject(reasons);
          }
        });
      }
    });
  }
}

// 写了一个defer函数，当我们defer(fn)函数时，它永远都不会执行，
// 我要先去干别的事儿，你等着，等我干完了，再来resolve，fn开始执行
// 也适用于发布/订阅模式， 先订阅，等到某个机制成熟之后再发布通知执行具体的操作
const defers = {};
const defer = (id, fn) => {
  return new Promise((resolve, reject) => {
    (defers[id] = {}).resolve = resolve;
  }).then(fn);
};

defer('delay', (res) => console.log('res', res));

defers['delay'].resolve('hello');

// 经典的例子 使用Promise打印出的结果是 0 1 2 3 4 5 6 7 8
// 使用MPromise打印出的结果是 0 1 2 4 3 5 6 7 8
// 不一致的解释
// 1、return Promise类型， 会产生两个微任务， 也可以用户这个理论，在resolvePromise方法中加上补丁
// 2、当执行栈为空的时候，才会resolve掉这个新的 Promise
MPromise.resolve()
  .then(() => {
    console.log(0);
    setTimeout(() => {
      console.log('宏任务');
    }, 0);
    return MPromise.resolve(4);
    // return 4 // 0 1 4 2 3 5 6 7 8
  })
  .then(console.log);

MPromise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(5);
  })
  .then(() => {
    console.log(6);
  })
  .then(() => {
    console.log(7);
  })
  .then(() => {
    console.log(8);
  });

// 根据上述两种猜想，画下微任务执行时序
// 微任务中存在微任务时，直接将新的微任务插入队列的末尾，按先进先出的顺序执行
// 1、 log0 -> log1 -> micro(return Promise) -> log2 -> return Promise -> log3 -> res => logres => log4 => log5 => log6 => log7 => log8
// 2、 初始状态任务堆栈中只有两个 微任务 log0 -> log1
// 执行log0，遇到微任务 return Promise(4) ,但此时堆栈不为空，所以等待。。。
// 执行log1, resolve后直接将下一个then(log2)推入队列，此时log1执行完毕，推栈为空，将 return Promise(4) 推入队列，先后顺序具体需要看浏览器真实实现
// log2 -> return Promise => ...
