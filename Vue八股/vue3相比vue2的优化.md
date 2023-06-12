## 1 源码优化

### 1.1 代码管理方式 monorepo

vue2源码在src目录下，依据功能分出了compiler（模板编译相关代码），core（与模板无关的通用运行时代码），platforms（平台专有代码），server（服务端渲染相关），sfc（.vue单文件解析相关），shared（工具类代码）等
<img src="http://assets.eggcake.cn/1611159481222.jpg">

vue3整个源码通过monorepo方式维护，根据功能将不同的模块拆分到packages目录下面不同的子目录中。采用一个仓库维护一个项目的方案。对于一个庞大复杂的项目，哪怕只进行一处小小的修改，影响的也是整体。而采用 monorepo 的形式，我们可以在一个仓库中管理多个包。每个包都可以单独发布和使用，就好像是一个仓库中又有若干个小仓库。比如，如果用户只想使用vue的响应式能力，可以单独依赖这个reactive库，而不用去依赖整个vue.js，减小了包的引用体积。
<img src="http://assets.eggcake.cn/1611159725833.jpg">

### 1.2 拥抱ts

类型语言有利于代码的维护，可以在编码期间做类型检测，避免因类型问题导致的错误。

## 2 性能优化

### 2.1 源码体积优化

引入tree-shaking技术，减少打包体积。原理：依赖模块语法（import和export），模块异步加载，import静态解析，编译期间静态分析，找到没有引入的模块打上标记，不会被打包。

### 2.2 数据劫持优化

vue2之前都是通过Object.defineProperty去劫持数据的getter和setter。
~~~js
Object.defineProperty(data, "a", {
  get() {
    // track
  },
  set() {
    // trigger
  },
});
~~~
缺陷在于：
+ 必须预先知道劫持的key，所以不能检测出对象属性的添加和删除。使用`$set`和`$delete`会添加用户的心智负担。
+ 对于层级比较深的对象，必须递归遍历整个对象，把每一层数据都变成响应式的。

vue3使用Proxy API做数据劫持
~~~js
observed = new Proxy(data, {
  get() {
    // track
  },
  set() {
    // trigger
  },
});
~~~
劫持了整个对象，对于对象属性的增加和删除都能检测到。proxy并不能检测到内部深层次的对象变化，因此。vue3在getter中去递归响应式，这样的好吃是只有真正访问到的内部对象，才会变成响应式。

### 2.3 编译优化

## 语法API优化：Composition API
