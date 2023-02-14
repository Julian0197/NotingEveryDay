# CSS面试题

## 1 基础知识类

### 1.1 CSS的层叠性

当多个样式规则冲突，会出现层叠新，CSS会根据：`1.来源`，`2.优先级`，`3.源码顺序`决定起作用的样式规则。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf63419276514b27840434afaea6ef7b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp" alt="在这里插入图片描述" style="zoom:80%;" />

1. 来源的重要性由低到高
   1. 用户代理（浏览器默认样式）
   2. 作者（你写的CSS）
   3. `!important`例外规则覆盖其他声明
2. 内联样式声明 `<p style="color: red;">hello</p>`
3. 判断选择器优先级
4. 源码顺序

**建议：不要使用id选择器（权重太大 100） 和 !important（破坏固有级联规则）**

### 1.2 继承性

如果一个元素的继承属性没有执行值，会默认继承某个祖先元素的值。

#### 1.2.1 哪些属性可以继承

(1) 字体系列属性：font, font-family, font-weight, font-size, font-style, font-variant, font-stretch, font-size-adjust

(2) 文本系列属性：text-indent, text-align, text-shadow, line-height, word-spacing, letter-spacing, text-transform, direction, color

(3) 表格布局属性：caption-side, border-collapse, empty-cells

(4) 列表属性

(5) 光标属性

(6) 元素可见性 visibility

#### 1.2.2 line-height 行高的继承

三种继承情况：

1. 具体数值，直接继承 `line-height: 50px`

2. 比例继承 p元素行高为 2 * 10 = 20px

   ~~~css
   body {
       font-size: 20px;
       line-height: 2; /* 比例 */
   }
   p {
       font-size: 10px;
   }
   ~~~

3. 百分比**先计算再继承算出来的值 ** p元素行高为 200% * 20 = 40px  20是父元素的font-size

   ~~~css
   body {
       font-size: 20px;
       line-height: 200%; /* 百分比 */
   }
   p {
       font-size: 10px;
   }
   ~~~

#### 1.2.3 不可继承的样式属性

**border, padding, margin, width, height**

不是默认继承属性，可以通过`inherit`关键字继承。

### 1.3 选择器相关

#### 1.3.1 常用选择器及优先级

| 选择器                          | 权重    |
| ------------------------------- | ------- |
| 继承 或 *                       | 0,0,0,0 |
| 标签选择器 `div {}`             | 0,0,0,1 |
| 类选择器、伪类选择器 `.类名 {}` | 0,0,1,0 |
| ID选择器 `#ID {}`               | 0,1,0,0 |
| 行内样式 `style=""`             | 1,0,0,0 |
| `!important`                    | 无限大  |

#### 1.3.2 伪类选择器 与 伪元素选择器

伪类选择器：表示元素的特殊状态，`hover`,`link`等

~~~css
button: hover {
    color: blue;
}
~~~

伪元素选择器：匹配特殊的位置，`before`,`after`等

~~~css
/* 每一个 <p> 元素的第一行。 */
p::first-line {
  color: blue;
  text-transform: uppercase;
}
~~~

伪类和伪元素是用来修饰**不在文档树中**的部分，为其创建样式。

#### 1.3.3 伪类LVHA解释

`a`标签有四种状态：链接访问前，链接访问后，鼠标滑过，激活。分别对应四种伪类：`:link, :visited, :hover, :active`

当链接未访问过时：

（1）当鼠标滑过a链接时，满足:link和:hover两种状态，要改变a标签的颜色，就必须将:hover伪类在:link伪
类后面声明；
（2）当鼠标点击激活a链接时，同时满足:link、:hover、:active三种状态，要显示a标签激活时的样式（:active），
必须将:active声明放到:link和:hover之后。因此得出LVHA这个顺序。

### 1.4 块级元素行内元素

设置块级元素：`display: block`，块级元素有：`div, h1, h2, table, ul, ol, p`

设置行内元素：`display: inline / inline-block`，行内元素有：`span, img, input, button`

