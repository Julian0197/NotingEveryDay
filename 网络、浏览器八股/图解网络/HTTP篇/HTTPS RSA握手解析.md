## HTTPS RSA握手解析

### RSA握手过程

不同算法的TLS握手过程会有不同，传统TLS握手采用RSA算法。TLS证书部署服务器时，证书文件就是服务器的公钥，会在TLS握手阶段将公钥发送给客户端，私钥一直保存在服务器，需要确保私钥不被泄露。

#### TLS第一次握手

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/clienthello.png)

客户端会先发送`Client Hello`消息，包括：

+ 客户端使用的TLS协议版本号
+ 客户端生成的第一个随机数`Client Random`，这个随机数会被服务端保存，用来生成会话秘钥
+ 支持的密码套件列表

#### TLS第二次握手

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/serverhello.png)

服务端收到 `Client Hello `后，先确认TLS版本号是否支持，不支持的话终止加密通信，支持的话再返回`Server Hello`消息，包括：

+ 确认支持的TLS版本号
+ 服务器生成的随机数`Server Random`，这个随机数也用于后续生成回话秘钥
+ 选择的密码套件

此时客户端和服务端已经完成两次握手，接下来服务端还需要证明自己的身份，将发送`Server Certificate`给客户端，里面包含数字证书。

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/certificate.png)

随后，服务端发了「**Server Hello Done**」消息，目的是告诉客户端，我已经把该给你的东西都给你了，本次打招呼完毕。

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/serverhellodone.png)

#### 客户端验证证书

##### 数字证书签发和验证流程

这里解释一下，客户端拿到服务端的数字证书后，如何检验数字证书是有效的？

首先，一个数字证书包含了：

+ 服务器公钥
+ 持有者信息
+ CA（Certificate Authority） 信息
+ CA 对这份签名使用的算法
+ 证书有效期
+ 其他信息

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/%E8%AF%81%E4%B9%A6%E7%9A%84%E6%A0%A1%E9%AA%8C.png)

+ 首先 CA 会把持有者的公钥、用途、颁发者、有效时间等信息打成一个包，再对数字证书用Hash算法计算出Hash值A，哈希值再用CA私钥加密，获得数字签名，数字签名和明文形成一个数字证书，发送给客户端。
+ 客户端先对明文用Hash算法加密，生成Hash值B，再将数字签名用CA公钥解密，比对这两个哈希值，如果一致说明是可信赖的证书

##### 证书链

证书的验证过程中还存在一个证书信任链的问题，因为我们向 CA 申请的证书一般不是根证书签发的，而是由中间证书签发的，比如百度的证书，从下图你可以看到，证书的层级有三级：

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/baidu%E8%AF%81%E4%B9%A6.png)

<img src="https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/%E7%94%A8%E6%88%B7%E4%BF%A1%E4%BB%BB.png" alt="img" style="zoom:53%;" />

在这四个步骤中，**最开始客户端只信任根证书 GlobalSign Root CA 证书**的，然后 “GlobalSign Root CA” 证书信任 “GlobalSign Organization Validation CA - SHA256 - G2” 证书，而 “GlobalSign Organization Validation CA - SHA256 - G2” 证书又信任 baidu.com 证书，于是客户端也信任 baidu.com 证书。

操作系统中也会内置一些证书

最后一个问题，**为什么需要证书链这么麻烦的流程？Root CA 为什么不直接颁发证书，而是要搞那么多中间层级呢？**

这是为了确保根证书的绝对安全性，将根证书隔离地越严格越好，不然根证书如果失守了，那么整个信任链都会有问题。

#### TLS第三次握手

![](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/clietnkeyexchange.png)

客户端验证完证书符合要求后，发送`Client Key Exchange `，包括：

+ 客户端生成的第二个随机数 `pre-master`,用服务器的RSA公钥加密随机数，服务器收到会对他用私钥解密，至此双方得到三个随机数，用他们来生成会话秘钥

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/cipherspecmessage.png)

生成完会话秘钥，客户端发送一个 `Change Cipher Spec`，告诉服务端开始使用对称加密方式发送消息。

然后，客户端再发一个`Encrypted Handshake Message（Finishd）`消息，把之前所有发送的数据做个**摘要**，再用会话密钥（master secret）加密一下，让服务器做个验证，验证加密通信「是否可用」和「之前握手信息是否有被中途篡改过」。

![img](https://cdn.xiaolincoding.com/gh/xiaolincoder/ImageHost4@main/%E7%BD%91%E7%BB%9C/https/encryptd.png)

可以发现，「Change Cipher Spec」之前传输的 TLS 握手数据都是明文，之后都是对称密钥加密的密文。

#### TLS 第四次握手

服务器也是同样的操作，发「**Change Cipher Spec**」和「**Encrypted Handshake Message**」消息，如果双方都验证加密和解密没问题，那么握手正式完成。

最后，就用「会话密钥」加解密 HTTP 请求和响应了。

### RSA算法缺陷

**使用 RSA 密钥协商算法的最大问题是不支持前向保密**。

因为客户端传递随机数（用于生成对称加密密钥的条件之一）给服务端时使用的是公钥加密的，服务端收到后，会用私钥解密得到随机数。所以一旦**服务端的私钥泄漏**了，过去被第三方截获的所有 TLS 通讯密文都会被破解。

为了解决这个问题，后面就出现了 ECDHE 密钥协商算法，我们现在大多数网站使用的正是 ECDHE 密钥协商算法