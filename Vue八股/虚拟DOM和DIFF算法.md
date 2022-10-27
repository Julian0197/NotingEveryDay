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

