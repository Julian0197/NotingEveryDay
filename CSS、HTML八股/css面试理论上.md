### 获取DOM元素尺寸、位置

1. `clientWidth`,`clientHeight`：边框以内的尺寸，视口高度，不包含滚动条
2. `offsetWidth`,`offsetHeight`：包含边框包含滚动条的整数
3. `scrollWidth`,`scrollHeight`：不需要滚动时等同于`clientWidth`，包含溢出区域
4. `var {top, height, weight, bottom} = element.getBoundingClientRect()`：尺寸含小数，如果不是标准矩形，会用一个最小矩形把元素给框起来，宽高距离都是基于这个最小矩形计算的，包含滚动条。

### BFC（块级格式上下文）

#### 实际意义：

+ 统一解决高度塌陷，外边距重叠，清除浮动的问题。
+ BFC可以看做元素的一种属性，当拥有BFC，容器内的元素不会再布局上影响外部元素
+ BFC区域内，规定了该区域内常规流的布局满足：
  + 普通流块盒在水平方向上，必须撑满BFC包含块
  + 普通流块盒在BFC包含块垂直方向上依次摆放
  + 若无缝相邻，外边距合并
  + 自动高度和摆放位置，无视浮动元素

#### 常见定位方案：

+ 普通流：
  + 元素按照html的顺序自上而下排列
  + 行内元素水平排列，占满一行换行
  + 块级元素占一整行
  + 默认都是普通流

+ 浮动
  + 按照普通流位置出现，根据浮动方向尽可能向左边或右边偏移
+ 绝对定位：
  + 脱离普通流
  + 绝对定位不影响兄弟元素

#### 如何添加BFC属性

+ 根容器（`<html>`）
+ 浮动元素（`float`不为`none`）
+ 绝对定位元素（`position: absolute/fixed`）
+ `overflow`属性不为`hidden`
+ `display`为 flex，inline-block，table，grid 

#### 避免外边距重叠

~~~html
<div class="cube"></div>
<div class="cube"></div>

<style>
.cube {
	width: 100px;
    height: 100px;
    background: blue;
    margin: 100px;
}
</style>
~~~

发生外边距塌陷，`margin-top`和`margin-bottom`合并一个，大小为两者中最大一个。

解决办法：通过添加父盒子，并让他具有BFC

~~~css
<div class="container">
	<div class="cube"></div>
</div>
<div class="container">
	<div class="cube"></div>
</div>

<style>
.container {
    overflow: hidden // BFC属性
}
.cube {
	width: 100px;
    height: 100px;
    background: blue;
    margin: 100px;
}
</style>
~~~

#### 清除浮动

~~~html
<div class="container">
	<div class="cube"></div>
</div>
<div class="container">
	<div class="cube"></div>
</div>

<style>
.container {
    border: 1px solid red;
}
.cube {
	width: 100px;
    height: 100px;
    background: blue;
    margin: 100px;
    float: left;
}
</style>
~~~

希望看到红色边框包裹着蓝色方块。实际上子元素浮动，脱离文档流，父盒子没有被撑大只具有2px的高度。

解决办法：BFC清除浮动

给父容器`.container` 添加 `overflow: hidden;`,触发父容器的BFC达到包裹子容器的效果。

### 阻止元素被浮动元素覆盖

~~~html
<div class="floatDiv"></div>
<div class="normalDiv"></div>

<style>
.floatDiv {
    width: 100px;
    height: 100px;
    float: left;
    background-color: blue;
}
.normalDiv {
	width: 200px;
    height: 200px;
    background-color: red;
    margin: 100px;
	overflow: hidden;
}
</style>
~~~

如果不添加`overflow:hidden`，浮动元素会覆盖普通元素。触发BFC后，普通元素不受前面浮动元素干扰。

### CSS隐藏元素

1. `display：none`
   + 浏览器不会渲染，不占据空间(不在布局树里面)
   + 无法进行DOM事件监听
   + 动态改变此属性会引起回流
   + 不会被子元素继承

2. `visibilty：hidden`
   + 元素被隐藏，但是占据空间（在布局树）
   + 无法监听DOM事件
   + 会引起重绘
   + 会被子元素继承，子元素可以设置 visibility: visible; 来取消隐藏

3. `opacity：0`
   + 透明度100%，元素隐藏，占据空间
   + 可以进行DOM事件监听
   + 提升为合成层，不会触发重绘，性能较高；
   + 继承：会被子元素继承,且，子元素并不能通过 opacity: 1 来取消隐藏；