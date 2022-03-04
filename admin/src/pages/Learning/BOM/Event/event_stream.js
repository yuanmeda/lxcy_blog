/*
 * @Author: 钟媛
 * @Date: 2021-09-10 15:27:35
 * @LastEditTime: 2021-09-10 17:10:52
 * @Description: 事件流
 */

const parent = document.getElementById('parent');
const child = document.getElementById('child');
const son = document.getElementById('son');
const a = document.getElementById('a-baidu');

window.addEventListener(
  'click',
  (e) => {
    // e.stopPropagation(); // 阻止事件传播，精确是阻止事件向后流转，但是在此元素上绑定的相同事件类型的其他回调函数还是会依次执行
    e.stopImmediatePropagation(); // 同e.stopPropagation()，此外也会阻止同类型事件其他事件回调函数的执行
    if (!false) {
      alert('你被禁言啦！');
      return;
    }
    console.log(
      'window',
      '捕获阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  true,
);

window.addEventListener(
  'click',
  (e) => {
    console.log(
      'window1',
      '捕获阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  true,
);

parent.addEventListener(
  'click',
  (e) => {
    console.log(
      'parent',
      '捕获阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  true,
);

child.addEventListener(
  'click',
  (e) => {
    console.log(
      'child',
      '捕获阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  true,
);

son.addEventListener(
  'click',
  (e) => {
    console.log('son', '捕获阶段', e.target.nodeName, e.currentTarget.nodeName);
  },
  true,
);

// *******************************************************

window.addEventListener(
  'click',
  (e) => {
    console.log(
      'window',
      '冒泡阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  false,
);

parent.addEventListener(
  'click',
  (e) => {
    console.log(
      'parent',
      '冒泡阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  false,
);

child.addEventListener(
  'click',
  (e) => {
    console.log(
      'child',
      '冒泡阶段',
      e.target.nodeName,
      e.currentTarget.nodeName,
    );
  },
  false,
);

son.addEventListener(
  'click',
  (e) => {
    console.log('son', '冒泡阶段', e.target.nodeName, e.currentTarget.nodeName);
  },
  false,
);

// *************************** 🔥 事件委托和伪数组的调用 ****************************

const ul = document.getElementById('ul');
ul.addEventListener('click', function (e) {
  // 要求：打印出目标函数的内容和索引
  const content = e.target.innerHTML;
  if (e.target.nodeName.toLowerCase() === 'li') {
    const liList = this.querySelectorAll('li');
    const index = Array.prototype.indexOf.call(liList, e.target);
    console.log(`当前访问的是第${index}个li, 内容是${content}`);
  }
});
