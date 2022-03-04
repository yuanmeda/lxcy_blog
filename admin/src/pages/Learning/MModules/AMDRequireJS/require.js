/*
 * @Author: 钟媛
 * @Date: 2021-09-08 19:26:13
 * @LastEditTime: 2021-09-09 18:52:22
 * @Description: AMD规范 手写一个 require.js
 */

// AMD 模块主要需要实现三个Api，
// 全局方法（define）模块的定义、全局方法（require）引入加载模块、配置对象config

// 收集通过define方式注册的模块
const defList = new Map();

// 默认配置
const defaultOption = {
  paths: {},
};

// 1、define(name?, deps?, factory)
// 主要做模块注册, 收集， 真正动态加载执行是在require时
function define(name, deps, factory) {
  // 传参处理, 这里只处理部分情况
  if (!Array.isArray(deps) && arguments.length === 2) {
    factory = deps;
    deps = [];
  }
  defList.set(name, { name, deps, factory });
}

// 2、require(deps, factory)
// 本质是前置加载，等到所有deps加载完成之后，再执行回调factory，发现是不是跟Promise.all如出一辙
// 这里我们用异步Promise来模拟
function require(deps, factory) {
  return new Promise((resolve, reject) => {
    // 异步加载所有模块，按顺序输出
    Promise.all(
      deps.map((name) => {
        // 返回多个模块异步加载任务
        // 模块有多种：通过define文件粒度定义、from CDN
        if (defaultOption.paths[name]) {
          return _import(defaultOption.paths[name]);
        }
        // 🔥 1. 加载并执行文件（执行define，此处才是真正进行模块收集的地方）
        // 2. 文件加载完成，也意味着模块已经收集完毕，此时可以拿到模块的相关信息
        return __loadFile(_getUrl(name)).then(() => {
          const { deps, factory } = defList.get(name);
          if (deps.length === 0) {
            return factory(null);
          }
          return require(deps, factory); // 递归执行
        });
      }),
    ).then(resolve, reject);
  }).then((depsExportsIns) => factory(...depsExportsIns));
}

// 3、实现配置方法
require.config = (option = {}) => Object.assign(defaultOption, option);

// 加载 CDN链接
function _import(url) {
  return Promise.resolve().then(() => System.import(url));
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
function _getUrl(fileName) {
  const path = location.pathname;
  return `${path.slice(0, path.lastIndexOf('/'))}/${fileName}.js`;
}
