## 渲染流程

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221111135023589.png" alt="image-20221111135023589" style="zoom:50%;" />

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221111135126120.png" alt="image-20221111135126120" style="zoom:33%;" />

打印App可以看到，对象中有render这个属性

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221111135501169.png" alt="image-20221111135501169" style="zoom:50%;" />

打印App.render()，得到的是VNode 虚拟dom树

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221111135846031.png" alt="image-20221111135846031" style="zoom:50%;" />

下面模仿一下虚拟节点 转化为 真实节点，也就是mountElement过程

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="./node_moudles/vue/dist/vue.esm-browser.js"></script>
  </head>
  <body>
    <script>
      const vnode = {
        type: "div",
        props: {
          id: "app",
        },
        children: "hwllo vue3",
      };

      // 将虚拟节点转化为真实元素 mountElement
      // type就是根节点，vue3默认是fragment
      const element = document.createElement(vnode.type);
      for (const key in vnode.props) {
        const val = vnode.props[key];
        element.setAttribute(key, val);
      }
      element.textContent = vnode.children;
      document.body.append(element);
    </script>
  </body>
</html>

~~~



## Vue3中h函数常见使用方法

除了使用`<template>`生成html，还可以在js中通过`render`函数生成DOM。

### render

render是组件的一个选项，他的返回值会被作为组件的DOM结构

~~~vue
<script>
import { defineComponent } from "vue";
export default defineComponent({
  render(){
    return '<h2>123456789</h2>'
  }
});
</script>
~~~

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221016204015805.png" alt="image-20221016204015805" style="zoom:33%;" />

可以看到html标签被当做字符串渲染了,**并没有生成h2标签. 如何正确插入h2标签呢?**

### VNode

如果想插入DOM就要用到"VNode", VNode是vue对页面DOM节点的描述, 其是一个Object类型。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221016204141341.png" alt="image-20221016204141341" style="zoom:25%;" />

### h

官方提供了`h函数`，用来生成VNode

~~~vue
<script>
import { defineComponent, h } from "vue";
export default defineComponent({
  render() {
    const props = { style: { color: "red" } };
    return h("h2", props, "123456789");
  },
});
</script>
~~~

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221016204719818.png" alt="image-20221016204719818" style="zoom:30%;" />

"h"函数的第**1**个参数是"**标签名**", 第**2**个是"**属性**", 在这个例子里可以理解为html的所有属性, 第**3**个是"**内容**". "内容"不仅仅可以是字符串, 还可以是**"VNode"或2者混合**:



**渲染组件**

h函数还可以渲染组件，假设我们有一个"switch"组件, 其支持`<switch v-model:checked="checked"/>`。

~~~vue
<script>
import { defineComponent, h } from "vue";
import ASwitch from "../components/ASwitch.vue";
export default defineComponent({
  components: { ASwitch },

  data() {
    return { checked: false };
  },

  render() {
    return h(ASwitch)
  }
});
</script>
~~~

## custom render

vue3 API，可以把vue的开发模型扩展到其他平台（不止浏览器，canvas，ios等）

打印一下vue3 的api  `createRenderer()`

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221111142413482.png" alt="image-20221111142413482" style="zoom: 50%;" />

`createApp`默认把模板渲染到DOM API上

下面自己实现一下自己的render函数

~~~js
import { createRenderer } from 'vue'
import App from './App.vue'


const renderer = createRenderer({
  createElement(type) {
    const element = document.createElement(type);
    return element;
  },
  insert(el, parent) {
    console.log(el);
    console.log(parent);
  },
});

console.log(renderer)
renderer.createApp(App).mount(document.querySelector('#app'))
~~~

这里的type就是根节点

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221111144013253.png" alt="image-20221111144013253" style="zoom:50%;" />

添加元素后，报错，因为缺乏渲染接口`setElementtext`

~~~js
  setElementText(node, text) {
    console.log(node,text);
    node.append(document.createTextNode(text))
  }
~~~

最后能成功完成渲染
