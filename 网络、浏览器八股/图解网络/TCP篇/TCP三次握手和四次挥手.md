# TCP三次握手与四次挥手

## TCP基本认识

### TCP头格式有哪些？

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzYuanBn?x-oss-process=image/format,png" alt="TCP 头格式" style="zoom:50%;" />

标注颜色的格式与三次握手有关系

**序列号：**建立连接时计算机生成随机数作为初始值，通过SYN包发送给接受端主机，没法送一次数据，累加一次数据的字节数大小，**用于解决网络包乱序问题**。

**确认应答号：**指下一次期望收到的数据的序列号，发送端收到确认应答号，可以认为在这个序号以前的数据都已经被正常接受。用来**解决丢包问题**。

**控制位：**

+ `ACK:`为1，确认应答的字段变为有效，TCP 规定除了最初建立连接时的 `SYN` 包之外该位必须设置为 1
+ `RST`：为1，表示TCP连接出现异常必须强制断开连接
+ `SYN:`为1，表示希望建立连接，并在其序列号的字段进行序列号初始化设定
+ `FIN`为1，表示今后不会再有数据发送，希望断开连接。当通信结束希望断开连接时，通信双方的主机之间就可以相互交换`FIN`为1的TCP段

### 为什么需要TCP，TCP工作在哪一层？

TCP/IP 模型分为：应用层、传输层、网络层、网络接口层

IP（网络）层是不可靠的，无法保证网络包的交付，无法保证网络包的按序交付，也无法保证网络包中数据的完整性

TCP是一个工作在**传输层**的**可靠**的数据传输服务，能保证接受端接受的网络包是**无损坏、无间隔、非冗余和安序的**。

### 什么是TCP？

TCP是**面向连接的、可靠的、基于字节流的**传输层通信协议

+ 面向连接：一对一才是面向连接，不能像UDP协议可以一个主机同时向多个主机发送消息
+ 可靠的：无论网络链路中发生了什么变化，TCP都可以保证一个报文一定能到达接收端
+ 字节流：用户消息通过TCP传输时，可能会被操作系统分组成为多个TCP报文，接收方程序如果不知道消息的边界，是无法读出一个有效的用户信息的。TCP报文段是有序的，前一个TCP报文没有收到的时候，即使它先收到了后面的TCP报文，也不能交给应用层处理，重复的TCP报文也会被自动放弃

### 什么是TCP连接？

**用于保证可靠性和流量控制的某些状态信息，这些信息的组合，包括：Sockets、序列号和窗口大小统称为连接**

+ Socket：IP地址和端口号组成
+ 序列号：解决乱序问题
+ 窗口大小：流量控制

### 如何唯一确定一个TCP连接？

**TCP四元祖唯一确定一个连接：源地址、源端口号、目的地址、目的端口号**

源地址和目的地址的字段（32位）在IP头部，作用是通过IP协议发送报文给对方主机

源端口号和目的端口号的字段是在TCP头部中，作用是告诉TCP协议应该发送给哪个进程

### TCP和UDP的区别及应用场景

UDP不提供复杂的控制机制，利用IP提供面向无连接的服务通信

UDP协议简单，头部只有8个字节（64位）

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzEyLmpwZw?x-oss-process=image/format,png" alt="UDP 头部格式" style="zoom:50%;" />

- 目标和源端口：主要是告诉 UDP 协议应该把报文发给哪个进程。
- 包长度：该字段保存了 UDP 首部的长度跟数据的长度之和。
- 校验和：校验和是为了提供可靠的 UDP 首部和数据而设计，防止收到在网络传输中受损的 UDP包。

**TCP和UDP区别：**

1. 连接
   + TCP是面向连接的传输层协议，传输数据前要先建立连接
   + UDP不需要连接，即刻传输数据
2. 服务对象
   + TCP是一对一的两点服务，一条连接只有两个端点
   + UDP支持一对一、一对多、多对多的交互通信
