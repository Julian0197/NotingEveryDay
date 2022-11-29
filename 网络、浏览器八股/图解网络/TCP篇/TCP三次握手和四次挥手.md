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

TCP四元祖唯一确定一个连接：源地址、源端口号、目的地之、目的端口号

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
