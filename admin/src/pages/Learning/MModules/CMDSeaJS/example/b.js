define('b', function (require, exports, module) {
  console.log('b load');
  module.exports.run = function () {
    console.log('b run');
  };
});
