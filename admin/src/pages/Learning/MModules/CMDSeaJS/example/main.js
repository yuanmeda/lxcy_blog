/*
 * @Author: 钟媛
 * @Date: 2021-09-09 19:04:16
 * @LastEditTime: 2021-09-09 20:15:06
 * @Description:
 */
define('main', async function (require, exports, module) {
  console.log('main run')
  var a = await require('a')
  a.run()
  var b = await require('b')
  b.run()
})
