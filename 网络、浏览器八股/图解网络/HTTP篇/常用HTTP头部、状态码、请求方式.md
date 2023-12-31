### HTTP基本概念

#### HTTP是什么

HTTP 是超文本传输协议，也就是**H**yperText **T**ransfer **P**rotocol。

**HTTP 是一个在计算机世界里专门在「两点」之间「传输」文字、图片、音频、视频等「超文本」数据的「约定和规范」。**

> 那「HTTP 是用于从互联网服务器传输超文本到本地浏览器的协议 ，这种说法正确吗？

这种说法是**不正确**的。因为也可以是「服务器< -- >服务器」，所以采用**两点之间**的描述会更准确。

#### HTTP常见状态码

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221020160851997.png" alt="image-20221020160851997" style="zoom:33%;" />

`1xx` 类状态码属于**提示信息**，是协议处理中的一种中间状态，实际用到的比较少。



`2xx` 类状态码表示服务器**成功**处理了客户端的请求，也是我们最愿意看到的状态。

- 「**200 OK**」200 OK表示客户端发来的请求被服务器端正常处理了。

- 「**204 No Content**」该状态码表示客户端发送的请求已经在服务器端正常处理了，但是没有返回的内容，响应报文中不包含实体的主体部分。一般在只需要从客户端往服务器端发送信息，而服务器端不需要往客户端发送内容时使用。

- 「**206 Partial Content**」是应用于 HTTP 分块下载或断点续传，表示响应返回的 body 数据并不是资源的全部，而是其中的一部分，也是服务器处理成功的状态。

  

`3xx` 类状态码表示客户端请求的资源发生了变动，需要客户端用新的 URL 重新发送请求获取资源，也就是**重定向**。

- 「**301 Moved Permanently**」表示**永久重定向**，说明请求的资源已经不存在了，需改用新的 URL 再次访问，会返回这个新的URL，搜索引擎将更新其索引和链接，以便将搜索结果指向新的 URL。
  - **使用场景：**
    - 当我们想换个域名，旧的域名不再使用时，用户访问旧域名时用301就重定向到新的域名。其实也是告诉搜索引擎收录的域名需要对新的域名进行收录。
    - 在搜索引擎的搜索结果中出现了不带www的域名，而带www的域名却没有收录，这个时候可以用301重定向来告诉搜索引擎我们目标的域名是哪一个。

- 「**302 Found**」表示**临时重定向**，该状态码表示请求的资源被分配到了新的 URL，希望用户（本次）能使用新的 URL 访问资源。和 301 Moved Permanently 状态码相似，但是 302 代表的资源不是被永久重定向，只是临时性质的。也就是说已移动的资源对应的 URL 将来还有可能发生改变。若用户把 URL 保存成书签，但不会像 301 状态码出现时那样去更新书签，而是仍旧保留返回 302 状态码的页面对应的 URL。同时，**搜索引擎会抓取新的内容而保留旧的网址****。因为服务器返回302代码，搜索引擎认为新的网址只是暂时的。
  - 使用场景：
    - 当我们在做活动时，登录到首页自动重定向，进入活动页面。
    - 未登陆的用户访问用户中心重定向到登录页面。
    - 访问404页面重新定向到首页。

301 和 302 都会在响应头里使用字段 `Location`，指明后续要跳转的 URL，浏览器会自动重定向新的 URL。

- 「**304 Not Modified**」不具有跳转的含义，表示资源未修改，重定向已存在的缓冲文件，也称缓存重定向，也就是告诉客户端可以继续使用缓存资源，用于缓存控制。（自从上次请求后，请求的网页未修改过。服务器返回此响应时，不会返回网页内容。）

> **HTTP状态码304是多好还是少好？**

服务器为了提高网站访问速度，对之前访问的部分页面指定缓存机制，当客户端在此对这些页面进行请求，服务器会根据缓存内容判断页面与之前是否相同，若相同便直接返回304，此时客户端调用缓存内容，不必进行二次下载。

