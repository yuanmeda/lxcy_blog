/*
 * @Author: 钟媛
 * @Date: 2021-09-08 19:27:32
 * @LastEditTime: 2021-09-10 14:15:10
 * @Description: 手写一个common.js
 */
// webpack -> cmj -> broswer -> iife

// const cache = {}

//   (function (modules) {
//     const require = (mn) => {
//       if (cache[mn]) return cache[mn].exports;
//       let module = cache[mn] = {
//         name: mn,
//         exports: {}
//       }

//       modules[mn](module, exports, require)

//       return module.exports
//     }

//     return require('index.js')

//   })({
//     'a.js': function (module, exports, require) {
//       // ...
//     }
//   })


