## 模块是什么？

模块用我自己的语言来理解就是，**包含自己的变量和行为，同时提供对外的通信接口**

闭包其实就建立了函数与外界的一个通信机制

## 模块产生的背景，是为了解决某一类问题而出现的

随着前端应用的增强，需求推动技术演进，迫切需要**更好的代码管理、组织、通信模式**，出现了各种模块化技术解决方案。

实现模块化要解决问题:

1. 命名污染，全局污染、变量冲突等基础问题
2. 内聚且私有，变量不能被外界污染到（变量私有化）
3. 怎么引入（依赖）其他模块，怎么暴露出接口给其他模块
4. 依赖的顺序问题
5. 依赖循环引用的问题

模块化可以解决的问题：

1. 关注分离，把复杂的问题分解成多个子问题，单一职责，高内聚
2. 更加优雅的管理代码，替换、复用、拓展，便于维护
3. 方便多人协同

## 模块化技术的优点和不足 & 业界方案的对比

1. 模块化技术的演进
   1.1 全局函数时代
   缺点：变量冲突，覆盖，全局污染等，函数成员之间看不出任何关系

   ```js
   function a {}
   function b {}
   ...
   ```

   1.2 命名空间（namespace） （通过简单的命名空间进行分块）
   缺点：命名空间名可随意修改可访问，数据安全性

   1.3 巧用闭包(基于 IIFE，现代模块化的基石)
   缺点： 模块之间的依赖顺序关系
   优点：私有化变量，可以从外界注入变量，将内部变量暴露出去

   ```js
   // moduleA.js
   (function (global, $) {
     var name = 'tom';
     function getScore() {}

     global.moduleA = { name, getScrore };
   })(window, Jquery);
   ```

2、现代模块化技术方案

AMD/CMD/CommonJS/ESM

AMD 规范： https://github.com/amdjs/amdjs-api/wiki/AMD-(%E4%B8%AD%E6%96%87%E7%89%88)

CMD 规范：https://github.com/seajs/seajs/issues/242

CommonJs 面向服务端设计，用同步的方式加载模块。 在服务端，读取文件通过本地磁盘非常快。但是在浏览器端，限于网络的原因，更合理的方案时使用异步，因此在 CommonJs 的基础上衍生了另外一种规范 AMD，代表是 RequireJS. AMD 核心思想是异步加载模块依赖，等待加载完毕后执行回调，它的痛点时一上来就加载所有的依赖，不管是否此以来有用。对此，CMD 规范主张按需加载, 在定义阶段，解析执行函数（factory）中依赖项，按需加载。

按我的理解就是：无论是 Require JS 还是 SeaJs 的实现都旨在，**实现文件按依赖关系的异步加载，执行并返回对外通信的接口**；程序设计模式使用了发布订阅的模式；

## AMD (异步模块定义，前置加载)

实现 AMD 规范的模块化：用 require.config()指定引用路径等，用 define()定义模块，用 require()加载模块

先看怎么用

```js
require.config({
  paths: {
    lodash: 'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js',
  },
});

define('a', function () {
  console.log('a load');
  return {
    run: function () {
      console.log('a run');
    },
  };
});

require(['a', 'lodash'], function (a, b) {
  console.log('main run'); // 🔥
  a.run();
  b.run();
});
```

按上面的理解来写下着三个 api 的实现

## CMD (通用模块定义， 按需加载)

实现 CMD 规范的模块化：用 define()定义暴露模块，用 seajs.use()加载执行模块；

```js
// sea.js
define('a', function (require, exports, module) {
  console.log('a load');
  exports.run = function () {
    console.log('a run');
  };
});

define('b', function (require, exports, module) {
  console.log('b load');
  module.exports.run = function () {
    console.log('b run');
  };
});

define('main', function (require, exports, module) {
  console.log('main run');
  var a = require('a');
  a.run();
  var b = require('b');
  b.run();
});

seajs.use('main');

// main run
// a load
// a run
// b load
// b run
```

按上面的理解来写下这两个 api 的实现

## CMJ （同步加载模块，模块输出为值拷贝，有缓存，运行时加载，整块导入）

文件是一个模块，私有。内置两个变量 module require (exports = module.exports)

1. require 会缓存一下

```js
// a.js
var name = 'morrain';
var age = 18;
exports.name = name;
exports.getAge = function () {
  return age;
};
// b.js
var a = require('a.js');
console.log(a.name); // 'morrain'
a.name = 'rename';
var b = require('a.js');
console.log(b.name); // 'rename'
```

2. 值拷贝

```js
// a.js
var name = 'morrain';
var age = 18;
exports.name = name;
exports.age = age;
exports.setAge = function (a) {
  age = a;
};
// b.js
var a = require('a.js');
console.log(a.age); // 18
a.setAge(19);
console.log(a.age); // 18
```

手写一个 require
好文参考：https://juejin.cn/post/6866973719634542606

分析：当我们 require 某个模块时，并不是只拿他的 module.exports，而是会从头开始运行这个文件，module.exports = XXX 其实也只是其中一行代码。

当你再次 require 某个文件时，如果这个对象里面有对应的值，就直接返回给你，如果没有就重复前面的步骤，执行目标文件，然后将它的 module.exports 加入这个全局对象，并返回给调用者。

再用一句简单的话，require 就是运行并获取目标文件的值，然后加入缓存，用的时候拿出来用就行。

1. 循环引用是如何解决的？
   CommonJS 中如何解决循环引用问题的呢？以 nodejs 为例，在文件加载阶段，是先去缓存中占一个位置，然后再去 loaded 值。

   一句话：模块在加载前就会被加入缓存。

```js
MyModule._cache[filename] = module;

module.load(filename);
```

所以如果在 a.js 中加载 b.js ， 然后在 b.js 中加载 a.js,此时返回的只是 a.js 的一个**未完成的副本**而已

## EMJ （ES6 模块，异步多阶段加载模块，模块输出为引用，编译时加载，可选择导入）

ES6 模块有 export、 import、 export default、import()
ES6 模块部分 阮一峰： https://es6.ruanyifeng.com/#docs/module
模块化详解：https://juejin.cn/post/6844903744518389768#heading-25
