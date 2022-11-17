## Cookie和Session

cookie和session都是普遍用来跟踪浏览用户身份的会话方式。

会话：在线购物网站，登录网站都需要管理会话，也就是记住用户登录过系统，用户在购物车中放了商品，都需要管理会话将每个用户区分开来。

### 什么是Cookie？

+ **HTTP是无状态**的协议（每次客户端和服务端完成会话，**服务端不会保存任何会话信息**）：每个请求是独立的，服务端无法确认当前访问者的信息，所以需要主动维护一个状态，告知服务端每次请求是否来自一个用户。这个状态通过cookie和session实现。
+ **cookie存储在客户端**：cookie是服务端发送给用户浏览器并保存在本地的数据，会在浏览器下次向同一服务器再发请求时被携带并发送到服务器上
+ **cookie不可跨域**：每个cookie都会绑定单一的域名，不同域名之间不能共享。但是，**在顶级域名、二级域名、三级域名中是可以共享的**，比如A.xxx.com和B.xxx.com都解析于xxx.com顶级域名之下，如果要实现相互共享，就把两个域名的cookie域都设置成顶级域名。

Cookie主要用于三个目的：

+ 会话管理：登录、购物车等服务器应该记住的其他内容
+ 个性化：用户偏好、主题等设置
+ 追踪：记录和分析用户行为

#### 为什么cookie默认不在跨域请求中？

#### Cookie重要属性

| 属性        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| name和value | 键值队，设置Cookie的名称和对应的值，必须是**字符串类型**<br/>\- 如果值为 Unicode 字符，需要为字符编码。<br/>\- 如果值为二进制数据，则需要使用 BASE64 编码。 |
| domain      | 指定cookie所属的域名，默认是当前域名                         |
| path        | **指定cookie在哪个路径下生效，默认是‘/’**<br/>如果设置为 "/home"，则只有 ”/home“下的路由可以访问该cookie，如`/home/detail` |
| maxAge      | cookie失效的时间，单位秒。<br/>如果为负数，该cookie为临时cookie，关闭浏览器失效。<br/>如果为0，表示删除该cookie。<br/>默认为-1，**比expires字段好用** |
| expires     | cookie过期时间（**绝对时间**），在设置的某个时间点后cookie失效<br/>一般浏览器的cookie都是默认存储，当关闭浏览器时，这个cookie删除（maxAge默认为-1） |
| secure      | 该cookie是否**仅被使用安全协议传输**（HTTPS），默认为false   |
| httpOnly    | 如果给某个cookie设置了httpOnly属性，则无法通过JS脚本读取到cookie信息，但还是能通过Application中手动修改cookie，所以只能在一定程度上防止XSS攻击，不是绝对的安全 |

#### 创建cookie

+ `Set-Cookie`响应header将cookie从服务器发到浏览器，此标头告诉浏览器存储这个Cookie。
+ 针对服务器的每个新请求，浏览器都会使用Cookie头**将所有以前存储的Cookie发送回服务器**
+ 两种类型cookie，`Session Cookies`和`Persistent Cookies`
  + Cookie不包含到期时间，为会话Cookie，保存在内存中，不会写入磁盘，浏览器关闭后，Cookie永久消失
  + 如果Cookie包含有效期，则将视作为持久性Cookie，到指定日期后，Cookie从磁盘中删除

#### cookie中的作用域

`Domain` 和 `Path` 标识定义了 Cookie 的作用域：即 Cookie 应该发送给哪些 URL。