3. 可靠性
   + TCP是可靠交付数据的，数据可以无差错，不丢失，不重复，按序到达
   + UDP不保证可靠交付数据。但是我们可以基于UDP传输协议实现一个可靠的传输协议，比如QUIC协议。
4. 拥塞控制、流量控制
   + TCP拥有拥塞控制和流量控制机制，保证数据传输的安全性
   + UDP则没有，即使网络非常拥堵，也不会影响UDP的发送效率
5. 首部开销
   + TCP首部长度较长，有一定开销
   + UDP首部只有8个字节，固定不变
6. 传输方式
   + TCP是流式传输，没有边界，但保证顺序和可靠
   + UDP是一个包一个包的发送，有边界，但可能会丢包和乱序
7. 分片不同
   + TCP数据大小如何大于MSS大小，会在传输层分片，目标主机收到后，也同样在传输层组装TCP数据包，如果中途丢失一个分片，只需要传输丢失的这个分片
   + UDP数据大小如果大于MTU大小，则会在IP层进行分片，目标主机收到后，在IP层组装完数据，接着传给传输层

**TCP和UDP应用场景：**

由于TCP是面向连接，能保证数据的可靠性交付，因此经常用于：

+ FTP文件传输
+ HTTP/HTTPS

由于UDP面向无连接，可以随时发送数据，再加上UDP本身的处理既简单又高效，因此经常用于：

+ 包总量较少的通信，比如：DNS、SMTP
+ 视频、音频等多媒体通信
+ 广播通信

> 为什么 UDP 头部没有「首部长度」字段，而 TCP 头部有「首部长度」字段呢？

原因是 TCP 有**可变长**的「选项」字段，而 UDP 头部长度则是**不会变化**的，无需多一个字段去记录 UDP 的首部长度。

> 为什么 UDP 头部有「包长度」字段，而 TCP 头部则没有「包长度」字段呢？

先说说 TCP 是如何计算负载数据长度：

**TCP数据长度 = IP总长度 - IP首部长度 - TCP首部长度**

### TCP和UDP可以使用同一个端口么？

**可以**

数据链路层，通过MAC地址来寻找局域网中的主机。网络层中，通过IP地址来寻找网络中互联的主机或路由器。传输层中，需要通过端口号寻址，来识别统一计算机中同时通信的不同应用程序。

所以，**传输层的[端口号]的作用，是为了区分同一个主机上不同应用程序的数据包**

传输层上有两个协议 TCP和UDP，在内核中数两个完全独立的软件模块

当主机收到数据包，可以在IP包头的[协议号]知道数据是TCP/UDP，所以可以根据这个信息确定送给哪个模块（TCP/UDP）处理，送给 TCP/UDP 模块的报文根据「端口号」确定送给哪个应用程序处理。

因此，TCP/UDP各自的端口号也相互独立，如 TCP 有一个 80 号端口，UDP 也可以有一个 80 号端口，二者并不冲突。

## TCP连接建立

### TCP三次握手过程是怎样的？

TCP是面向连接的协议，使用TCP前必须先建立连接，通过**TCP三次握手**

<img src="https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4/%E7%BD%91%E7%BB%9C/TCP%E4%B8%89%E6%AC%A1%E6%8F%A1%E6%89%8B.drawio.png" alt="TCP 三次握手" style="zoom: 50%;" />

+ 一开始，客户端和服务端都处于`CLOSE`状态。服务端先主动监听某个端口，处于`LISTEN`状态。

  <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzE1LmpwZw?x-oss-process=image/format,png" alt="第一个报文—— SYN 报文" style="zoom: 50%;" />

+ 客户端随机初始化序号（`client_isn`），将此序号置于TCP首部的[序列号]字段中，同时把`SYN`标志位置为1，SYN报文表示希望建立连接。接着把第一个SYN报文发送给客户端，表示向服务端发起连接，该报文不包含应用层数据，之后客户端处于`SYN-SENT`状态。

  <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzE2LmpwZw?x-oss-process=image/format,png" alt="第二个报文 —— SYN + ACK 报文" style="zoom:50%;" />

