### HTTP缓存技术

对于重复性的HTTP请求，可以把这对[请求-响应]的数据**缓存到本地**，下次可以直接读取本地数据，不用再向服务器发出请求。

HTTP缓存技术可以提高HTTP/1.1的性能。

HTTP缓存分为：**强制缓存和协商缓存**

所有和缓存相关的HTTP属性：
+ Cache-Control: 定义缓存期限
+ Expires： 指定缓存过期时间
+ Etag： 识别资源内容的唯一标识
+ Last-Modified：指示资源的最后修改时间

#### 强制缓存

强制缓存是指只要浏览器判断缓存没有过期，则直接使用浏览器的本地缓存，决定是否使用缓存的主动性在于浏览器这边。

如下图中，返回的是 200 状态码，但在 size 项中标识的是 from disk cache，就是使用了强制缓存。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221024201930637.png" alt="image-20221024201930637" style="zoom:28%;" />

强制缓存利用下面HTTP响应头部实现，都表示资源在客户端缓存的有效期：

+ `Cache-Control：max-age=300`，是一个相对时间（http1.1产物）
+ `Expires`，是一个绝对时间（http1.0产物）

如果 HTTP 响应头部同时有 Cache-Control 和 Expires 字段的话，**Cache-Control的优先级高于 Expires** 。

Cache-control 选项更多一些，设置更加精细，属性有：

+ public：响应可以被任何缓存
+ private：响应只能被客户端缓存，不能被代理服务器缓存
+ no-cache：不走强缓存，走协商缓存
+ no-store：不缓存
+ max-age=seconds：有效的缓存时间

所以建议使用 Cache-Control 来实现强缓存。具体的实现流程如下：

+ 浏览器第一次访问服务器，服务器会在返回资源同时，在Response头部加上Cache-Control，Cache-Control设置了过期时间的大小
+ 浏览器再次请求访问服务器中的该资源时，会先**通过请求资源的时间与 Cache-Control 中设置的过期时间大小，来计算出该资源是否过期**，如果没有，则使用该缓存，否则重新请求服务器；
+ 服务器再次收到请求后，会再次更新 Response 头部的 Cache-Control。

#### 协商缓存

在浏览器使用开发者工具的时候，`304状态码`告诉浏览器可以使用本地缓存的资源，这种通过服务器告诉客户端是否可以使用缓存的方式被称为协商缓存。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221024204825315.png" alt="image-20221024204825315" style="zoom:37%;" />

上图就是一个协商缓存的过程，所以**协商缓存就是与服务端协商之后，通过协商结果来判断是否使用本地缓存**。

协商缓存可以基于两种头部来实现。

**第一种：**请求头部中的 `If-Modified-Since` 字段与响应头部中的 `Last-Modified` 字段实现，这两个字段的意思是：

- 响应头部中的 `Last-Modified`：标示这个响应资源的最后修改时间；
- 请求头部中的 `If-Modified-Since`：当资源过期了，发现响应头中具有 Last-Modified 声明，则再次发起请求的时候带上 Last-Modified 的时间，服务器收到请求后发现有 If-Modified-Since 则与被请求资源的最后修改时间进行对比（Last-Modified），如果最后修改时间较新（大），说明资源又被改过，则返回最新资源，HTTP 200 OK；如果最后修改时间较旧（小），说明资源无新修改，响应 HTTP 304 走缓存。

**第二种：**请求头部中的 `If-None-Match` 字段与响应头部中的 `ETag` 字段，这两个字段的意思是：

- 响应头部中 `Etag`：唯一标识响应资源；
- 请求头部中的 `If-None-Match`：当资源过期时，浏览器发现响应头里有 Etag，则再次向服务器发起请求时，会将请求头If-None-Match 值设置为 Etag 的值。服务器收到请求后进行比对，如果资源没有变化返回 304，如果资源变化了返回 200。

第一种实现方式是基于时间实现的，第二种实现方式是基于一个唯一标识实现的，相对来说后者可以更加准确地判断文件内容是否被修改，避免由于时间篡改导致的不可靠问题。

如果在第一次请求资源的时候，服务端返回的 HTTP 响应头部同时有 Etag 和 Last-Modified 字段，那么客户端再下一次请求的时候，如果带上了 ETag 和 Last-Modified 字段信息给服务端，**这时 Etag 的优先级更高**，也就是服务端先会判断 Etag 是否变化了，如果 Etag 有变化就不用在判断 Last-Modified 了，如果 Etag 没有变化，然后再看 Last-Modified。

**为什么 ETag 的优先级更高？**

这是因为 ETag 主要能解决 Last-Modified 几个比较难以解决的问题：

1. 在没有修改文件内容情况下文件的最后修改时间可能也会改变，这会导致客户端认为这文件被改动了，从而重新请求；
2. 可能有些文件是在秒级以内修改的，`If-Modified-Since` 能检查到的粒度是秒级的，使用 Etag就能够保证这种需求下客户端在 1 秒内能刷新多次；
3. 有些服务器不能精确获取文件的最后修改时间。

