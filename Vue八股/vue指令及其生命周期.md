## Vue指令

### 应用

vue支持自定义指令，作用在普通DOM元素上，在元素的某个阶段（比如：挂载到页面时）执行某些操作。

1. 全局注册v-focus

~~~js
import Vue from "vue";
const app = Vue.createApp({});
// 注册全局 v-focus 指令
app.directive("focus", {
  // 挂载的钩子函数
  mounted(el) {
    el.focus();
  },
});
~~~

2. 组件内部局部注册

~~~js
directives: {
  focus: {
    mounted(el) {
      el.focus()
    }
  }
}
~~~

### 指令的定义

指令本身是一个js对象，对象上挂载这一些生命周期钩子函数

比如定义一个：v-log指令，在每个生命周期打印一些log信息。在App组件注册指令，就可以全局使用。

~~~js
const logDirective = {
  beforeMount() {
    console.log("log directive before mount");
  },
  mounted() {
    console.log("log directive mounted");
  },
  beforeUpdate() {
    console.log("log directive before update");
  },
  updated() {
    console.log("log directive updated");
  },
  beforeUnmount() {
    console.log("log directive beforeUnmount");
  },
  unmounted() {
    console.log("log directive unmounted");
  },
};

// app.js
import { createApp } from "vue";
import App from "./App";
const app = createApp(App);
app.directive("log", logDirective);
app.mount("#app");
~~~
~~~vue
<template>
  <p v-if="flag">{{ msg }}</p>
  <input v-else v-log v-model="text"/>
  <button @click="flag=!flag">toggle</button>
</template>
<script>
  export default {
    data() {
      return {
        flag: true,
        msg: 'Hello Vue',
        text: ''
      }
    }
  }
</script>
~~~

上述代码：当你点击按钮后，会先执行指令定义的 beforeMount 和 mounted 钩子函数，然后你在 input 输入框中输入一些内容，会执行 beforeUpdate 和 updated 钩子函数，然后你再次点击按钮，会执行 beforeUnmount 和 unmounted 钩子函数。

### 指令的注册

~~~js
function createApp(rootComponent, rootProps = null) {
  const context = createAppContext();
  const app = {
    _component: rootComponent,
    _props: rootProps,
    directive(name, directive) {
      if (process.env.NODE_ENV !== "production") {
        validateDirectiveName(name);
      }
      if (!directive) {
        // 没有第二个参数，则获取对应的指令对象
        return context.directives[name];
      }
      if (process.env.NODE_ENV !== "production" && context.directives[name]) {
        // 重复注册的警告
        warn(`Directive "${name}" has already been registered in target app.`);
      }
      context.directives[name] = directive;
      return app;
    },
  };
  return app;
}
~~~

+ directive方法是app的一个属性，第一个参数为指令名称，第二个参数为指令对象。
+ 全局注册就是把指令对象注册到app对象创建的全局上下文context.directives中，以name为key；局部注册保存在组件对象的定义中
+ validateDirectiveName 是用来检测指令名是否和内置的指令（如 v-model、v-show）冲突；如果不传第二个参数指令对象，表示这是一次指令的获取；指令重复注册会报警告。

### 指令的应用

以 v-focus 指令为例，在组件中使用这个指令：<input v-focus />。

这个模板编译后生成的 render 函数：

~~~js
import {
  resolveDirective as _resolveDirective,
  createVNode as _createVNode,
  withDirectives as _withDirectives,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from "vue";
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _directive_focus = _resolveDirective("focus");
  return _withDirectives(
    (_openBlock(), _createBlock("input", null, null, 512 /* NEED_PATCH */)),
    [[_directive_focus]]
  );
}
~~~

如果不使用指令，单独的input编译后的render函数：

~~~js
import {
  createVNode as _createVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from "vue";
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createBlock("input");
}
~~~

