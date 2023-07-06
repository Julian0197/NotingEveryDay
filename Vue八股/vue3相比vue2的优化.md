## 1 源码优化

### 1.1 使用pnpm workspace实现monorepo

vue2源码在src目录下，依据功能分出了compiler（模板编译相关代码），core（与模板无关的通用运行时代码），platforms（平台专有代码），server（服务端渲染相关），sfc（.vue单文件解析相关），shared（工具类代码）等
<img src="http://assets.eggcake.cn/1611159481222.jpg">

vue3整个源码通过monorepo方式维护，根据功能将不同的模块拆分到packages目录下面不同的子目录中。采用一个仓库维护一个项目的方案。对于一个庞大复杂的项目，哪怕只进行一处小小的修改，影响的也是整体。而采用 monorepo 的形式，我们可以在一个仓库中管理多个包。每个包都可以单独发布和使用，就好像是一个仓库中又有若干个小仓库。比如，如果用户只想使用vue的响应式能力，可以单独依赖这个reactive库，而不用去依赖整个vue.js，减小了包的引用体积。

+ 共用基础设置，不用重复配置
+ 有依赖的项目之间调试方便
+ 第三方库的版本管理更简单
+ 无需切换开发环境，但打包时可以打包具体模块

下面时vue3的模块目录：

<img src="http://assets.eggcake.cn/1611159725833.jpg">

+ compiler-core 模板解析核心，与具体环境无关，主要生成 AST，并根据 AST 生成 render() 函数
+ compiler-dom 浏览器环境中的模板解析逻辑，如处理 HTML 转义、处理 v-model 等指令
+ compiler-sfc 负责解析 Vue 单文件组件
+ compiler-ssr 服务端渲染环境中的模板解析逻辑
+ reactivity 响应式数据相关逻辑
+ runtime-core 与平台无关的运行时核心
+ runtime-dom 浏览器环境中的运行时核心
+ runtime-test 用于自动化测试的相关配套
+ server-renderer 用于 SSR 服务端渲染的逻辑
+ shared 一些各个包之间共享的公共工具
+ size-check 一个用于测试 tree shaking 后代码大小的示例库
+ template-explorer 用于检查模板编译后的输出，主要用于开发调试
+ vue Vue3 的主要入口，包含不同版本的包

#### workspace协议，模块之间相互依赖

本地 workspace 包只要进行标注 `workspace:*` 协议，这样依赖就本地的包了，不需要从npm registry安装。优点在于：包之间相互引用代码时，使用 workspace:* 的写法来链接子包，不是具体的版本号，防止多人协作时因为修改版本而产生的冲突。

比如在vuejs的pnpm-workspace.yaml种配置了：

~~~js
packages:
  - 'packages/*'
~~~

本身packages底下每一个文件都是一个npm包，都有自己的工作区，安装包都会在当前文件内安装。配置上述workspace表示：packages底下的所有文件都会被视为一个独立的包，它们会被安装到 monorepo 根目录下的 `node_modules` 目录中。这样，你就可以在 monorepo 中方便地共享依赖，而不需要为每个子目录都安装一遍依赖。

#### 升级pnpm

pnpm的p指的是performant，高性能体现在：快速，节省磁盘空间。并且支持workspace协议和monorepo架构。

pnpm依赖**包扁平化管理原则**:
1. 全局store：
在根目录下的`node_modules`下创建一个`.pnpm`名称的目录，把项目中所有的依赖都安装到里面，形成一个`包名 + 内部依赖 +  版本信息`的目录。
比如在pnpmp下安装了`express`的依赖：
~~~bash
node_modules/express/...
node_modules/.pnpm/express@4.17.1/node_modules/xxx
~~~

第一个路径是nodejs会正常去找的目录，但是这个目录下的文件是一个软连接，他会形成一个到第二个目录的链接方式（类似软件的快捷方式），最终找到pnpm目录下的内容。.pnpm是一个虚拟磁盘目录，express这个依赖的一些依赖会被平铺到`.pnpm/express@4.17.1/node_modules/`下，保证了依赖能被require到，同时也不会有很深的依赖层级。

1. symlink（软链接） 和 hard link（硬链接） 机制

+ 硬链接是与源文件或目录相互关联的文件或目录，它们共享相同的inode和block，可以在同一文件系统上创建。如果源文件或目录被删除，则硬链接文件或目录仍然存在，因为它们共享inode和block。

+ 软链接又可以说成是符号连接，它有点类似于Windows的快捷方式，实际上它是一个特殊的文件。在符号连接中，文件实际上是一个文本文件，其中包含的有另一文件的位置信息。

假如有一个项目依赖了 bar@1.0.0 和 foo@1.0.0，最后的node_modles结构如下所示：

+ node_modules下的bar和foo会软连接到,pnpm目录下的真实依赖
+ node_modules 中的 bar 和 foo 两个目录会软连接到 .pnpm 这个目录下的真实依赖中，而这些真实依赖则是通过 hard link 存储到全局的 store 目录中。


~~~bash
node_modules
└── bar // symlink to .pnpm/bar@1.0.0/node_modules/bar
└── foo // symlink to .pnpm/foo@1.0.0/node_modules/foo
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar -> <store>/bar
    │           ├── index.js
    │           └── package.json
    └── foo@1.0.0
        └── node_modules
            └── foo -> <store>/foo
                ├── index.js
                └── package.json
~~~

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/359e5ed35b754b64b82c2dd0b1b8d364~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?">


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

### 2.4 diff算法优化

Vue3在diff算法上进行了一系列的优化，主要包括以下几点：

1. 静态节点提升

在Vue2中，每次组件重新渲染时，都需要重新创建VNode节点树。而在Vue3中，对于不会发生变化的节点，会在编译阶段将它们提升为静态节点，避免重复创建和比较。

2. 高效的动态节点处理

对于动态节点，Vue3采用了一种新的算法——基于“动态规划”的最长递增子序列算法。它能够在时间复杂度为O(nlogn)的情况下，找到最长的不需要移动的序列，从而减少了大量的比较和移动操作。

3. 缓存节点

Vue3引入了一个新的缓存机制，可以缓存已经比较过的节点，避免重复的比较和创建。这在处理大量数据时，可以提高渲染性能。

4. 组件级别的diff算法

Vue3中的diff算法是组件级别的，只会在需要更新的组件中进行比较和更新，避免了不必要的比较和渲染。

总的来说，Vue3在diff算法上的优化，能够有效地提高渲染性能，尤其是在处理大量数据时，可以明显地感受到其优势。

## 3 语法API优化：Composition API

组合式API到底是什么？



### 3.1 新增Fragments虚拟节点

vue3中 不要求模板的根节点必须是一个。根节点或者h函数返回的可以是纯文字，数组（代表多个真实节点），单个节点，如果是数组，会将他们用fragment包裹。

实际上vue中每个组件实例必须绑定一个el，因为Vue3的渲染机制是基于Renderer API的，每个组件的渲染函数会返回一个VNode树，这个VNode树会被Renderer API转换成真实的DOM节点，并挂载到组件实例的el上。因此，每个组件实例只能绑定一个el。

diff算法在处理Fragments时，Renderer API会单独处理将Fragments中的子节点展开，然后进行比较和更新。

### 3.2 新增teleport组件