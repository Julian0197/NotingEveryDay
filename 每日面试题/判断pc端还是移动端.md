#### 使用`navigator.userAgent`

~~~js
isMobile() {
    let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
    return flag;
   }
~~~

+ 利用浏览器对象的Navigator，Navigator对象包含有关浏览器的信息。
+ userAgent属性是一个只读的字符串，声明了**浏览器用于HTTP请求的用户代理头的值**。
+ 再利用正则表达式，match方法判断。

#### 媒体查询`window.matchMedia`

~~~js
var isMobile = window.matchMedia("(max-width: 480px)").matches // true | false
~~~

接受参数media，查询的语句内容。查询条件添加视口宽度，就能判断到底是不是移动端设备。返回结果为Boolean。
