### .html 文档标签元素，以及常见的meta标签

+ `!DOCTYPE`：定义文档类型，告诉浏览器页面使用了哪个HTML版本
+ `head`：头部元素的容器（绝大多数头部标签内容不会展示给读者，不在布局树）
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

1. name属性：描述网页，利于SEO优化。`<meta name="xxx" content="xxx">``

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

### px、rem、em，vw

#### px
px是固定单位，电脑分辨率如果为1920*1080，css设置的1px就是屏幕宽度的1/1920
#### em
在font-size中相对于父元素的字体大小，在其他属性中使用是相对于自身大小（如：width）

#### rem：根元素(html 节点)字体大小的倍数
1. 开发者拿到设计稿，假设设计稿尺寸为750px，设计稿元素基于此宽度标注
2. 需要等比缩放的元素，css使用转化后的单位
3. 不需要缩放的元素，直接用px
   
假设设计稿的标注是40px，对于手机端字体大小应该为420/750*40 = 22.4px，换算后为0.224rem

#### vw vh
浏览器可见视口（宽度/高度）的百分比。1vw相当于可见视口宽度的1%】

%是基于父元素的宽高而言的，% 在没有设置 body 高度情况下，是无法正确获得可视区域的高度。而vw、vh是相对于视口宽高的百分比。

### 响应式布局

目的：同一个页面兼容移动端和pc端。

+ 媒体查询 `@media (min-width: 1367px) and (max-width: 1440px) {}`
+ 用em、rem代替px
+ flex弹性布局
+ grid栅格布局

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
+ 固定定位：与绝对定位类似，但是元素相对于浏览器窗口进行定位，而不是相对于其定位参考元素。

### position三种定位属性

+ absolute绝对定位：同上
+ relative相对定位：不会脱离文档流，相对于自身在文档流的位置进行定位
+ fixed固定定位：元素相较于浏览器窗口进行定位，不随页面滚动而改变位置
+ sticky粘性定位：元素根据正常文档流进行定位，然后相对于他的最近的滚动祖先

### display有哪些属性

display用于展示HTML元素的显示行为。
+ block：转化为块级元素，另起一行，并默认为父亲元素宽度
+ inline：内联元素，元素会与其他内联元素在同一行上，不可设置宽高，内外边距在上下方向无效，并根据内容自动调整宽度。
+ inline-block：行内快元素，元素与其他内联元素，行内快元素在同一行。并且可以设置宽高，内边距等
+ none：将元素隐藏，视觉效果，并没有真正从文档中移除
+ flex：将元素显示为弹性盒子
+ grid：将元素显示未王网格容器
+ table：将元素显示为表格元素
+ table-cell：将元素显示为表格单元格，只能用于表格相关的元素，如<td>或<th>。
+ table-row：将元素显示为表格行，只能用于表格相关的元素，如<tr>

### 块元素、行内元素、行内快元素

块级元素：block，独占一行，不设置宽度默认父级宽度100%

行内元素：inline，不可设置宽高，内外边距在上下方向无效，行高有效，元素宽度为他包含的图片或文字高度。

行内块元素：inline-block，宽高内外边距都可以设置，默认宽度为本身宽度，不独占一行，但是有间隙设置上一级的font-size=0可以消除

### css3实现动画效果

### flex布局常用属性

+ display: flex;：将容器设置为Flex容器

+ flex-direction: row | row-reverse | column | column-reverse;：指定Flex项的排列方向。默认值为row，表示水平方向从左到右排列，column表示垂直方向从上到下排列。

+ flex-wrap: nowrap | wrap | wrap-reverse;：指定Flex项的换行方式。默认值为nowrap，表示不换行，wrap表示自动换行，wrap-reverse表示自动换行且逆序排列。

+ justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;：定义Flex项在主轴上的对齐方式。可以使Flex项居左、居右、居中，或者在主轴上均匀分布。

+ align-items: stretch | flex-start | flex-end | center | baseline;：定义Flex项在交叉轴上的对齐方式。可以使Flex项在交叉轴上拉伸、居顶部、居底部、居中或与基线对齐。

+ align-content: stretch | flex-start | flex-end | center | space-between | space-around;：定义多行Flex项在交叉轴上的对齐方式。可以使多行Flex项在交叉轴上拉伸、居顶部、居底部、居中，或在行之间均匀分布。

+ flex-grow: <number>;：定义Flex项的放大比例，默认值为0。如果容器有剩余空间，Flex项根据放大比例进行分配。

+ flex-shrink: <number>;：定义Flex项的缩小比例，默认值为1。如果容器空间不足，Flex项根据缩小比例进行收缩。

+ flex-basis: <length> | auto;：定义Flex项在主轴上的初始大小。可以设置为固定长度，也可以使用auto根据内容自动调整大小。

### 为什么css的样式最好写成class不要写行内样式

1. 样式可以重复使用
2. 浏览器在解析HTML文档时，会将CSS文件进行缓存。如果使用行内样式，每次加载新的页面都需要重新解析和加载CSS样式，而将样式写在class中，只需要加载一次CSS文件，可以在多个页面上复用。
3. 浏览器在渲染页面时，会先构建DOM树和CSSOM树，然后将它们合并为渲染树。将样式写在class中可以提前加载CSS文件，并在构建CSSOM树时进行解析，提高渲染速度。而行内样式需要等待DOM树构建完毕才能解析，会延迟页面的渲染。

### 如何打破chrome最小字号限制

最低为12像素，如果我想要6px。

使用css的缩放属性：`transform: scale()`

1. 对于块级元素内部字体：

~~~css
.block {
  font-size: 12px;
  transform: scale(0.5);
}
~~~

2. 对于行内元素，span

+ transform属性只针对块级盒子和行内块有效，需要转化为inline-block
+ 中心缩放，还要调整缩放位置，调整中心原点为最左边
+ 高度没变化，需要手动改变

~~~css
.span {
  font-size: 12px;
  transform: scale(0.5);
  tansform-origin: left center;
~~~