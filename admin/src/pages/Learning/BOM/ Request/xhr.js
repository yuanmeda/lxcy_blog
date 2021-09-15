/*
 * @Author: 钟媛
 * @Date: 2021-09-10 17:39:40
 * @LastEditTime: 2021-09-10 20:09:10
 * @Description: 原生XMLHttpRequest
 */
const xhr = new XMLHttpRequest();
xhr.open('get', 'http://127.0.0.1:3001')
xhr.onreadystatechange = function () {
  if (xhr.readyState !== 4) {
    return
  }
  if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
    console.log('返回结果', xhr.responseText);
  }
}
xhr.timeout = 3000
xhr.send();
