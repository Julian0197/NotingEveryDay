## 预加载和懒加载

### 预加载

预加载简单来说就是将所有所需的资源提前请求加载到本地，这样后面在需要用到时就直接从缓存取资源。

加载技术会增加服务器的压力，但是用户的体验会比较好，得看实际运用场景。

#### 图片预加载

+ img标签会在Html渲染解析到的时候，如果解析到img中src的值，则浏览器会立即开启一个线程去请求该资源（并行加载，不阻塞html构建）。
+ 所以我们可以先将img标签隐藏但src写上对应的链接，这样皆可以把资源先请求回来了

~~~html
<img src="https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg" style="display: none" />  
~~~

#### js预加载

##### preload预加载静态资源

##### 合理运用 async，defer，type="module"

~~~html
<script src="index.js"></script>
~~~

浏览器在解析HTML时，如果遇到一个没有任何属性的script标签，就会暂停解析，先发送网络请求获取该js脚本的代码，然后让主线程让js引擎执行该改吗，执行完毕后再恢复解析。

1. 只包含`async`模式下，请求该脚本的**网络请求是异步的**，不会阻塞浏览器解析HTML。一旦网络请求回来后，如果此时HTML还没有解析完，浏览器会暂停解析，先让JS引擎执行代码，执行完毕后再解析。

所以 async 是不可控的，因为执行时间不确定，你如果在异步 JS 脚本中获取某个 DOM 元素，有可能获取到也有可能获取不到。而且如果存在多个 async 的时候，它们之间的执行顺序也不确定，完全依赖于网络传输结果，谁先到执行谁。

~~~html
<script async src="index.js"></script>
~~~

2. 只包含`defer` 模式下，当浏览器遇到带有 defer 属性的 script 时，获取该脚本的网络请求也是异步的，不会阻塞浏览器解析 HTML，一旦网络请求回来之后，如果此时 HTML 还没有解析完，浏览器**不会暂停解析并执行 JS 代码**，而是等待 HTML 解析完毕再执行 JS 代码。

如果存在多个 defer script 标签，浏览器（IE9及以下除外）会保证它们**按照在 HTML 中出现的顺序执行**，不会破坏 JS 脚本之间的依赖关系。

~~~html
<script defer src="index.js"></script>
~~~

3. `type = module`

主流浏览器都支持 ESM，但是需要再script标签上加上 `type = module`

浏览器会对其内部的 import 引用发起 HTTP 请求，获取模块内容。这时 script 的行为会像是 `defer` 一样，在**后台下载**，并且等待 DOM 解析完后再执行js代码

~~~html
<script type="module">import { a } from './a.js'</script>
~~~

4. 用不到的script标签最好放在html最底部，这样可以避免阻塞html解析

### 预加载静态资源 link标签+preload属性

preload 一般是预加载当前页面要用到的图片、字体、js 脚本、css 文件等静态资源文件。**先加载这些静态资源，并推迟到要使用再执行。**

1. 场景1，预加载js文件，用到的时候再调用

+ 创建一个HTMLLinkElement 实例，然后将他们附加到 DOM 上：
 ~~~js
var preloadLink = document.createElement("link");
preloadLink.href = "myscript.js"; // 预加载的静态资源
preloadLink.rel = "preload"; // preload标识预加载
preloadLink.as = "script"; // 被链接资源的类型
document.head.appendChild(preloadLink);
 ~~~

浏览器会预先加载这个js文件，但不实际执行他。

+ 真正使用时，创建一个新的script标签，设置src属性来执行预加载的资源
~~~js
var preloadedScript = document.createElement("script");
preloadedScript.src = "myscript.js";
document.body.appendChild(preloadedScript);
~~~

2. 场景2，预加载字体，用到的时候直接使用

+ 如果没有preload，也是可以正常执行的，但是加载src中的字体需要等到当前页面的js，css加载完毕才回去请求
~~~js
<style>
  @font-face {
    font-family: Test-Number-Medium;
    src: url(./static/font/Test-Number-Medium.otf);
  }
</style>
~~~

+ 加上preload可以预加载字体，通常加载字体会很快
~~~js
<link rel="preload" href="./static/font/Test-Number-Medium.otf">
~~~

##### prefetch预加载

prefetch 一般是预加载非当前页面的资源，prefetch 是一个**低优先级**的资源提示，允许浏览器在后台（空闲时）获取将来可能用得到的资源，并且将他们存储在浏览器的缓存中。

~~~js
<link rel="prefetch" href="/uploads/images/pic.png">
~~~

##### dns-preconnect预解析

