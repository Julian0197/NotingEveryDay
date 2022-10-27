## 1 Ajax概念

### 1.1 Ajax

+ AJAX全称Asynchronous JavaScript And XML **异步的Js和XML**
+ 通过AJAX可以在浏览器中向服务器发送异步请求，最大的优势：**无刷新获取数据**
+ AJAX 不是新的编程语言，而是一种将现有的标准组合在一起使用的新方式

### 1.2 XML

+ 可扩展标记语言
+ 用来传输和存储数据
+ 和HTML类似，不同的是HTML中都是预定义标签，而XML中没有预定义标签
+ XML中全是自定义标签，用来表示一些数据

比如说我有一个学生数据：
name = “孙悟空” ; age = 18 ; gender = “男” ;
用XML 表示：

~~~XML
<student>
	<name>孙悟空</name>
	<age>18</age>
	<gender>男</gender>
</student>
~~~

现在已经被JSON 取代了。

~~~json
{"name":"孙悟空","age":18,"gender":"男"}
~~~

### 1.3 AJAX特点

优点：

+ 无需刷新页面与服务器端进行通信
+ 允许根据用户事件（鼠标事件，键盘事件）更新部分页面内容

缺点：

+  没有浏览历史，不能回退
+ 存在跨域问题
+ SEO不友好

## 2 HTTP相关

### 2.1 HTTP请求交互

1. 前后应用从浏览器端向服务器发送HTTP 请求(请求报文)
2. 后台服务器接收到请求后, 调度服务器应用处理请求, 向浏览器端返回HTTP响应(响应报文)
3. 浏览器端接收到响应, 解析显示响应体/调用监视回调

### 2.2 HTTP请求报文

1. **请求行**
`method url
GET /product_detail?id=2
POST /login`
2. **多个请求头**
`Host: www.baidu.com
Cookie: BAIDUID=AD3B0FA706E; BIDUPSID=AD3B0FA706;
Content-Type: application/x-www-form-urlencoded 或者application/json`
3. **请求体**
`username=tom&pwd=123
{"username": "tom", "pwd": 123}`

### 2.3 HTTP响应报文

1. 响应状态行: `status statusText`
2. 多个响应头
   `Content-Type: text/html;charset=utf-8`
   `Set-Cookie: BD_CK_SAM=1;path=/`
3. 响应体
   `html 文本/json 文本/js/css/图片...`

### 2.4 post 请求体参数格式

1. Content-Type: application/x-www-form-urlencoded;charset=utf-8
   用于键值对参数，参数的键值用=连接, 参数之间用&连接
   例如: name=%E5%B0%8F%E6%98%8E&age=12

2. Content-Type: application/json;charset=utf-8
   用于 json 字符串参数
   例如: {"name": "%E5%B0%8F%E6%98%8E", "age": 12}
3. Content-Type: multipart/form-data
   用于文件上传请求

### 2.5 常见的响应状态码

200 OK 请求成功。一般用于GET 与POST 请求
201 Created 已创建。成功请求并创建了新的资源
401 Unauthorized 未授权/请求要求用户的身份认证
404 Not Found 服务器无法根据客户端的请求找到资源
500 Internal Server Error 服务器内部错误，无法完成请求

### 2.6 不同类型的请求及其作用

GET: 从服务器端读取数据（查）
POST: 向服务器端添加新数据 （增）
PUT: 更新服务器端已经数据 （改）
DELETE: 删除服务器端数据 （删）

### 2.7 API 的分类

REST API: restful （Representational State Transfer (资源)表现层状态转化）
(1) 发送请求进行CRUD 哪个操作由请求方式来决定
(2) 同一个请求路径可以进行多个操作
(3) 请求方式会用到GET/POST/PUT/DELETE
非REST API: restless
(1) 请求方式不决定请求的CRUD 操作
(2) 一个请求路径只对应一个操作
(3) 一般只有GET/POST

### 2.8 区别 一般http请求 与 ajax请求

ajax请求 是一种特别的 http请求
对服务器端来说, 没有任何区别, 区别在浏览器端
浏览器端发请求: 只有XHR 或fetch 发出的才是ajax 请求, 其它所有的都是非ajax 请求
浏览器端接收到响应
(1) 一般请求: 浏览器一般会直接显示响应体数据, 也就是我们常说的刷新/跳转页面
(2) ajax请求: 浏览器不会对界面进行任何更新操作, 只是调用监视的回调函数并传入响应相关数据

## 3. 跨域

### 3.1 同源策略

+ 同源策略是一种浏览器安全策略
+ 浏览器默认两个相同的源之间可以相互访问资源和操作DOM元素
+ 同源指的是：协议、域名、端口号必须都一致
+ 跨域：违反同源策略（同源策略是浏览器的行为，当客户端向服务端发送请求，服务端返回数据给浏览器后，浏览器发现不同源，不会将数据给客户端）

### 3.2 JSONP解决跨域

+ JSONP是一种非官方的跨域解决方案，只支持get请求
+ 利用网页中一些标签自带的跨域能力（img，link，script）
  + JSONP利用的是Script标签的跨域能力发送请求

**实现原理：**

因为浏览器的同源策略，不能通过XMLHttpRequest请求不同域上的数据。

但是在页面上引入不同域的js脚本文件是可行的。

因此在js文件载入后，触发回调函数，将需要的data作为参数传入

### 3.3 CORS跨域资源共享

**什么是CORS？**

浏览器提供了CORS跨域资源共享机制，使用该机制可以进行跨域访问控制。

浏览器会自动进行CORS通信，实现CORS通信的关键在于后端

**CORS如何工作**
通过设置响应头告诉浏览器，该请求允许跨域，浏览器收到该响应后就会对响应放行。

+ 浏览器先根据同源策略对前端页面和后台交互地址做匹配，若同源，则直接发送数据请求；若不同源，则发送跨域请求。

+ 服务器收到浏览器跨域请求后，如果该请求允许跨域。返回Access-Control-Allow-origin + 对应配置规则里的域名的方式。

+ 浏览器根据接受到的 响应头里的Access-Control-Allow-origin字段做匹配，若有该字段，则对字段内容和当前域名做比对，如果同源，则说明可以跨域。

**优点与缺点**

**优点**

- CORS 通信与同源的 AJAX 通信没有差别，代码完全一样，容易维护。
- 支持所有类型的 HTTP 请求。

**缺点**

- 存在兼容性问题，特别是 IE10 以下的浏览器。
- 第一次发送非简单请求时会多一次请求。