`Domain` 标识指定了哪些主机可以接受 Cookie。如果不指定，默认为当前主机(**不包含子域名**）。如果指定了`Domain`，则一般包含子域名。

例如，如果设置 `Domain=mozilla.org`，则 Cookie 也包含在子域名中（如`developer.mozilla.org`）。

例如，设置 `Path=/docs`，则以下地址都会匹配：

- `/docs`
- `/docs/Web/`
- `/docs/Web/HTTP`

### 什么是session？

+ session是另一种记录服务器和客户端会话状态的机制
+ session基于cookie实现，session存储在服务端，sessionId会被存储到客户端的cookie中

#### session如何判断是同一会话？

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221117144438848.png" alt="image-20221117144438848" style="zoom: 30%;" />

+ 服务器第一次收到请求，开辟一块Session空间（创建了Session对象）
+ 同时生成一个sessionId，并通过响应头的`Set-Cookie: JSESSIONID=xxx`，向客户端发送要求设置Cookie的响应
+ 客户端收到响应后，在本机客户端设置了一个`JSESSIONID=xxx`的Cookie信息，该Cookie的过期时间为浏览器会话结束
+ 接下来客户端每次向同一个网站发送请求时，请求头都会带上该Cookie信息
+ 服务器再通过读取JSESSIONID的值，得到此次请求的sessionid，再寻找到对应的session

#### session的缺点

因为session存储在服务端，如果A服务器存储了Session，但是在做了**负载均衡**后，假如一段时间内A的访问量激增，会转发到B进行访问，但是B服务器并没有存储A的Session，会导致Session失效。

#### cookie和session的区别

+ **安全性：**Session比Cookie安全，因为Session存储在服务器，Cookie存储在客户端
+ **存储值类型不同：**Cookie只能存储字符串数据，想要设置为其他类型数据，需要借助jsonify转化为字符串。Session可以存储任意数据类型
+ **有效期不同：**Cookie可以设置长时间保存，比如经常使用的默认登录功能。Session一般失效时间较短，客户端关闭（默认情况下）或者session超时就会失效
+ **存储大小不同：**单个Cookie保存的数据不能超过4K，Session可存储数据远高于Cookie，但是当访问量过多，会占用过多服务器资源

## localStorage和sessionStorage

在web本次存储场景上，cookie的使用频频受限，关键在于：**存储容量太小** 和 **数据无法持久化存储**。

在HTML5的标准下，推出了webStorage，包括：`localStorage`和`sessionStorage`

#### 什么是webStorage

webStorage可以在客户端保存大量数据，其优势在于：

+ 存储容量大
+ 零带宽，仅存储在本地，不会与服务器发生任何交互行为
+ 编程接口，提供了一套丰富的接口，使得数据操作更方便
+ 独立的存储空间，每个域都有独立的存储空间，各个存储空间独立。

#### cookie、localStorage、sessionStorage比较

| 分类           | 生命周期                                                     | 存储容量               | 存储位置                     |
| -------------- | ------------------------------------------------------------ | ---------------------- | ---------------------------- |
| cookie         | 默认保存在内存中，随浏览器关闭失效；<br/>如果设置国过期时间，存放在硬盘，并在过期时间后失效 | 4kb（单个cookie）      | 客户端，每次发送请求都会带上 |
| localStorage   | 理论上永久有效，除非主动清除                                 | 4.98MB(不同浏览器不同) | 客户端，不与服务端交互       |
| sessionStorage | 仅在当前网络会话下生效，关闭页面或者浏览器失效               | 4.98MB                 | 客户端，不与服务端交互       |

> + 本地存储适合缓存持久化数据，比如页面默认偏好设置等；会话存储适合一些一次性临时数据。
> + `localStorage`存储的数据被限制在同源（协议、端口号、域名一致）下,可跨窗口通信,不可跨浏览器,跨域；
> + `sessionStorage`存储的数据被限制在标签页(页卡关闭丢失)。

#### webStorage接口相关方法

~~~js
localStorage.setItem("name", "value");
localStorage.getItem("name"); // 'value'
localStorage.removeItem('name');
localStorage.clear(); // 删除所有数据

sessionStorage.setItem("name", "value");
sessionStorage.setItem("name");
sessionStorage.setItem("name");
sessionStorage.clear();
~~~

注意：

+ localStorage写入的时候，如果超出容量会报错，但之前保存的数据不会丢失
+ localStorage存储快要满的时候，getItem性能急剧下降
+ webStorage保存复杂数据类型时，依赖`JSON.stringify`，在移动端性能问题比较明显

#### 如何给localStorage设置过期时间？

localStorage除非手动清除，否则会一直存放在浏览器中。

如果要实现一个需求：要求localStorage有一个过期时间，将用户token存放在客户端，一周内有效，超过一周则要重新登录。

**实现方式：**

先给Storage接口添加一个原型方法，实现过期机制

**将当前的时间，和有效期传入,下次获取值的时候判断当前时间和上次 记录时间之差是否大于expire，大于的话就清空当前项，并返回null**

~~~js
Storage.prototype.setExpire = (key, value, expire) => {
	let obj = {
        data: value,
        time: Date.now(),
        expire: expire
    };
    // localStorage设置的值不能为对象，这里使用了JSON.stringify()将其转化为字符串，等到使用的时候再通过JSON.parse()转化回来
    localStorage.setItem(key, JSON.stringify(obj));
}
~~~

添加一个获取的方法：

~~~js
Storage.prototype.getExpire = key => {
    let val = localStorage.getItem(key);
    if (!val) {
        return val;
    }
    val = JSON.parse(val);
    if ((Date.now - val.time) > val.expire) {
        localStorage.removeItem(key);
        return null
    };
    return val.data;
}
~~~

测试：

~~~js
localStorage.setExpire("token",'xxxxxx',5000);
window.setInterval(()=>{
    console.log(localStorage.getExpire("token"));
~~~

### html5其他几种存储方法

1. 离线缓存 `application cache`
2. `indexedDB 和 webSQL`：用于结构化数据存储