+ block：块级元素，前后都有换行符，可以设置`width`和`height`，`padding, margin`水平垂直方向均有效
+ inline：内联元素，前后无换行符，在一行排列，不可设置`width`和`height`，垂直方向`padding, margin`失效
+ inline-block：内联块级元素，可以设置`width`和`height`，前后无换行符，`padding, margin`水平垂直方向均有效

### 1.5 盒子模型

#### 1.5.1 盒子模型组成

- border 边框
- content 内容
- padding 内边距
- margin 外边距

![image](https://img-blog.csdnimg.cn/img_convert/a443847572daef1f0cc0f33c70044b4c.png)

盒模型分为两种 IE盒模型（border-box）、W3C标准盒模型（content-box）

**标准盒子模型： width=content 盒子宽度=width+padding+border**

IE盒子模型： width=content+padding+border 盒子宽度=width

#### 1.5.2 边框 border

~~~css
border:5px solid red; /*边框粗细， 边框样式， 边框颜色*/
~~~

边框可分开写

~~~css
border-top:5px solid red; /*只设定上边框*/
border-bottom:5px solid red; /*只设定下边框*/
~~~

表格细线边框

~~~css
border-collapse:collapse; /* 表示相邻边框合并在一起*/
~~~

**注意：`padding`会影响盒子大小，但是如果盒子本身还没有指定width、height属性，此时padding不会撑开盒子大小**

#### 1.5.3 外边距 margin

简写顺序：顺时针

~~~css
margin: 5px; /*上下左右都是5*/
margin: 5px 10px; /*上下5，左右10*/
margin: 5px 10px 20px; /*上5，左右10，下20距*/
margin: 5px 10px 20px 90px; /*上5 右10 下20 左30 顺时针*/
~~~

**让块级盒子水平居中**

1. 盒子必须指定了宽度
2. 盒子左右的外边距都设置为auto

~~~CSS
margin: 0 auto;
margin: auto;
margin-left: auto; margin-right: auto;
~~~

**让行内元素、行内块元素水平居中**

给**父元素**添加

~~~CSS
text-align: center
~~~

#### 1.5.4 外边距合并

外边距合并指的是，当两个垂直外边距相遇时，他们会形成一个外边距。

合并后的外边距的高度等于两个发生合并的外边距的高度中的**较大者**。

![image](https://img-blog.csdnimg.cn/img_convert/2a84bfe3663802af8f275707c28d1bdb.gif)

解决方法：

尽量只给一个盒子添加margin值

#### 1.5.5 清楚内外边距

网页元素很多都带有默认的内外边距，而且不同的浏览器默认的也不一致

因此我们在布局前，首先要清除下网页元素的内外边距

~~~css
* {
    padding: 0; /*清除内边框*/
    margin: 0;  /*清除外边框*/
}
~~~

#### 1.5.6 圆角边框

~~~css
border-radius:length; /*数值、百分比*/
border-radius: 10px 20px 30px 40px; /*左上，右上，右下，左下*/
border-top-left-radius: 10px; /*左上*/
border-bottom-right-radius: 10px; /*右下*/
~~~

### 1.6 对line-height的理解

+ 表示一行字的高度，包含了字间距。
+ 如果一个标签没有定义height属性，那么其最终表现的高度是由line-height决定的，而不是容器内部的文字内容。
+ 把line-height值设置为height一样大小的值可以实现单行文字的垂直居中。

### 1.7 为什么img是inline还可以设置宽高

img属于替换元素，替换元素一般有内在尺寸和宽高比，所以具有width和height，可设定

HTML中的替换元素：img、input、textarea、select

### 1.8 什么是浮动，清除浮动

#### 1.8.1 浮动特性

传统网页布局：

+ 标准流：块级元素独占一行，行内元素按照顺序从左到右，碰到父元素边缘自动换行
+ 浮动：改变元素默认排列方式，可以让多个块级元素一行内显示，碰到父元素边缘自动换行
+ 定位：有层叠的概念，可以让多个盒子前后叠压显示，如果元素自由在某个盒子内移动就用定位布局

浮动元素特性：

+ 脱离标准流，不再原来位置
+ 浮动的元素是互相贴靠在一起的（不会有缝隙），如果父级宽度装不下这些浮动的盒子，多出的盒子会另起一行对齐
+ 浮动元素会具有**行内块元素**的特性
  + 行内元素浮动后，不需要转化为块级，可以直接设置宽高
  + 块级元素没有设置宽度，默认宽度和父级一样宽，添加浮动之后，它的大小根据内容来决定



**浮动元素经常和标准流父级搭配使用，先用标准流的父元素排列上下位置，之后内部子元素采取浮动排列左右位置**。

#### 1.8.2 清除浮动

为什么？

由于父级盒子很多情况下，不方便给高度，但是子盒子浮动又不占有位置，最后父级盒子高度为0时，就会影响下面的标准流盒子

- 由于浮动元素不占用原文档流的位置，所以它会对后面的元素排版产生影响

清除浮动本质：

+ 清除浮动的本质是清除浮动元素造成的影响
+ 如果父盒子**本身有高度，则不需要清除浮动**
+ 清除浮动之后，**父级**就会根据**浮动的子盒子的自动检测高度**，父级有了高度，就不会影响下面的标准流

**方法：**

1. 额外标签法

在浮动元素末尾添加一个空的标签。`clear:both`

~~~css
<div style = "clear:both"> </div> /*新增的盒子必须是块级元素*/
~~~

2. 父级添加overflow属性

~~~css
overflow:hidden; /*最常用*/
~~~

3. 父级添加after伪元素

~~~css
.clearfix:after {
    content: "";
    diaplay: block;
    height: 0;
    clear: both;
    visibility: hidden;
}

.clearfix { /*  IE6,7专用*/
    *zoom: 1;
}
~~~

### 1.9 定位

为什么需要定位？

标准流和浮动流无法做到：

+ 某个元素可以自由地在一个盒子内移动位置，并且压住其他盒子
+ 滚动窗口，盒子可以固定在屏幕的某个位置



**定位 = 定位模式 + 边偏移**

定位模式：指定元素在文档中的定位方式

~~~CSS
position: static;   /*静态定位*/
position: relative; /*相对定位*/
position: absolute; /*绝对定位*/
position: fixed;    /*固定定位*/
~~~

边偏移：元素位置

~~~CSS
top: 80px;    /*顶端偏移量，定义元素相对于其父元素上边线的距离*/
bottom: 80px; /*底部偏移量，定义元素相对于其父元素下边线的距离*/
left: 80px;   /*左侧偏移量，定义元素相对于其父元素左边线的距离*/
right: 80px;  /*右侧偏移量，定义元素相对于其父元素右边线的距离*/
~~~

#### 1.9.1 相对定位 relative

元素在移动位置的时候，是相对于它**原来位置**来说的。

- 移动位置时**照点是自己原来的位置**
- 原来在标准流的位置继续占有，后面的盒子仍然以标准流的方式对待它。（**不脱标，继续保留原来位置**）

#### 1.9.2 绝对定位 absolute

元素在移动位置时，相对于它**祖先元素**来说的

- 如果没有祖先元素或者祖先元素没有定位，则以浏览器为准定位（Document文档）
- 如果祖先元素有定位（相对，绝对，固定），则以最近一级的有定位祖先元素为参考点移动位置
- 绝对定位不再占有原先的位置（脱标）

#### 1.9.3 子绝父相

子级使用绝对定位，父级需要使用相对定位。

+ 子级绝对定位，不会占用位置，可以放到父盒子里面的任何一个地方，不会影响其他的兄弟盒子
+ 父盒子需要加定位限制子盒子在父盒子内显示
+ 父盒子布局时，需要占有位置，因此父亲只能是相对定位

#### 1.9.4 固定定位 fixed

元素固定于浏览器可视区的位置

主要使用场景：可以在浏览器页面滚动时元素的位置不会改变

- 以浏览器的可视窗口为参照点移动元素
- 跟父元素没有任何关系
- 不随滚动条滚动
- 固定定位不占有原先的位置

固定定位也是**脱标**的，其实固定定位也可以看做是一种特殊的绝对定位

#### 1.9.5 定位叠放次序 z-index

使用定位布局时，可能会出现盒子重叠的情况。此时，可以使用z-index来控制盒子的前后次序（z轴）

~~~css
选择器 {
    z-index: 1;
}
~~~

+ 数值可以正整数、负整数、0， 默认为auto， 数值越大，盒子越靠上
+ 如果属性值相同，则按照书写顺序，后来居上
+ 数字后面不能加单位
+ 只有定位的盒子才有z-index属性

### 1.10 display属性

+ `block`：块状元素，默认宽度为父元素宽度，可设置宽高，换行显示
+ `none`：不显示，从文档流移除
+ `inline`：行内元素，默认宽度为内容宽度，不可设置宽高，同行显示
+ `inline-block`：行内块元素，默认宽度为内容宽度，可以设置宽高，同行显示
+ `list-item`：像块类型元素一样显示，并添加样式列表标记
+ `table`：块级表格
+ `inherit`：规定应该从父元素继承display属性
+ `grid`：网格布局
+ `flex`：弹性布局

### 1.11 BFC

BFC是**块级格式化上下文**

简单来说：BFC是一个封闭的空间，空间里的元素不会影响到外面的布局

#### 1.11.1 触发BFC方式

+ 根元素，即HTML标签
+ 浮动元素：float值为left或right
+ 定位元素：position为fixed或absolute的元素
+ overflow值不为visible，为auto、scroll、hidden的元素
+ display值为inline-block、table-cell、table-caption、flex、inline-flex的元素

https://jsbin.com/cinugobaca/edit?html,css,output

加了`float`后父级元素无法包裹住子级元素:

~~~css
.baba {
  border: 10px solid #bd1000;
  min-height: 10px;
   /* 通过以下方式，触发bfc */
  /* float:left; */
  /* position: absolute; */
  /* display: inline-block
  /* overflow: hidden; */
  /* display: table-cell; */
}
.erzi {
  background: pink;
  height:200px;
  width:200px;
  float: left;
}
~~~

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230130140926268.png" alt="image-20230130140926268" style="zoom: 22%;" />   =><img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230130140940725.png" alt="image-20230130140940725" style="zoom: 22%;" />  <img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230130141347718.png" alt="image-20230130141347718" style="zoom:22%;" />

#### 1.11.2 BFC作用

1. 阻止元素被浮动元素覆盖
2. 可用来清除浮动带来的外边距塌陷问题
3. 阻止因浏览器四舍五入造成的多列布局换行的情况
4. 阻止相邻元素margin合并（防止外边距折叠）
5. 可以用来自适应两栏布局

### 1.13 隐藏页面中某个元素方法

1. opacity = 0
   + 元素透明度为0，不改变页面布局
2. visibilty = hidder
   + 元素不可见，也不改变页面布局
3. display: none
   + 元素直接从渲染树消失
4. position 移动到外部
5. z-index 图层遮盖

### 1.14 什么是外边距重叠，重叠的结果

#### 1.14.1 父子元素边距重叠

预计实现的结果应该是父容器距离页面顶部 `100px`，子容器距离父容器 `100px` 

~~~css
body {
    background: gray;
    margin: 0;
    padding: 0;
}
.baba {
  width: 600px;
    height: 600px;
    background: yellow;
    margin-top: 100px;
}
.erzi {
  width: 200px;
    height: 200px;
    background: green;
    margin-top: 100px;
}
~~~

但是父容器距离页面上方 `100px` ，子容器和父容器之间却没有距离。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230130143134773.png" alt="image-20230130143134773" style="zoom:33%;" />

原因就是发生了边距重叠，一个盒子如果没有添加 `BFC`，那么它的**上边距应该和其文档流中的第一个子元素的上边距重叠**。

**解决**： 通过给父容器添加` overflow: hidden` 属性，使之成为 `BFC` 。

```js
 .baba {
     overflow: hidden;
  }
```



两个相邻的外面边距是正数时，折叠结果就是他们之中的较大值； 

两个相邻的外边距都是负数时，折叠结果是两者绝对值的较大值； 

两个外边距一正一负时，折叠结果是两者的相加的和；

## 2 CSS3新特性

### 2.1 新增伪类

![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2017/11/15/15fbf40815f2e26b~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.awebp)

### 2.2 transition 过渡

CSS3 过渡是元素从一种样式逐渐改变为另一种的效果。

~~~css
transition： CSS属性，花费时间，效果曲线(默认ease)，延迟时间(默认0)
~~~

案例1：

~~~css
/*宽度从原始值到制定值的一个过渡，运动曲线ease,运动时间0.5秒，0.2秒后执行过渡*/
transition：width,.5s,ease,.2s
~~~

案例2：

~~~css
/*所有属性从原始值到制定值的一个过渡，运动曲线ease,运动时间0.5秒*/
transition：all,.5s
~~~

常见的下拉菜单，可以使用ul的transform过渡效果

`.ul-transition ul{transform-origin: 0 0;transition: all .5s;}`

### 2.3 animation 动画

```css
animation：动画名称，一个周期花费时间，运动曲线（默认ease），动画延迟（默认0），播放次数（默认1），是否反向播放动画（默认normal），是否暂停动画（默认running）
```

案例1

```css
/*执行一次logo2-line动画，运动时间2秒，运动曲线为 linear*/
animation: logo2-line 2s linear;
```

案例2

```css
/*2秒后开始执行一次logo2-line动画，运动时间2秒，运动曲线为 linear*/
animation: logo2-line 2s linear 2s;
```

案例3

```css
/*无限执行logo2-line动画，每次运动时间2秒，运动曲线为 linear，并且执行反向动画*/
animation: logo2-line 2s linear alternate infinite;
```

还有一个重要属性

```css
animation-fill-mode : none | forwards | backwards | both;
/*none：不改变默认行为。    
forwards ：当动画完成后，保持最后一个属性值（在最后一个关键帧中定义）。    
backwards：在 animation-delay 所指定的一段时间内，在动画显示之前，应用开始属性值（在第一个关键帧中定义）。 
both：向前和向后填充模式都被应用。  */  
```

### 2.3 transform 形状转换

transform:适用于2D或3D转换的元素

transform-origin：转换元素的位置（围绕那个点进行转换）。默认(x,y,z)：(50%,50%,0)

案例1：顺时针转30度

`transform:rotate(30deg);`

案例2：缩放为0.8倍

`transform:scale(.8);`

案列3：上下翻转180度

`transform:rotateX(180deg);`

### 2.4 flex布局

参考以下：

[Flex 布局教程:语法篇 - 阮一峰的网络日志](https://link.juejin.cn/?target=http%3A%2F%2Fwww.ruanyifeng.com%2Fblog%2F2015%2F07%2Fflex-grammar.html)

### 2.5 grid布局

参考以下：

[CSS Grid 网格布局教程 - 阮一峰的网络日志](https://link.juejin.cn/?target=http%3A%2F%2Fwww.ruanyifeng.com%2Fblog%2F2019%2F03%2Fgrid-layout-tutorial.html)

### 2.6 grid和flex布局区别

+ flex布局是轴线布局，只能指定items针对轴线的位置，可以看作是一维布局；

+ grid布局则是将容器划分为行和列，产生单元格，然后指定items所在的单元格，可以看作是二维布局。

### 2.7 box-sizing 常用的属性有哪些，分别有什么作用

简单粗暴的理解就是：box-sizing:border-box的时候，边框和padding包含在**元素**的宽高之内！

~~~css
box-sizing: content-box; // 默认的标准(W3C)盒模型元素效果；
box-sizing: border-box; // 触发怪异(IE)盒模型元素的效果；
box-sizing: inherit; // 继承父元素 box-sizing 属性的值；
~~~

### 2.8 rgba()和opacity的透明效果有什么不同

`opacity` 作用于元素以及元素内的所有内容（包括文字）的透明度；

`rgba()` 只作用于元素自身的颜色或其背景色，子元素不会继承透明效果；

### 2.9 响应式 em与rem

+ px 绝对长度单位
+ em 相对长度单位，相对于**父元素**
+ rem 相对长度单位，相对于**html根元素**，常用于响应式布局

在html设置font-size，其他元素可以继承，使用rem单位

### 2.10 响应式 media query媒体查询

媒体查询，就在**监听屏幕尺寸的变化，在不同尺寸的时候显示不同的样式**！

~~~html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"> 
<title></title> 
<style>
body {
    background-color: pink;
}
@media screen and (max-width: 960px) {
    body {
        background-color: darkgoldenrod;
    }
}
@media screen and (max-width: 480px) {
    body {
        background-color: lightgreen;
    }
}
</style>
</head>
<body>

<h1>重置浏览器窗口查看效果！</h1>
<p>如果媒体类型屏幕的可视窗口宽度小于 960 px ，背景颜色将改变。</p>
<p>如果媒体类型屏幕的可视窗口宽度小于 480 px ，背景颜色将改变。</p>

</body>
</html>
~~~

### 2.11 视口与vm、vh

网页视口尺寸

```javascript
window.screen.height // 屏幕高度
window.innerHeight // 网页视口高度 （浏览器可视区域）
document.body.clientHeight // body 高度
```

- `vm` 相对于视口宽度的 1%
- `vh`  相对于视口高度的 1%

视口（Viewport）= 浏览器窗口的尺寸。如果视口为 50 厘米宽，则 1vw = 0.5 厘米。

## 3 实际应用

### 3.1 如何让盒子垂直居中

~~~css
  <style>
    .parent {
      width: 500px;
      height: 500px;
      background-color: skyblue;
    }
    .child {
      width: 200px;
      height: 200px;
      background-color: pink;
    }
  </style>
</head>

<body>
  <div class='parent'>
    <div class='child'></div>
  </div>
</body>
~~~

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210512181458387.png)

#### 方法1 定位 子绝父相

1. transform调整位置

~~~css
.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  // 再让盒子往回移动自己宽高的一般
  transform: translate(-50%, -50%);
}
~~~

2. 通过margin

~~~css
.child {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  margin: auto;
}
~~~

#### 方法2 flex布局

将父盒子设置成弹性盒容器
让子元素水平居中，垂直居中

~~~css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
~~~

#### 方法3 inline-block

子盒子设置成行内块

~~~css
.child {
    display: inline-block;
}
~~~

给父盒子添加

行高设置成和height属性一样，内部文字会水平居中

~~~css
.parent {
    text-align: center;
    line-height: 500px
}
~~~

再给子盒子添加

```css
.child {
  vertical-align: middle;
}
```

### 3.2 用纯CSS画三角形

将元素的宽高设为0，只设置 border ，把任意三条边隐藏掉（颜色设为 transparent），剩下的就是一个三角形。

~~~css
.triangle {
  width: 0;
  height: 0;
  border-width: 20px;
  border-style: solid;
  border-color: transparent transparent red transparent
}
~~~

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20230131102910200.png" alt="image-20230131102910200" style="zoom:50%;" />

### 3.3 页面布局方式

| 方式                            | 布局特点                                                     | 设计方法                                                     | 缺点                                                         |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 静态布局（Static Layout）       | 无论浏览器尺寸具体多少，网页布局始终按照最初写代码时的布局来实现 | 居中布局，所有样式使用绝对宽度和高度px；屏幕宽高调整时通过滚动条来浏览被遮掩部分 | 不能根据用户的屏幕尺寸做出不同表现                           |
| 流式布局（Liquid Layout）       | 屏幕分辨率变化时，页面内元素的大小会变化而布局不变；屏幕太大或太小都会导致元素无法正常显示 | 使用%定义宽度，px定义高度，配合max-width/min-width控制尺寸流动范围以免过大或过小影响阅读 | 如果屏幕尺寸跨度太大，那么在相对其原始设计而言过小或过大的屏幕上不能正常显示 |
| 自适应布局（Adaptive Layout）   | 屏幕分辨率变化时，页面内元素的位置会变化而大小不会变化       | 创建多个静态布局，每个静态布局对应一个屏幕分辨率范围，屏幕分辨率改变时，切换不同的静态布局（通过@media媒体查询给不同尺寸的设备切换不同样式） | 需要需要为不同的设备开发不同的页面，增加开发成本；当需求改变时可能会改动多套代码，流程繁琐。 |
| 响应式布局（Responsive Layout） | 每个屏幕分辨率下会有一个布局样式，即屏幕分辨率变化时，元素位置和大小都会变 | @media媒体查询+流式布局                                      | 媒体查询是有限的，只能适应主流媒体的宽高                     |
| 弹性布局（rem/em布局）          | 包裹文字的各元素的尺寸采用rem/em做单位（em相对其父元素，rem始终相对html大小，即页面根元素），页面主要划分区域的尺寸仍使用百分数或px | 一般使用rem，根据屏幕大小来控制html元素的font-size，即可自动改变所有用rem定义尺寸的元素的大小 | 只做到了宽度自适应，无法满足一些对高度或者元素间距要求较高的设计 |

+ 流式布局用于解决类似的设备不同分辨率之间的兼容（分辨率差异较小）；

+ 响应式布局用于解决不同设备之间不同分辨率的兼容（分辨率差异较大）

+ 响应式和自适应根据不同设备采用不同CSS，且CSS都采用百分比确定宽度

  + 响应式布局在不同设备上看上去是不一样的，会随着设备的改变而改变展示样式；

  + 自适应布局在所有的设备上看上去是一样的模板，不过是长度或者图片变小了

### 3.4 CSS预处理器和后处理器

预处理器，如：less，sass，stylus,用来预编译sass或者less，增加了css代码的复用性，还有层级，mixin， 变量，循环， 函数等，对编写以及开发UI组件都极为方便。

后处理器， 如： postCss,通常被视为在完成的样式表中根据css规范处理css，让其更加有效。目前最常做的是给css属性添加浏览器私有前缀，实现跨浏览器兼容性的问题。

### 3.5 link和@import的区别

页面中使用CSS的方式主要有三种：1.行内添加定义style属性值。2.页面头部内嵌调用。3.外面链接调用。
其中外面引用有以下两种：link和@import。

1. `link`：是 HTML 标签，在页面加载时同步加载样式表，不会阻塞页面的渲染。
2. `@import`：是 CSS 规则，在页面渲染时加载样式表，会阻塞页面的渲染。

总体来说，建议使用 `link`，因为它不会阻塞页面渲染，并且对于搜索引擎友好。

### 3.6 CSS sprites是什么

CSS sprites精灵图 是一种合并多个图像为一个大图像的技术，用于**减少网页加载时的 HTTP 请求数量。**

使用 CSS sprites 的方法如下：

1. 合并图像：将需要用到的图像合并为一个大图像。
2. 创建 CSS 规则：为每个图像创建一个 CSS 规则，通过 background-image、background-position 和 background-size 属性定义图像的位置和大小。
3. 应用 CSS 规则：将 CSS 规则应用到 HTML 元素上，使用 background-image 属性引用大图像，并通过 background-position 属性指定显示的图像部分。

使用 CSS sprites 可以提高网页的加载速度，并且可以减少服务器的负载，但在图像数量很多的情况下，CSS 规则可能会变得很复杂，影响开发效率。因此，需要根据项目的具体情况选择是否使用 CSS sprites。

### 3.7 圣杯布局

~~~html
<header>头部</header>
<div>
  <div class="center">主区域</div>
  <div class="left">左区域</div>
  <div class="right">右区域</div>
</div>
<footer>底部</footer>
~~~

~~~~css
header {
  background-color: pink;
}

.center {
  width: 100%; /* middle占据整个container，左右被挤下去 */
  background-color: skyblue;
}

.left {
  background-color: green;
  width: 100px;
}

.right {
  width: 100px;
  background-color: red;
}

footer {
  background-color: pink;
}
~~~~

同样实现以下的三栏布局：

![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ded5ee78d75a4e8a91ca8811eeeeceda~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)



**具体实现：**

+ center放在最前面，三个区域添加浮动，在三个区域的外面清除浮动

  ~~~html
  <header>头部</header>
  <div class="clearfix wrapper">
    <div class="center float_left">主区域</div>
    <div class="left float_left">左区域</div>
    <div class="right float_left">右区域</div>
  </div>
  <footer>底部</footer>
  ~~~

  ~~~css
  .float_left {
    float: left;
  }
  
  .clearfix::after {
    content: '';
    display: block;
    clear: both;
  }
  ~~~

+ 主区域两边留空padding，两侧区域上来 margin负值 + 定位

  ~~~css
  .wrapper {
    padding: 0 100px;
  }
  .left {
    background-color: green;
    width: 100px;
    margin-left: -100%;  /* 拉回到上一行 */
    position: relative; 
    left: -100px;
  }
  .right {
    margin-left: -100px; /* 拉回到上一行 */
    position: relative; 
    right: -100px;
  }
  ~~~

圣杯布局实现完毕。

### 3.8 双飞翼布局

~~~css
<body>
  <header>头部</header>
  <div class="main">
    <div class="center">主区域</div>
  </div>
  <div class="left">左区域</div>
  <div class="right">右区域</div>
  <footer>底部</footer>
</body>
~~~

~~~~css
header {
  background-color: pink;
}

.main {
  width: 100%;
  background-color: skyblue;
}

.left {
  width: 100px;
  background-color: green;
}

.right {
  width: 100px;
  background-color: red;
}

footer {
  background-color: pink;
}
~~~~

使用 HTML 的 div 元素创建三个区域，分别是 header、main 和 footer。

要实现以下效果：

![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16b3b4934cdc482eb31d129a631ef502~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

**具体实现：**

+ 先给三个中间三个区域添加**浮动**，注意要清除浮动，在浮动元素最后的标签添加`clear: both`，因为浮动元素不仔标准流会影响布局，会和底部重叠。

  ~~~html
  <header>头部</header>
  <div class="main float_left">
    <div class="center">主区域</div>
  </div>
  <div class="left float_left">左区域</div>
  <div class="right float_left">右区域</div>
  <footer>底部</footer>
  ~~~

  ~~~css
  .float_left {
    float: left;
  }
  
  footer {
    background-color: pink;
    clear: both;
  }
  ~~~

  ![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/acdfd4c5d68b41cd8cc9d60a8f377066~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

+ 主区域两边留出`margin`给左右区域，左右两侧区域给margin**负值**

  + 左侧给`margin-left: -100%`
  + 右侧给`margin-left: -100px`

  ~~~css
  .center {
    margin: 0 100px;
  }
  .left {
    width: 100px;
    background-color: green;
    margin-left: -100%;
  }
  
  .right {
    width: 100px;
    background-color: red;
    margin-left: -100px;
  }
  ~~~

双飞翼完成。

### 3.9 总结双飞翼布局和圣杯布局的区别

双飞翼布局和圣杯布局是两种常用的网页布局方式，它们的主要区别如下：

1. 布局结构：双飞翼布局是通过左右两个侧栏和中间的内容区域组成的，圣杯布局则是通过两个宽度固定的列和一个自适应宽度的中间列组成的。
2. 布局原理：双飞翼布局是通过浮动和外边距来实现的，圣杯布局是通过绝对定位和左右 margin 实现的。
3. 布局灵活性：**双飞翼布局对于宽度固定的两侧列比较灵活，圣杯布局对于中间列比较灵活。**
4. 适用场景：双飞翼布局适用于宽度固定的两侧列需要占据页面的比较多的情况，圣杯布局适用于中间列需要占据页面比较多的情况。

总体来说，双飞翼布局和圣杯布局都是适用于**三列布局**的情况，**取决于需要较多的列的宽度是否固定**，从而决定使用哪种布局方式。

## 4 其他相关知识

### 4.1 总结不同图片格式的使用场景的区别

+ png：无损压缩，压缩比高，色彩好
+ jpg：文件相对小，支持有损压缩
+ gif：适用动画
+ bmp：不支持压缩，文件大，适用壁纸
+ webp：谷歌推出，支持有损压缩和无损压缩，压缩比和压缩速度更高，但是兼容不好

### 4.2 图片base64编码

base64通过算法将图片编码成一长串字符串。

+ 有助于减少网络请求
+ 增加文件体积
+ 无法直接缓存，要缓存只能缓存包含base64的文件，比如HTML或者CSS，这相比域直接缓存图片的效果要差很多。
+ 兼容性不好