例如：`<link rel="preconnect" href="https://code.jquery.com" as="script">`

+ 提前 DNS查询，TLS协商，tcp握手
+ 对当前域名的资源无效（因为已经有缓存了），一般对cdn或其他域的资源 有效

场景：页脚有个cdn资源`<script>`，则可以在页眉可以放一个`preconnect`资源提示

```html
<head>
  <meta charset="utf-8">
  <title>preconnect example</title>
  
  <link rel="preconnect" href="https://code.jquery.com/jquery-3.6.0.min.js" as="script">
</head>

<body>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</body>
```

### 懒加载

#### 图片懒加载

对于一些图片比较多的页面，用户打开页面后，只需要呈现出在屏幕可视区域内的图片，当用户滑动页面时，再去加载出现在屏幕内的图片，以优化页面的加载效果；

实现：页面中的`img`元素，如果没有`src`属性，浏览器就不会发出请求去下载图片，只有通过javascript设置了图片路径，浏览器才会发送请求。懒加载的原理就是先在页面中把所有的图片统一使用一张占位图进行占位，把正真的路径存在元素的“data-url”（这个名字起个自己认识好记的就行）属性里，要用的时候就取出来，再设置。

+ 如何获取屏幕可视窗口大小
+ 
~~~js
window.innerHeight // 标准浏览器及IE9+ 
document.documentElement.clientHeight // 标准浏览器及低版本IE标准模式
document.body.clientHeight  // 低版本混杂模式
~~~


+ 获取浏览器窗口顶部与文档顶部之间的距离，即**滚动条滚动的距离**

~~~js
window.pagYoffset // 标准浏览器及IE9+
document.documentElement.scrollTop // 兼容ie低版本的标准模式 
document.body.scrollTop // 兼容混杂模式；

// html5新增
// 可以比较初始和停止滚动时top的差距
const { top: newY } = contentRef.current.getBoundingClientRect();
~~~

`getBoundingClientRect` 是一个用于获取指定元素的位置和尺寸信息的方法。它返回一个 DOMRect 对象，其中包含了元素的左上角坐标、宽度、高度等信息。

#### 路由懒加载

在SPA应用中，一个路由对应一个页面，如果我们不做任何处理，项目打包时，所有的页面都会打包成一个文件，当用户去打开首页时，就会去一次性加载所有的资源，这样首页加载就会慢，降低用户体验。

懒加载就是根据`import()`去实现的，调用import()之处，被作为分离模块的起点，意思是，被请求的模块和它引用的所有子模块，会被分离到一个单独chunk中；所以实现懒加载的方法，就是将需要进行懒加载的子模块分离出来，打包成一个单独的文件，这样就不会一次加载所有的资源了；


##### 使用webpack

懒加载本质：**代码分离**，将代码分离到不同的bundle中，然后按需加载或并行加载这些文件。webpack中实现代码分离方式有：入口起点（entry中手动分离），防止重复（去重和分离chunk），动态导入（模块的内联函数来分离代码）

~~~js
const UserDetails = () =>
  import(/* webpackChunkName: "group-user" */ './UserDetails.vue')
const UserDashboard = () =>
  import(/* webpackChunkName: "group-user" */ './UserDashboard.vue')
const UserProfileEdit = () =>
  import(/* webpackChunkName: "group-user" */ './UserProfileEdit.vue')
~~~

+ 在使用 webpack 进行懒加载时，会将懒加载的模块打包成一个单独的文件，并使用 JSONP 技术动态加载该文件。
+ `jsonp`:允许在浏览器中动态创建`<script>`标签，通过向不同域名的服务器请求脚本文件，并在脚本文件中包含回调函数来传递数据，可以绕过浏览器的同源策略，实现在当前页面加载来自不同域名的代码。

注：有时候我们想把某个路由下的所有组件都打包在同个异步块 (chunk) 中。只需要使用命名 chunk

##### 使用vite

在Vite中，你可以在rollupOptions下定义分块：

~~~js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {
          'group-user': [
            './src/UserDetails',
            './src/UserDashboard',
            './src/UserProfileEdit',
          ],
        },
      },
    },
  },
})
~~~

#### 组件懒加载

实现原理和路由懒加载是一样的，都是通过import()的方式实现的

假设有两个复杂页面都使用到了同一个组件，项目打包后，发现两个页面均包括了该组件的代码；且该组件又不是一进入页面就触发的，需要一定条件才触发的；这个时候就比较适合使用组件懒加载；即组件懒加载的使用场景有：

