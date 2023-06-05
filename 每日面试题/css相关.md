### .html 文档标签元素，以及常见的meta标签

+ `!DOCTYPE`：定义文档类型，告诉浏览器页面使用了哪个HTML版本
+ `head`：头部元素的容器（绝大多数头部标签内容不会展示给读者）
  + `meta`：和页面有关的元信息，会影响网页能否被搜索引擎检索到，和在搜索引擎中的排名
  + `base`：定义页面上所有的默认地址（相对地址url）
  + `title`：文档标题
  + `link`：文档与外部资源的关系，常用于引入外部样式
  + `style`：样式信息
+ `body`：定义文档的主体
  + `script`：脚本在非必需情况时在<body>的最后

#### meta

+ meta有两个属性`http-equiv`和`name`表示要设置的项
+ `content`属性表示设置项的值

1. http-equiv一般设置的都是与http请求头相关的信息，设置的值会关联到http头部。也就是说浏览器在请求服务器获取html的时候，服务器会将html中设置的meta放在响应头中返回给浏览器。常见的类型比如content-type, expires, refresh, set-cookie, window-target, charset， pragma等等。

+ content-type：`<meta http-equiv="content-type" content="text/html charset=utf8">`声明文档类型，设置字符集
+ expires：设置浏览器过期时间，`<meta http-equiv="expires" content="31 Dec 2021">`
+ refresh：设置自动刷新，不设置url的值那么浏览器则刷新本网页。`<meta http-equiv="refresh" content="5 url=http://www.zhiqianduan.com">`
+ window-target：强制页面在当前窗口以独立页面展示，防止别人在框架中调用自己页面。`<meta http-equiv="window-target" content="_top'>`
+ pragma：`<meta http-equiv="pragma" content="no-cache">`，禁止浏览器从本地计算机缓存读取内容

2. name属性：描述网页，利于SEO优化

+ author：标注网页作者
+ description：告诉搜素引擎当前网页的主要内容，是关于网站的一段描述信息。
+  keywords：设置网页关键字
+  robots：告诉搜索引擎机器人，应该抓取哪些内容：`all / none / index / noindex / follow / nofollow`
   +  all:文档可被检索，页面链接可访问
   +  index：文档可被检索
   +  follow：页面链接可访问


### 语义化

HTML5之前，习惯用div表示章节内容，但是div本身没有语义。H5之后多了很多语义化标签，能更清晰地表达文档结构。

<img src="https://uploadfiles.nowcoder.com/images/20220301/4107856_1646121492395/44B73F2E744FF268279D16601DB2CBC8">

语义化标签分区方式：
+ `<header>`：展示介绍性信息，如标题，搜索框，作者名称。不能放在`<footer>``<address>`或者另一个header内
+ `<nav>`：提供导航链接，如菜单、目录、索引
+ `<artical>`：独立文档
+ `<section>`：按主题将文档分组
+ `<footer>`：页脚
+ `<aside>`：与页面无关部分，通常在侧边栏，广告、tips等

语义化优点：
+ 易于用户阅读，样式丢失，能让页面呈现更清晰结构
+ 利于SEO，搜索引擎根据标签来确定上下文和各个关键字的权重
+ 可读性高，利于开发和维护

### px、rem、em

### 响应式布局

### css盒模型

### css优先级，叠加如何更高

### 伪类和伪元素是什么

伪类：已有元素当处于某种状态时，添加对应的样式。这个状态根据用户的行为动态变化。

比如：`:hover`，`:focus`,`:first-child`,

伪元素：将特殊效果添加到不存在的虚拟元素中（浏览器自动创建）

比如：
~~~css
div::first-letter {
  color: red;
}
~~~

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b5fb2a5b2894876bd3abaf3e6090fda~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp">

::first-letter 伪元素只作用于块状元素上面，与伪类不同的是，首字并不是 div 元素的某种状态，而是浏览器创建出来的一个虚拟的元素，我们可以在上图的右下角看到 Pseudo ::first-letter element提示

### 三种定位模式
+ 普通流：默认布局方式
+ 浮动：仍然在文档流中，但是不占据任何位置，可以实现文档的自由排列，但是可能导致父元素的高度塌陷，需要通过清除浮动解决
+ 绝对定位：将元素从文档流中完全移除，放在页面上的指定位置。通过position控制，定位相对于其最近的已定位的祖先元素，如果没有已定位的祖先元素，则相对于文档的初始坐标系。

### position三种定位属性

+ absolute绝对定位：同上
+ relative相对定位：不会脱离文档流，相对于自身在文档流的位置进行定位
+ fixed固定定位：元素相较于浏览器窗口进行定位，不随页面滚动而改变位置
+ sticky粘性定位：元素根据正常文档流进行定位，然后相对于他的最近的滚动祖先

### display有哪些属性

### 块元素、行内元素、行内快元素

块级元素：block，独占一行，不设置宽度默认父级宽度100%

行内元素：inline，不可设置宽高，内外边距在上下方向无效，行高有效，元素宽度为他包含的图片或文字高度。

行内块元素：inline-block，宽高内外边距都可以设置，默认宽度为本身宽度，不独占一行，但是有间隙设置上一级的font-size=0可以消除

### css框架，css规则

### css3实现动画效果

### flex布局常用属性

### html5表单标题置顶（title吸顶功能）