状态码304不应该认为是一种错误，而是对客户端**有缓存情况下**服务端的一种响应。

搜索引擎蜘蛛会更加青睐内容源更新频繁的网站。通过特定时间内对网站抓取返回的状态码来调节对该网站的抓取频次。若网站在一定时间内一直处于304的状态，那么蜘蛛可能会降低对网站的抓取次数。相反，若网站变化的频率非常之快，每次抓取都能获取新内容，那么日积月累，的回访率也会提高。

**产生较多304状态码的原因：**

- 页面更新周期长或不更新
- 纯静态页面或强制生成静态html

**304状态码出现过多会造成以下问题：**

- 网站快照停止；
- 收录减少；
- 权重下降。



`4xx` 类状态码表示客户端发送的**报文有误**，服务器无法处理，也就是错误码的含义。

- 「**400 Bad Request**」表示客户端请求的报文有语法错误，当错误发生时，需修改请求的内容后再次发送请求。
- 「**401 Unauthorized**」表示请求需要用户的身份认证
- 「**403 Forbidden**」表示**服务器禁止访问**资源，并不是客户端的请求出错。
- 「**404 Not Found**」表示请求的资源在**服务器上不存在或未找到**，所以无法提供给客户端。



`5xx` 类状态码表示客户端请求报文正确，但是**服务器处理时内部发生了错误**，属于服务器端的错误码。

- 「**500 Internal Server Error**」与 400 类型，是个笼统通用的错误码，服务器发生了什么错误，我们并不知道。
- 「**501 Not Implemented**」表示客户端请求的功能还不支持，类似“即将开业，敬请期待”的意思。
- 「**502 Bad Gateway**」请求需要经过多个服务器来获取所需的资源。其中一个中间服务器（网关）在处理请求时遇到问题，它可能会返回 HTTP 502 错误码。表示中间服务器无法从上游服务器（如应用服务器或代理服务器）获取有效的响应。
- 「**503 Service Unavailable**」表示服务器当前很忙，暂时无法响应客户端，类似“网络服务正忙，请稍后重试”的意思。

#### HTTP常见字段

**Host字段**

客户端发送请求时，用来指定服务器的域名。`Host: www.A.com`

有了 `Host` 字段，就可以将请求发往「同一台」服务器上的不同网站。



**Content-Length字段**

服务器在返回数据时，会有 `Content-Length` 字段，表明本次回应的数据长度。`Content-Length: 1000`

大家应该都知道 HTTP 是基于 TCP 传输协议进行通信的，而使用了 TCP 传输协议，就会存在一个“粘包”的问题，**HTTP 协议通过设置回车符、换行符作为 HTTP header 的边界，通过 Content-Length 字段作为 HTTP body 的边界，这两个方式都是为了解决“粘包”的问题**。



**Connection 字段**

`Connection` 字段最常用于客户端要求服务器使用「 HTTP 长连接」机制，以便其他请求复用。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221021114905858.png" alt="image-20221021114905858" style="zoom:30%;" />

HTTP 长连接的特点是，只要任意一端没有明确提出断开连接，则保持 TCP 连接状态。（一般是TCP三次握手建立客户端与服务端连接，四次挥手断开连接）

TCP/1.1 版本的默认连接都是长连接，但为了兼容老版本的 HTTP，需要指定 `Connection` 首部字段的值为 `Keep-Alive`。

```text
Connection: Keep-Alive
```

开启了 HTTP Keep-Alive 机制后， 连接就不会中断，而是保持连接。当客户端发送另一个请求时，它会使用同一个连接，一直持续到客户端或服务器端提出断开连接。



**Content-Type 字段**

`Content-Type` 字段用于服务器回应时，告诉客户端，本次数据是什么格式。

```text
Content-Type: text/html; charset=utf-8
```

上面的类型表明，发送的是网页，而且编码是UTF-8。

客户端请求的时候，可以使用 `Accept` 字段声明自己可以接受哪些数据格式。

```text
Accept: */*
```

上面代码中，客户端声明自己可以接受任何格式的数据。



**Content-Encoding 字段**

