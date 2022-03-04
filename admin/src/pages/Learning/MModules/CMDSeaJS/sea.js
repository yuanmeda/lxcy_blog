/*
 * @Author: 钟媛
 * @Date: 2021-09-08 19:27:13
 * @LastEditTime: 2021-09-09 20:45:04
 * @Description: 手写一个sea.js
 */

// CMD 模块主要需要实现两个Api，
// 全局方法（define）定义暴露模块、seaJs.use()方法加载执行模块

// 收集通过define方式注册的模块
const defList = new Map();
const exports = {};
const seajs = {};

// 1、define(factory(require, exports, module){})
// 主要做模块收集，解析模块依赖和路径
function define(name, factory) {
  // 传参处理, 这里只处理部分情况
  if (!name && arguments.length !== 0) {
    factory = name;
  }
  const path = __getUrl(name);
  const deps = __getDepsByFn(factory);
  defList.set(name, { name, path, deps, factory });
}
const __exports = (id) => exports[id] || (exports[id] = {});
const __module = {};

const __require = (name) => {
  // if (exports[name]) return Promise.resolve(exports[name]); // 缓存

  return __loadFile(__getUrl(name)).then(() => {
    const { factory, deps } = defList.get(name);
    if (!deps || deps.length === 0) {
      __module.exports = __exports(name); // exports = module.exports
      factory(__require, __exports(name), __module);
      return __exports(name);
    }

    return seajs.use(deps, factory);
  });
};

// 2、seaJs.use(paths: string[], cb)
// 按顺序加载所有模块文件，直接执行其factory即可，执行完毕后再执行cb
seajs.use = (mods, callback) => {
  mods = Array.isArray(mods) ? mods : [mods];
  return new Promise((resolve, reject) => {
    Promise.all(
      mods.map((mod) => {
        return __loadFile(__getUrl(mod)).then(() => {
          const { factory } = defList.get(mod);
          return factory(__require, __exports(mod), __module);
        });
      }),
    ).then(resolve, reject);
  }).then(callback);
};

// 解析factory中需要加在的依赖 main 模块中会返回 ['a','b'] TODO:
function __getDepsByFn(fn) {
  let matches = [];
  let reg = /(?:require\()(?:['"])([^'"]+)/g;
  let r = null;
  while ((r = reg.exec(fn.toString())) !== null) {
    reg.lastIndex;
    matches.push(r[1]);
  }

  return matches;
}

// load script 可以跳过跨域的问题
function __loadFile(url) {
  return new Promise((resolve, reject) => {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    head.appendChild(script);
  });
}

// get real url
function __getUrl(fileName) {
  const path = location.pathname;
  return `${path.slice(0, path.lastIndexOf('/'))}/${fileName}.js`;
}
