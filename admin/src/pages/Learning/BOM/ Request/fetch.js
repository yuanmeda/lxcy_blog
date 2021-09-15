/*
 * @Author: 钟媛
 * @Date: 2021-09-10 18:52:18
 * @LastEditTime: 2021-09-10 20:05:55
 * @Description: fetch
 */
fetch('http://domain/service', {
  method: 'GET'
})
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(error => console.error('error:', error));

// 1、 默认不带cookie

fetch(
  'http://domain/service', {
  method: 'GET',
  credentials: 'same-origin'
}
)

// 2、错误不会reject， 只有网络请求错误的时候才会reject
// HTTP错误（例如404 Page Not Found 或 500 Internal Server Error）不会导致Fetch返回的Promise标记为reject；.catch()也不会被执行。
// 想要精确的判断 fetch是否成功，需要包含 promise resolved 的情况，此时再判断 response.ok是不是为 true

fetch('http://domain/service', {
  method: 'GET'
})
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  })
  .then(json => console.log(json))
  .catch(error => console.error('error:', error));

// 3、不支持直接设置超时, 可以用promise
function fetchTimeout(url, init, timeout = 3000) {
  return new Promise((resolve, reject) => {
    fetch(url, init)
      .then(resolve)
      .catch(reject);
    setTimeout(reject, timeout);
  })
}

// 4、使用AbortController.abort() 中止fetch
const controller = new AbortController();

fetch(
  'http://domain/service', {
  method: 'GET',
  signal: controller.signal
})
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(error => console.error('Error:', error));

controller.abort();
