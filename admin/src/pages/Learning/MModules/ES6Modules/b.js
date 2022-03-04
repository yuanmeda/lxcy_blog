// ES6 模块输出是引用
import * as example from './a';
console.log(example.x); // 5
console.log(example.addX(1)); // 6
// example.x = 6; // 抛错
example.obj.name.aa = '222';
console.log(example); // { x: 6, addX: [Function: addX], obj: { name: { aa: '222' } } }
