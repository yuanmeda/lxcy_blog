# 灵活应用

## 实现一个延时 defer(fn)函数，当我们 defer(fn)函数时，它永远都不会执行，我要先去干别的事儿，你等着，等我干完了，再来 resolve，fn 开始执行

也适用于发布/订阅模式， 先订阅，等到某个机制成熟之后再发布通知执行具体的操作

```js
const defers = {};
const defer = (id, fn) => {
  return new Promise((resolve, reject) => {
    (defers[id] = {}).resolve = resolve;
  }).then(fn);
};

defer('delay', (res) => console.log('res', res));

defers['delay'].resolve('hello'); // 当手动执行resolve时，fn执行
```

# 一些问题

## 1、then(onFulfilled, onRejected) 中无参数或者参数不是 fn 时，返回值是什么？

A: onFulfilledCb, onRejectedCb，必须是函数，非函数时, 默认做值和状态的穿透

规范：
如果 onFulfilled 不是一个函数, newPromise 以 promise 的 value 和状态 触发 fulfilled
如果 onRejected 不是一个函数, newPromise 以 promise 的 reason 和状态 触发 rejected

```js
// r是一个promise，最终会fulfilled ,value为111
const r = new Promise((resolve, reject) => {
  resolve(111); // 或者是reject
}).then();

setTimeout(() => {
  console.log(r); // 此时r与promise同值和状态，r的状态为fulfilled，value为 111
}, 0);

const r1 = new Promise((resolve, reject) => {
  resolve(111); // 或者是reject
}).then((value) => {
  console.log(value);
});

setTimeout(() => {
  console.log(r1); // 此时r1与第一个then同值和状态，then回调函数执行最后未返回结果，那么r1的状态为fulfilled，value为 undefined
}, 0);
```

## 2、promise 中为何采用数组来装载回调函数，链式调用 then 时，每次都是返回一个新的 promise，使用一个变量存储就行了？

A: then 出了链式调用，同一个实例上的 then 方法可以被调用多次

规范：promise 状态变成 fulfilled 后，所有的 onFulfilled/onRejected 回调都需要按照 then 的顺序执行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个 onFulfilled 的回调)

```js
// 链式调用
p.then(cb1,cb2).then(cb3,cb4)

// 多次调用
p.then(cb1);
p.then(cb2);
....

```

## 3、为什么 promise resolve 了一个 value, 最后输出的 value 值确是 undefined

```js
const test = new MPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(111);
  }, 1000);
}).then((value) => {
  console.log('then');
});

setTimeout(() => {
  console.log(test);
}, 3000);
```

答：
因为现在这种写法, 相当于在.then 里 return undefined, 所以最后的 value 是 undefined.
如果显式 return 一个值, 就不是 undefined 了；比如 return value.

## 4、.then 返回的是一个新 Promise, 那么原来 promise 实现的时候, 用数组来存回调函数有什么意义？

这个问题提出的时候, 应该是有一个假定条件, 就是链式调用的时候.

这个时候, 每一个.then 返回的都是一个新 promise, 所以每次回调数组 FULFILLED_CALLBACK_LIST 都是空数组.

针对这种情况, 确实用数组来存储回调没意义, 完全可以就用一个变量来存储。

```js
const test = new MPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(111);
  }, 1000);
})
  .then((value) => {})
  .then(() => {});
```

但是还有一种 promise 使用的方式, 这种情况下, promise 实例是同一个, 数组的存在就有了意义

```js
const test = new MPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(111);
  }, 1000);
});

test.then(() => {});
test.then(() => {});
test.then(() => {});
test.then(() => {});
```

## 5、为什么我在 catch 的回调里, 打印 promise, 显示状态是 pending

```js
const test = new MPromise((resolve, reject) => {
  setTimeout(() => {
    reject(111);
  }, 1000);
}).catch((reason) => {
  console.log('报错' + reason);
  console.log(test);
});

setTimeout(() => {
  console.log(test);
}, 3000);
```

1. catch 函数会返回一个新的 promise, 而 test 就是这个新 promise
2. catch 的回调里, 打印 promise 的时候, 整个回调还并没有执行完成(所以此时的状态是 pending), 只有当整个回调完成了, 才会更改状态
3. catch 的回调函数, 如果成功执行完成了, 会改变这个新 Promise 的状态为 fulfilled

## 6、为什么要判断 newPromise 和 res 相等，陷入死循环？

1. 当 P1 执行的结果是它自己本身时，进入 resolvePromise()中，在结果为 promise 类型时，我们呢会去执行它的回调函数（then）,拿到结果，此时的结果还是这个 promise，继续 resolvePromise，因此会陷入死循环。

```js
const P1 = new Promise((resolve, reject) => {
  resolve(22);
}).then((res) => {
  console.log(res);
  return P1;
});
```

## 7、猜想 promise 的状态和值？

```js
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
  .then((result) => result)
  .catch((e) => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
  .then((result) => result)
  .catch((e) => e); // P2 是最后catch将错误成功捕获之后，正常执行，并返回结果，结果是一个错误对象

Promise.all([p1, p2])
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

// 最终promise的状态是fulfilled 值为 ['hello', Error: '报错了’]
```

## 8、为什么我在 catch 的回调里, 打印 promise, 显示状态是 pending

```js
const test = new MPromise((resolve, reject) => {
  setTimeout(() => {
    reject(111);
  }, 1000);
}).catch((reason) => {
  console.log('报错' + reason);
  console.log(test);
});

setTimeout(() => {
  console.log(test);
}, 3000);
```

1. catch 函数会返回一个新的 promise, 而 test 就是这个新 promise
2. catch 的回调里, 打印 promise 的时候, 整个回调还并没有执行完成(所以此时的状态是 pending), 只有当整个回调完成了, 才会更改状态
3. catch 的回调函数, 如果成功执行完成了, 会改变这个新 Promise 的状态为 fulfilled

## 遗留

博客整理

1. promise 的产生的背景，解决了什么问题？
2. promise 的优点和缺点
3. 同类通信机制的对比 generator、async/await
