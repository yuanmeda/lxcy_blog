/*
 * @Author: 钟媛
 * @Date: 2021-09-10 20:10:18
 * @LastEditTime: 2021-09-10 21:06:37
 * @Description: 实现一个ajax
 */
let timer: any;
type FetchType = 'GET' | 'POST' | 'PUT' | 'DELETE';
// 先看下怎么用： $.ajax(option).then(success, failed)
interface IOptions {
  url: string;
  type?: FetchType;
  data?: any;
  timeout?: number;
}

export function ajax(
  options: IOptions = {
    url: '',
    type: 'GET',
    data: {},
    timeout: 3000,
  },
) {
  // 返回一个promise，
  return new Promise((resolve, reject) => {
    if (!options || !options.url) return;
    const { type = 'GET', url, data, timeout } = options;
    const params = combineParams(data);

    let xhr: any;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        if (timer) {
          clearTimeout(timer);
        }
        return resolve(xhr.responseText);
      } else {
        return new Error(`${xhr.status}-${xhr.statusText}`);
      }
    };

    switch (type.toLowerCase()) {
      case 'get':
        xhr.open(type.toLowerCase(), `${url}?${params}`);
        xhr.send();
        break;
      case 'post':
        xhr.open(type.toLowerCase(), url, true);
        xhr.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded',
        );
        xhr.send(data);
        xhr.break;
      // ....
      default:
        break;
    }

    if (options.timeout) {
      timer = setTimeout(() => {
        xhr.abort();
        reject('超时啦！');
      }, timeout);
    }
  }).catch(console.log);
}

function combineParams(params: Record<string, any>) {
  return Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
}
