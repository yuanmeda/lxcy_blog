/*
 * @Author: 钟媛
 * @Date: 2021-09-10 15:26:47
 * @LastEditTime: 2021-09-10 17:26:41
 * @Description: 通用监听事件对象
 */
class CMEvent {
  constructor(element) {
    this.element = element;
  }

  addEvent(type, handler) {
    if (this.element.addEventListener) {
      this.element.addEventListener(type, handler, false);
    } else if (this.element.attachEvent) {
      this.element.attachEvent(`on${type}`, function () {
        handler.call(this.element);
      });
    } else {
      this.element[`on${type}`] = handler;
    }
  }

  removeEvent(type, handler) {
    if (this.element.removeEventListener) {
      this.element.removeEventListener(type, handler, false);
    } else if (this.element.detachEvent) {
      this.element.detachEvent(`on${type}`, function () {
        handler.call(this.element);
      });
    } else {
      this.element[`on${type}`] = null;
    }
  }
}
// 使用
// const ul = document.getElementById('ul');
// const a = new CMEvent(ul);
// a.addEvent('click', function () { })

function stopPropagation(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  } else {
    e.cancelBubble = true; // IE 取消事件冒泡，IE没有事件捕获阶段
  }
}

function preventEvent(e) {
  if (e.preventEvent) {
    e.preventEvent();
  } else {
    e.returnValue = false; // IE
  }
}
