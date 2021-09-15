
// CommonJs输出是值拷贝（深拷贝），并且结果会缓存起来
var example = require('./a.js');
console.log(example.x); // 5
console.log(example.addX(1)); // 6
console.log(example.x); // 5
example.x = 6;
console.log(example.addX(1)); // 6
example.obj.name.aa = '222'
console.log(example); // { x: 6, addX: [Function: addX], obj: { name: { aa: '222' } } }
var example2 = require('./a.js');
console.log(example2); // { x: 6, addX: [Function: addX], obj: { name: { aa: '222' } } }


