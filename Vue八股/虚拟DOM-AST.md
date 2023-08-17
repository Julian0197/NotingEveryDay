### 虚拟DOM如何提升性能

1. 减少重绘回流次数

比如向一个<ui>列表添加5个<li>如果直接操作真实DOM，那么浏览器需要经历5次回流；
但使用虚拟DOM在更新完后再异步批量更新真实DOM，一次性插入5个，浏览器只需要经历一次回流。

2. diff算法可以尝试对DOM进行复用，可以减少一些可能的DOM操作

虚拟DOM未必一定能提升性能，需要分情况讨论：
小量数据更新: 当页面的渲染数据高达几万条，但只需要修改某一条数据时，Virtual DOM的Diff比对算法，能够避免不必要的DOM操作，节省开销
大量数据更新: 当页面的渲染数据高达几万条, 但是更新的数据却非常大，甚至全量更新，Virtual DOM无法进行优化, 加剧了性能的浪费

### 浏览器的内部架构

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51faeeccaeb644b79fcf8c5aaf541cb9~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

chrome浏览器采用多进程

+ 浏览器进程——

### 重绘和回流

**浏览器渲染流程**

1. 渲染过程：HTML生成DOM树，CSS生成CSSOM树，
2. 去除不可见元素后，结合生成渲染树
3. 计算元素布局，渲染器线程遍历渲染树，创建绘制记录
4. 若渲染树发生变化，浏览器会发生重绘和回流



**重绘**

某些元素外观被改变触发的浏览器行为，但不影响其布局（大小、位置等）时，浏览器会重绘该元素，即重新绘制其样式，例如修改元素的填充颜色

color，border-style,background...

**回流**

重新生成布局，重新排列元素（重新计算各节点和CSS具体的大小和位置，渲染树需要重新计算所有受影响的节点），例如修改元素的宽高

页面初试渲染，添加删除可见dom元素，改变位置尺寸，改变字体大小，改变浏览器窗口尺寸，设置style属性的值,**查询某些属性或调用某些计算方法**

**减少回流**

+ 样式要集中改变，不要一条条改变，可以动态添加class（只会引起一次回流）

+ DOM离线操作，如果遇到频繁操作dom的情况，可以先设置`renderEle.style.display = 'none';`，这样dom不在渲染树上修改不会引起回流重绘，等修改完毕再`renderEle.style.display = 'block'`

+ 读写分离，避免直接读取style，而是拿到那个对象

  ~~~js
    // javascript
    const offsetWidth = '100px';
    const renderEle = document.getElementById('demo');
    renderEle.style.offsetWidth = offsetWidth // 导致重绘(写入)
    const tempoOffsetWidth = renderEle； // 避免直接读取offsetWidth
  ~~~


### AST是啥

抽象语法树是一种树形数据结构，每个节点代表代码中的一个语法结构

vue在编译template时会先解析成ast，再将ast转化为渲染函数，用于渲染组件