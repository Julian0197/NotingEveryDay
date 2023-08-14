## 渲染流程

按照渲染的时间顺序，渲染可分为：构建DOM树，样式计算，布局阶段，分层，绘制，分块，光栅化和合成。

### 构建DOM树

浏览器无法直接使用HTML，需要将HTML转化为浏览器可以理解的结构 —— DOM树。

DOM内容和HTML几乎一样，但是DOM是保存在内存中的树结构，可以通过JS来查询或修改内容：`document.getElementsByTagName("p")[0].innerText = "black"`

### 样式计算

#### 1.转化CSS => styleSheets
   
CSS样式来源：
1. 通过 link 引用外部 CSS 文件
2. <style> 标签内的 CSS
3. 行内样式，元素 style 属性内的 CSS

浏览器也无法直接理解CSS，渲染引擎会将CSS文件解析为浏览器可以理解的结构 —— styleSheets

在控制台输入`document.styleSheets`能看到，同样可以查询和修改。

#### 2.转化样式表属性，标准化

~~~css
body { font-size: 2em }
p {color:blue;}
span  {display: none}
div {font-weight: bold}
div  p {color:green;}
div {color:red;}
~~~

将上述属性，如：`2em、blue、bold`转化为渲染引擎可以理解的标准化的计算值。

转化后：
~~~css
body { font-size: 32px }
p {color: rgb(0, 255, 255);}
span  {display: none}
div {font-weight: 700}
div  p {color: rgb(0, 128, 0);}
div {color: rgb(255, 0, 0);}
~~~

#### 3.计算DOM树中每个节点的具体样式

涉及到：**CSS继承规则和层叠规则**

+ CSS继承：每个DOM节点都包含父节点的样式
+ 样式层叠：配置优先规则，合并多个源的属性值的算法

样式计算阶段为了计算出DOM节点每个元素的具体样式，结果保存在 ComputedStyle 中。

### 布局阶段

布局：计算DOM树中可见元素的几何位置

#### 1.创建布局树

DOM中存在很多不可见元素（`head`标签，`display:none`元素），在显示前需要额外构建一棵只包含可见元素的布局树。

构建布局树，浏览器大体上完成了下面这些工作：
+ 遍历 DOM 树中的所有可见节点，并把这些节点加到布局树中；
+ 而不可见的节点会被布局树忽略掉，
  + 如 head 标签下面的全部内容
  + 再比如 body.p.span 这个元素，因为它的属性包含 dispaly:none，所以这个元素也没有被包进布局树。

#### 2.布局计算

根据完整的布局树计算布局树节点的坐标位置。