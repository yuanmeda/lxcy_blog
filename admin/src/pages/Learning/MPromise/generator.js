/*
 * @Author: 钟媛
 * @Date: 2021-09-08 14:42:20
 * @LastEditTime: 2021-09-08 15:08:03
 * @Description: 实现一个自执行的迭代器
 */

const mockAsyncFetch = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(time), time));

function* generator() {
  const res = yield mockAsyncFetch(1000);
  console.log(res);
  const res1 = yield mockAsyncFetch(2000);
  console.log(res1);
  return res1;
}

const i = generator();

console.log(i.next());
console.log(i.next());
console.log(i.next());

// 自动执行
function asyncFunc(generator) {
  const iterator = generator();

  const go = (data) => {
    // data 为上一次执行的结果
    const { done, value } = iterator.next(data);
    if (done) return value; // 执行完毕后返回
    value.then((data) => go(data));
  };

  go();
}