+ 该页面文件体积大，导致页面打开慢，可以通过懒加载进行资源拆分，利用浏览器的并行下载提升速度
+ 该组件又不是一进入页面就触发的，需要一定条件才触发的（比如弹窗）
+ 该组件复用性高，很多页面引用，可以理由懒加载单独形成一个文件
+ 其他时候不建议拆分过细，因为会造成浏览器http请求增多；

## 减少静态资源大小

### 代码层优化

+ webpack tree shaking只打包用到的依赖包
+ 代码分割 code spliting，不同页面加载自己用到的代码，不加载其他页面的代码（其实也属于懒加载）。

### 传输层优化

HTTP传输采用压缩传输，开启`gzip`, 基本都能压缩 6 倍左右（一般都是文件越大，字符串相似率越大，压缩率越大）

经过服务器压缩后，设置HTTP响应头的 `Content-Encoding: gzip`，浏览器会自动解压。

## 利用http 2.0

### 二进制分帧

HTTP/2 使用二进制分帧（Binary Framing）来传输数据。在 HTTP/2 中，所有的数据都被分割成更小的帧（Frames）进行传输。每个帧都有一个帧头（Frame Header），用于标识帧的类型、长度和其他相关信息。

通过使用二进制分帧，HTTP/2 提供了以下几个优势：

+ 多路复用（Multiplexing）：HTTP/2 允许在同一个连接上同时发送和接收多个请求和响应。每个请求和响应都被划分为多个帧，可以并发地发送和接收，无需按顺序等待。这提高了并发请求的效率和性能。

+ 流量控制（Flow Control）：HTTP/2 支持流量控制机制，可以在发送方和接收方之间进行流量控制，防止接收方被过多的数据淹没。每个帧都可以设置一个权重和优先级，以便进行合理的流量控制。

+ 优化性能：二进制分帧可以更有效地使用网络带宽。HTTP/2 可以将多个请求和响应打包在同一个 TCP 连接中，减少了建立和关闭连接的开销，并通过头部压缩（Header Compression）来减小数据的大小，提高传输效率。

### 多路复用

浏览器存在**同域名并发限制**，HTTP1.1（包括之前版本），最多并发6个。

+ HTTP1.1 持久连接解决了连接复用问题，一个 TCP 连接可以同时发送多个请求，并且无需等待每个响应完成才能发送下一个请求。这是通过使用管道（Pipeline）技术实现的。但它存在一个问题，即队头阻塞（Head-of-Line Blocking）。由于响应的顺序与请求的顺序一致，如果某个请求的响应较慢，那么后续的请求也必须等待该响应返回后才能继续进行。
+ HTTP/2 协议引入了多路复用（Multiplexing）技术。HTTP/2 允许在同一个连接上同时发送和接收多个请求和响应，无需按顺序等待。这样可以提高并发请求的效率和性能。
  + 有多路复用特性，那么浏览器对同一域名的链接数的限制也是没必要的了

### 首部字段压缩

HTTP2.0 使用 HPACK 算法对首部字段的数据进行压缩，这样数据体积小了，在网络上传输就会更快

## 使用CDN

CDN 最大的优势在于提升用户资源访问速度，因此静态资源走 CDN 是一个很好的优化点。

原理：
1. 缓存：CDN 部署了一系列的边缘节点（Edge Nodes），这些节点分布在全球各个地理位置。当用户请求访问某个网站或资源时，CDN 会根据用户的位置，将内容缓存到离用户最近的边缘节点上。

2. 就近访问：当用户发起请求时，CDN 会根据用户的 IP 地址或 DNS 解析结果，将用户的请求导向离用户最近的边缘节点。这样可以减少数据传输的延迟和网络拥塞，提高访问速度。

3. 负载均衡：CDN 会根据边缘节点的负载情况和用户的位置，动态选择最适合的边缘节点来处理用户的请求。这样可以实现负载均衡，避免某个节点过载而影响用户访问体验。

4. 静态内容加速：CDN 主要用于加速静态内容的传输，如图片、CSS、JavaScript 文件等。这些静态内容通常具有较长的缓存时间，可以被缓存在边缘节点上，从而减少源服务器的负载和网络传输的时间。

5. 动态内容优化：CDN 还可以对动态内容进行优化。一种常见的方法是使用缓存服务器与源服务器之间的缓存协商，只在需要更新时才向源服务器请求最新的内容。

6. 容错和冗余：CDN 的边缘节点通常会有多个副本，以提供容错和冗余。如果某个节点发生故障或不可用，请求会自动转发到其他可用的节点上，从而保证服务的可靠性和可用性。