+ 服务端收到客户端的`SYN`报文后，首先服务端也随机初始化自己的序号（`server_isn`），将此序号填入TCP首部的[序列号]字段中，其次把TCP首部的[确认应答号]填入刚刚收到的`client_isn + 1`，接着把`SYN`和`ACK`标志位置为1，ACK表示确认应答号字段有效。最后把该报文发送给客户端，该报文也不包含应用层数据，之后服务端处于`SYN-RCVD`状态。

  <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzE3LmpwZw?x-oss-process=image/format,png" alt="第三个报文 —— ACK 报文" style="zoom:50%;" />

+ 客户端收到服务端报文后，还要向服务端回应最后一个应答报文，首先该应答报文TCP首部的`ACK`标识为1（TCP规定除了除了最初建立连接的SYN包其他都必须包的ACK必须都为1，标识确认应答号字段有效），其次[确认应答号]字段填入`server_isn + 1`，最后把报文发送给服务端，这次的报文可以携带客户到服务端的数据，之后客户端处于`ESTABLISHED`状态。

+ 服务端收到客户端的应答报文后，也进入`ESTABLISHED`状态。

注意：**前两次握手不可以携带应用层数据，第三次握手可以。一旦完成三次握手，双方都处于`ESTABLISHED`状态，此时连接就已建立完成，客户端和服务端就可以互相发送数据了。**

### 为什么是三次握手？而不是两次、四次？

我们在前面知道了什么是**TCP连接**：

+ 用于保证可靠性和流量控制维护的某些状态信息，这些信息的组合，包括**Socket、序列号和窗口大小**称为连接。

接下来，要从三方面分析三次握手的原因：

+ 三次握手才可以阻止重复历史连接的初始化（主要原因）
+ 三次握手才可以同步双方的初试序列号
+ 三次握手才可以避免资源浪费

**原因1：避免历史连接**

简单来说，三次握手的**首要原因是为了防止旧的重复连接初始化造成混乱。**

考虑以下场景：客户端先发送SYN（seq=90）报文，然后客户端宕机了，而这个SYN报文又被网络阻塞了，服务端没有收到，接着客户端重启后，又重新向服务端建立连接，发送了SYN（seq=100）报文**（注意，这不是重传SYN，重传的SYN序列号一样）**。

TCP三次握手会阻止历史连接。

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzE5LmpwZw?x-oss-process=image/format,png" alt="三次握手避免历史连接" style="zoom: 50%;" />

客户端连续发送多次SYN（都是同一个四元祖：源地址、源端口号、目的地址、目的端口号）建立连接的报文，在**网络拥堵**情况下：

+ 一个旧SYN报文比新SYN报文早到了服务端，此时服务端会返回一个`SYN + ACK`报文，次报文中的确认应答号是91（90+1）。
+ 客户端收到后，发现自己期望收到的确认应答号是100+1，而不是90+1，于是会回`RST`报文（RST表示TCP连接出现异常必须断开连接）
+ 服务端收到RST报文后，就会释放连接。
+ 后续最新的SYN抵达了服务端后，客户端与服务端就可以正常的完成三次握手

上述中的旧SYN报文称为历史连接，TCP使用三次握手建立连接的最主要原因就是为了**防止历史连接初始化了连接**。

> 如果服务端在收到RST报文之前，先收到了新SYN报文，也就是服务端收到客户端的顺序是：旧SYN报文 => 新SYN报文 => RST报文，会发生什么？
>
> 服务端第一次收到旧SYN报文，会回复`SYN + ACK`报文给客户端，确认应答号是90+1
>
> 紧接着收到新SYN报文，会回复`challenge ack`，**这个ack报文并不是确认收到新SYN报文的，而是上一次的ack确认号，90+1**。所以客户端收到此ACK报文时，发现自己期望收到的确认号应该是101，而不是91，会回复RST报文。

**如果是两次握手连接，就无法阻止历史连接：**

**在两次握手的情况下，服务端没有中间状态给客户端来阻止历史连接，导致服务端可能建立一个历史连接，造成资源浪费**