注意，**协商缓存这两个字段都需要配合强制缓存中 Cache-control 字段来使用，只有在未能命中强制缓存的时候，才能发起带有协商缓存字段的请求**。

下图是强制缓存和协商缓存的工作流程：

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221024211955094.png" alt="image-20221024211955094" style="zoom:29%;" />

总结使用Etag字段实现协商缓存的过程：

+ 当浏览器第一次请求访问服务器资源，服务器在返回这个资源的同时，会在Response头部加上Etag唯一标识，这个唯一标识的值是根据当前请求的资源生成的。
+ 当浏览器再次请求访问服务器中该资源时，首先会检查强制缓存是否过期（浏览器决定，对比请求时间和Response头部中的Cache-Control）
  + 如果没有过期，直接使用本地缓存
  + 如果缓存过期，会在Request头部加上If-None-Match字段，该字段的值就是ETag唯一标识
+ 服务器再次受到请求后，会根据**请求中的If-None—Match值与当前请求的资源生成的唯一标识（ETag）进行比较**：
  + 如果值相等，返回304 Not Modeified，不会返回资源
  + 如果不相等，则返回 200 状态码和返回资源，并在 Response 头部加上新的 ETag 唯一标识；
+ 如果浏览器收到 304 的请求响应状态码，则会从本地缓存中加载资源，否则更新资源。

#### 常用缓存策略

+ html：no-cache，走协商缓存，保证每次拿最新的
+ js文件：css文件：设置max-age，静态资源可以设置较长时间
+ XHR请求：no-cache

#### 前端配置缓存

1. 在HTML的`<head>`标签中嵌入的`<meta>`标签中，通过设置`http-equiv`属性来模拟HTTP头部：

```html
//禁用缓存如下：
<meta http-equiv="pragma" content="no-cache">
// 仅有IE浏览器才识别的标签，不一定会在请求字段加上Pragma，但的确会让当前页面每次都发新请求
<meta http-equiv="cache-control" content="no-cache">
// 其他主流浏览器识别的标签
<meta http-equiv="expires" content="0">
// 仅有IE浏览器才识别的标签，该方式仅仅作为知会IE缓存时间的标记，你并不能在请求或响应报文中找到Expires字段


//设置缓存如下：
<meta http-equiv="Cache-Control" content="max-age=7200" />
// 其他主流浏览器识别的标签
<meta http-equiv="Expires" content="Mon, 20 Aug 2018 23:00:00 GMT" />
// 仅有IE浏览器才识别的标签
```



2. 前端配置缓存只能设置html文件的缓存，对网页中的图片，js文件等其他静态资源无法配置，需要在nginx等服务器站点配置。

常用的web服务器有：nginx、apache。这里列举下nginx的配置示例，具体location匹配正则规则

```js
//示例1：强缓存时效为30s，30s后默认使用协商缓存，此时缓存时效优先级 > max-age
location / {
    add_header Cache-Control max-age=60;
    root   html;
    index  index.html index.htm;
    expires 30s;
}

//示例2: 只使用协商缓存
location / {
    # no-cache 禁用强缓存
    add_header Cache-Control no-cache;
    root   html;
    index  index.html index.htm;
}
```

#### 缓存对页面性能的影响

验证工具：chrome dev tools + Lighthouse

无缓存测试（掘金为例）：

1. 在 Network 选项里面，先打开 disable cache
2. 选择Lighthouse，analyze page load
3. 获得性能报告
   1. FCP：白屏时间
   2. TTI：响应交互时间
   3. LCP：最大内容时间
   4. CLS：累计布局偏移（现有元素的起始位置发生变更）
4. 取消勾选 disable cache(相当于在http请求头加上了`Cache-Control: no-store`)，重复上述操作，可以发现有缓存时：
   1. 白屏时间：缩短 **0.3s**
   2. 交互响应时间: 缩短 **1.4s**
   3. 最大内容时间： 缩短 **1.5s**



缓存位置的区别：

+ `memory cache` 表示缓存来自内存，相比硬盘更快，但关闭tab页面，内存就会被释放，再次打开相同的页面时，原来的 memory cache 会变成 disk cache
+ `disk cache` 表示缓存来自硬盘，关闭tab页甚至关闭浏览器后，数据依然存在，下次打开仍然会是 from disk cache
+ 一般情况下，浏览器会将js和图片等文件解析执行后直接存入内存中，这样当刷新页面时，只需直接从内存中读取(from memory cache)；
+ css文件则会存入硬盘文件中，所以每次渲染页面都需要从硬盘读取缓存(from disk cache)



缓存和不缓存的差异体现在：

+ 网络请求阶段：减少了网络传输时间，因为资源在本地的读取速度快
+ 渲染阶段：下载js或者css可能会阻塞DOM渲染，加长白屏时间
