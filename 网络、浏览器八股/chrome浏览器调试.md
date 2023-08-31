## dev tools调试

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53b5cbe889d04380aaa87e2ed7aa211a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

### 元素面板 Element

+ DOM树
+ Styles：可编辑，添加样式，实时预览，可以强制激活伪类

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230830131332852.png" alt="image-20230830131332852" style="zoom:33%;" />

+ Computed：标准化+计算后的样式值
+ Layout：flex布局，grid布局调试
+ DOM BreakPoints：DOM断点，可以在JS代码修改DOM时触发断点

### 控制台面板 Console

1. 用`console.time()`来计算代码的耗时，参数为计时器命名。

```js
function sum(n) {
  let sum = 0;
  for (i = 1; i <= n; i++) {
    let u = { name: 'sam', age: i }
    sum += i;
  }
  return sum
}
// 计算一个函数的耗时
console.time('sum') // 开始计时
const total = sum(100000);
console.timeLog('sum');  // 计时：sum: 4.43994140625 ms
const total2 = sum(1000);
console.timeEnd('sum');  // 计时：sum: 5.0419921875 ms
console.log({ total });  //{total: 5000050000}
```

2. 增强log，`console.table`，对于复杂对象类型更加直观。
3. 监听函数
   + `monitor`：监听函数，被监听函数执行会打印调用信息
   + `mointorEvents(window, 'clicl')`：监听一个事件，事件触发打印事件日志
4. 监听变量（一个小眼睛），可以实时监听表达式的值

### 源代码面板 Source

+ **页面资源目录**：页面涉及的所有资源（树）。
+ **源代码**：文件源代码，可以在这里添加断点调试JS代码，如果想编辑在线JS代码，也是可以的，详见后文。
+ **Debug工具栏**：断点调试的操作工具，可以控制暂停、继续、单步...执行代码。
+ **断点调试器**：这里包含多个断点调试器
  + **监视（Watch）**：可添加对变量的监视。
  + **断点（Breakpoints）**：所有添加的断点，可在这里编辑、删除管理。
  + **作用域（Scope）**：当前代码上下文的作用域，含闭包。
  + **调用堆栈（Call Stack**）：当前函数的调用堆栈
  + **XHR/提取断点**：可以在这里添加对AJAX请求（XHR、Fetch）的断点，添加URL地址即可。
  + **DOM断点**：在元素页面添加的DOM断点会在这里显示。


源代码下面找到“覆盖（Override）”，可以选择本地代码替代，在这里调试能实时生效。

### 网络面板 Network

+ 工具栏-禁用缓存：Disable cache（结合LightHouse可以比较使用缓存和不使用缓存的优势）
+ 工具栏-模拟弱网络环境：Hide data URLs
+ 请求资源项：header，payload（响应数据原始），preview（响应数据预览，更易于阅读）

### 页面概况分析 Performance + Memory

先录制，后分析，分析网络、CPU、内存、渲染FPS帧率，用于定位、解决页面性能问题。

#### 如何排查内存泄露

内存泄露有哪些：

1. 意外的全局变量

+ 变量没有声明直接使用，会提升到全局
+ this指向window，用this创建变量

解决：

+ 严格模式，或者开启lint检查，避免使用全局变量
+ 使用完 = null，让他被垃圾回收

2. 闭包
3. 游离的DOM引用
   + 如果在应用程序中频繁地创建和销毁DOM对象，就容易导致内存泄漏。
   + 游离的DOM引用指的是已经不在文档中的DOM节点的引用，但是这些引用仍然被保存在JavaScript的变量、数组和对象中，因此这些DOM节点无法被垃圾回收器回收，从而导致内存泄漏。
4. 事件监听器没有移除
   + 以vue为例，需要在组件卸载的时候，removeEventListener
5. 定时器未清除
   + 使用 `setInterval` 方法创建定时器 `timer` ，每1秒输出一个数字到控制台。如果不将 `timer` 清除，那么程序将会继续在后台运行。可以使用 `clearInterval` 方法来清除。
6. 循环引用，不会被垃圾回收
7. 未清除的console输出，可以用`console.clear`清除



**如何排查？**

使用`Chrome Devtool`,尽量使用无恒模式，这样不会受到插件影响。

1. 进入 Performance，勾选 screenShots和Memory，点击录制
2. stop后，会生成涵盖此过程中页面各种参数的图表
3. 注意在记录之前及记录结束时都要按一下上方的垃圾桶图标进行**手动垃圾回收**，如果结束时js heap图像没有下降，一直是阶梯式增长，那么很有可能页面存在内存泄漏。

​	<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff65ad2f8d9746e0a7b54146eb569c78~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?" alt="Snipaste_2023-05-09_18-46-09.png" style="zoom:50%;" />		

可以先借助Performance 中堆内存随着事件流而增长的图像，来大概定位内存泄露的大概位置。

在记录前和结束时，都手动垃圾回收一下，如果js heap没有下降，那很可能存在内存泄露。

![image-20230830223338977](C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230830223338977.png)




4. 精确定位，借助 Memory 面板的` Heap Snapshot`

   + `Heap Snapshot`生成堆快照，点击前都要手动垃圾回收
   + 进行一些内存泄露的可以操作后，再生成堆快照，通过`Comparsion`对比快照的差异，如果发现 `closure闭包` 是内存增长的大头
   + 在点一次垃圾回收并继续记录堆快照，再对比，发现这个时候内存释放的却很少，就可以展开定位了

5. 精确定位，借助 Memory 面板的`Allocation Instrumentation on Timeline`

   + 可以随时间线查看堆内存的分配情况

   + 每个柱条的高度对应最近分配的对象的大小，柱条的颜色表示这些对象是否仍然在最后的堆快照中。蓝色条表示在时间轴结束时仍然存活的对象，灰色条表示在时间轴期间分配但已经被垃圾回收的对象。

     ![image-20230830225453334](C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230830225453334.png)

##### performance monitor 工具

打开后会在下方显示一个CPU 使用率、JS 堆内存、DOM 节点数等信息的实时面板，然后可以自己手动进行一些可疑操作，观察 JS 堆内存、DOM节点数的实时变化，如果在某些操作下，JS 堆内存持续增长，没有被自动垃圾回收，那么就很有可能这些操作造成了内存泄漏。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230830181355320.png" alt="image-20230830181355320" style="zoom:33%;" />

### Lighthouse 性能分析

+ Performance

  + CP(白屏时间)：

  + TTI(交互响应时间)

  + LCP(最大内容时间)
  + CLS（累计布局偏移）

+ Accessibility可访问性

  + 首次输入延迟
  + 最大内容绘制
  + 总阻塞时间

+ Best Practices给出一些建议

+ SEO优化