`Content-Encoding` 字段说明数据的压缩方法。表示服务器返回的数据使用了什么压缩格式

```text
Content-Encoding: gzip
```

上面表示服务器返回的数据采用了 gzip 方式压缩，告知客户端需要用此方式解压。

客户端在请求时，用 `Accept-Encoding` 字段说明自己可以接受哪些压缩方法。

```text
Accept-Encoding: gzip, deflate
```

#### HTTP常见请求头

**1.Accept**

+ Accept:text/html 浏览器可以接受服务器返回的类型为 text/html
+ Accept: */* 代表浏览器可以处理所有类型（一般浏览器给服务器都是发这个）

**2.Accept-Encoding**

+ Accept-Encoding：gzip，deflate 浏览器声明自己接受的编码方式，通常指定压缩方法，是否支持压缩，支持什么压缩方法

**3.Accept-Language**

浏览器声明自己接受的语言

**4.Connection**

+ Connection：keep-alive 当一个网页打开完成后，客户端和服务端之间用于传输HTTP报文的TCP连接不会中断，如果客户端再次访问这个服务器的网页，客户端和服务端会继续使用这条已经建立的连接（HTTP/1.1 默认开启）
+ Connection：close 一个request完成后，TCP连接关闭，下次传输需要重新建立TCP连接（三次握手）

**5.Host（发送请求时，该报头域是必须的）**

+ Host：www.baidu.com 请求报头域用于指定请求资源的Internet主机号和端口号，通常从HTTP的URL中提取出来

**6.Referer**

+ **Referer:https://www.baidu.com/?tn=62095104_8_oem_dg** 当浏览器向web服务器发送请求的时候，一般会带上Referer，告诉服务器我是从哪个页面链接过来的，服务器籍此可以获得一些信息用于处理。

**7.User-Agent**

+ User-Agent:Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36 告诉HTTP服务器， 客户端使用的操作系统和浏览器的名称和版本。

**8.Cache-Control**

+ **Cache-Control:private** 默认为private 响应只能够作为私有的缓存，不能再用户间共享
+ **Cache-Control:public**响应会被缓存，并且在多用户间共享。正常情况, 如果要求HTTP认证,响应会自动设置为 private.
+ **Cache-Control:must-revalidate** 响应在特定条件下会被重用，以满足接下来的请求，但是它必须到服务器端去验证它是不是仍然是最新的。
+ **Cache-Control:no-cache** 响应不会被缓存,而是实时向服务器端请求资源。
+ **Cache-Control:max-age=10** 设置缓存最大的有效时间，但是这个参数定义的是时间大小（比如：60）而不是确定的时间点。单位是[秒 seconds]。
+ **Cache-Control:no-store **在任何条件下，响应都不会被缓存，并且不会被写入到客户端的磁盘里，这也是基于安全考虑的某些敏感的响应才会使用这个。

**9.Cookie**

用来存储一些用户信息，让服务器辨别用户身份，比如Cookie会存储一些用户的用户名和密码，用户登录后客户端会产生一个Cookie存储，浏览器再通过读取Cookie信息去服务器验证。

**9.Range（用于断点续传）**

+ **Range:bytes=0-5** 指定第一个字节的位置和最后一个字节的位置。用于告诉服务器自己想取对象的哪部分。

#### HTTP常见响应头

**1.Cache-Control**

对应请求头中的Cache-Control

**2.Content-type**

+ Content-type：text/html; charset=UTF-8 告诉客户端，资源的文件的类型以及编码格式，客户端会按照utf-8对资源进行解码

**3.Content-Encoding**

+ Content-Encoding:gzip 告诉客户端，服务器发送的资源是采用gzip编码的

**4.Date**

发送资源时的服务器时间，一般GMT表示格林尼治所在时间

**5.Server**

告诉客户端服务器相关信息

**6.Transfer-Encoding**

+ Transfer-Encoding：chunked 告诉客户端，服务器的资源分块发送

**7.Expires**

+ **Expires:Sun, 1 Jan 2000 01:00:00 GMT** 告诉客户端，在这个时间前，可以直接访问缓存副本

**8.Last-Modified**

所请求对象最后修改的时间

**9.Connection**

+ Connection：keep-alive 回应客户端的，告诉客户端服务器的TCP连接也是一个长连接，客户端可以继续使用这个TCP连接发送HTTP请求

**10.Etag**

唯一标识响应资源，协商缓存时使用，

**11.Refresh**

+ Refersh: 5;www.baidu.com 用于重定向，当一个新的资源被创建时，默认在5秒后刷新重定向

**12.Access-Control-Allow-Origin**

+ Access-Control-Allow-Origin:* 表示所有网站可以跨域资源共享
+ Access-Control-Allow-Origin:www.xx.com 指定某个网站可以跨域资源共享

**13.Access-Control-Allow-Methods**

+ Access-Control-Allow-Methods：GET，POST、PUT、DELETE 允许这些方法来访问

**14.Access-Control-Allow-Credentials**

+ true 是否允许发送COOKIE。默认情况下COOKIE不包含在CORS请求中

**15.Content-Range**

指定整个实体中的一部分的插入位置，他也指示了整个实体的长度。在服务器向客户返回一个部分响应，它必须描述响应覆盖的范围和整个实体长度。

#### localStorage、sessionStorage、cookie几种web存储方式区分

#### GET 和 POST有什么区别

**GET: 向服务器获取数据；**

**POST：将实体提交到指定的资源，通常会造成服务器资源的修改；**

+ **应用场景：**GET请求是一个幂等的请求，一般 Get 请求用于对服务器资源不会产生影响的场景，比如说请求一个网页的资源。而 Post 不是一个幂等的请求，一般用于对服务器资源会产生影响的情景，比如注册用户这一类的操作。
+ **是否缓存：** 因为两者应用场景不同，浏览器一般会对 Get 请求缓存，但很少对 Post 请求缓存。
+ **发送的报文格式：** Get 请求的报文中实体部分为空，Post 请求的报文中实体部分一般为向服务器发送的数据。
+ **安全性：** Get 请求可以将请求的参数放入 url 中向服务器发送，这样的做法相对于 Post 请求来说是不太安全的，因为请求的 url 会被保留在历史记录中。
+ **请求长度：** 浏览器由于对 url 长度的限制，所以会影响 get 请求发送数据时的长度。这个限制是浏览器规定的，并不是 RFC 规定的。
+ **参数类型：** post 的参数传递支持更多的数据类型。

#### GET 和 POST 方法都是安全和幂等的吗？

+ 在 HTTP 协议里，所谓的**「安全」**是指请求方法不会「破坏」服务器上的资源。
+ 所谓的**「幂等」**，意思是多次执行相同的操作，结果都是「相同」的。

如果从 RFC 规范定义的语义来看：

- **GET 方法就是安全且幂等的**，因为它是「只读」操作，无论操作多少次，服务器上的数据都是安全的，且每次的结果都是相同的。所以，**可以对 GET 请求的数据做缓存，这个缓存可以做到浏览器本身上（彻底避免浏览器发请求），也可以做到代理上（如nginx），而且在浏览器中 GET 请求可以保存为书签**。
- **POST** 因为是「新增或提交数据」的操作，会修改服务器上的资源，所以是**不安全**的，且多次提交数据就会创建多个资源，所以**不是幂等**的。所以，**浏览器一般不会缓存 POST 请求，也不能把 POST 请求保存为书签**。

实际过程中，开发者不一定会按照 RFC 规范定义的语义来实现 GET 和 POST 方法。比如：

- 可以用 GET 方法实现新增或删除数据的请求，这样实现的 GET 方法自然就不是安全和幂等。
- 可以用 POST 方法实现查询数据的请求，这样实现的 POST 方法自然就是安全和幂等。

#### put请求

向服务器发送数据，从而改变信息，类似数据库的update，用来修改数据，但是不会增加数据的种类。而Post请求类似数据库的insert操作，会创建新的内容

