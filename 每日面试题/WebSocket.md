### websocket

#### 使用场景
考虑下面场景：扫二维码登录

用户扫描二维码，浏览器不会向后端发送请求，解决方法：

1. 网页前端代码使用定时器定期向后端发送HTTP请求，服务器收到请求后如果用户完成扫码再发送登录数据（缺点：消耗带宽，定时器的等待时间会造成用户层的卡顿）
2. 长轮询：将HTTP请求的超时时间设置很大，比如30s，在30s内只要服务器收到了扫码请求，就立马返回给客户端，如果超时就再发起请求。
3. websocket
4. 
#### 全双工协议
全双工：同一时间，客户端和服务端双方都可以主动向对方发送数据。

半双工：同一时间，客户端和服务端双方只能有一方能主动向对方发送数据

TCP传输协议是支持全双工的，但是HTTP用成了半双工协议。

#### 建立连接
HTTP协议和websocket协议都是工作在应用层的，为了统一规范。在TCP三次握手建立连接之后，都会先试用HTTP协议进行一次通信。

建立websocket协议，会在HTTP请求头上加一些特殊的header。表示浏览器想升级协议，并且升级成websocket协议。同时带上随机生成的base64码（Sec-WebSocket-Key）
~~~shell
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: T2a6wZlAwhgQNqruZ2YUyg==
~~~

如果服务器正好支持websocket协议，就会走websocket握手流程，同时根据发送的base64码，用某个公开算法生成字符串，并放在HTTP响应的 Sec-WebSocket-Accept 头里，同时带上101状态码（表示协议切换）。

~~~shell
HTTP/1.1 101 Switching Protocols
Sec-WebSocket-Accept: iBJKv/ALIW2DobfoA4dmr3JHBCY=
Upgrade: websocket
Connection: Upgrade
~~~

之后，浏览器用同样算法将base64转化为字符串，如果和传过来的字符串一致，那验证通过。就这样经历了一来一回两次HTTP握手，websocket就建立完成了，后续双方就可以使用webscoket的数据格式进行通信了。