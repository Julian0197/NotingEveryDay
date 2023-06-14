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

以 v-focus 指令为例，在组件中使用这个指令：`<input v-focus />`

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

对比两个编译结果，可以看到如果元素节点有指令，编译生成的vnode会用withDirective包装一层。

#### 指令的解析函数resolveDirective

withDirective注册指令就是把定义的指令对象保存到组件实例或者全局的上下文属性中。那么resolveDirective就是要根据指令的名字找到保存的指令对象。

+ resolveDirective内部调用resolveAsset，第一个参数表示要查找的是指令类型的属性，第二个参数是指令名。
+ resolveAsset内部通过resolve解析局部注册的资源，组件定义对象上的 directives 属性中查找对应 name 的指令，如果查找不到则通过 instance.appContext，也就是我们前面提到的全局的 appContext。
+ 优先查找组件是否局部注册该指令，如果没有则看是否全局注册该指令，如果还找不到则在非生产环境下报警告，提示用户没有解析到该指令。如果你平时在开发工作中遇到这个警告，那么你很可能就是没有注册这个指令，或者是 name 写得不对。
+ 在 resolve 函数实现的过程中，它会先根据 name 匹配，如果失败则把 name 变成驼峰格式继续匹配，还匹配不到则把 name 首字母大写后继续匹配，这么做是为了让用户编写指令名称的时候可以更加灵活，所以需要多判断几步用户可能编写的指令名称的情况。

~~~js
const DIRECTIVES = "directives";
function resolveDirective(name) {
  return resolveAsset(DIRECTIVES, name);
}
function resolveAsset(type, name, warnMissing = true) {
  // 获取当前渲染实例
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    const res =
      // 局部注册
      resolve(Component[type], name) ||
      // 全局注册
      resolve(instance.appContext[type], name);
    if (process.env.NODE_ENV !== "production" && warnMissing && !res) {
      warn(`Failed to resolve ${type.slice(0, -1)}: ${name}`);
    }
    return res;
  } else if (process.env.NODE_ENV !== "production") {
    warn(
      `resolve${capitalize(type.slice(0, -1))} ` +
        `can only be used in render() or setup().`
    );
  }
}
function resolve(registry, name) {
  return (
    registry &&
    (registry[name] ||
      registry[camelize(name)] ||
      registry[capitalize(camelize(name))])
  );
}
~~~

#### withDirectives 的实现

+ 第一个参数是vnode，第二个参数是指令对象构成的数组，因为一个节点可能有多个指令
+ withDirective就是给vnode添加了一个dirs属性，dirs的值是这个元素节点上所有指令对象构成的数组。通过遍历directives数组，拿到每一个指令对象对应的value，参数arg，修饰符，构造成一个binding对象，这个对象还绑定了组件的实例instance。
+ 这么做的目的是在元素的生命周期中知道运行哪些指令相关的钩子函数，以及在运行这些钩子函数的时候，还可以往钩子函数中传递一些指令相关的参数。

~~~js
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    process.env.NODE_ENV !== "production" &&
      warn(`withDirectives can only be used inside render functions.`);
    return vnode;
  }
  const instance = internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (isFunction(dir)) {
      dir = {
        mounted: dir,
        updated: dir,
      };
    }
    bindings.push({
      dir,
      instance,
      value,
      oldValue: void 0,
      arg,
      modifiers,
    });
  }
  return vnode;
}
~~~

#### 指令生命周期

下面看一下，在元素的生命周期中，如何调用指令对应的生命周期hooks。

##### 元素挂载阶段 beforeMounted mounted

+ 元素挂载通过mountElement实现，在把vnode append到容器之前，会执行指令中的beforeMount钩子函数
+ 把创建的DOM元素挂载到container后，会通过 queuePostRenderEffect 的方式执行指令的 mounted 钩子函数。
  + queuePostRenderEffect用于延迟执行mounted钩子函数，它会将effect函数推入一个名为postFlushCbs的数组中，然后在下一次DOM更新时执行这个数组中的所有effect函数。
  + 原因：mounted钩子函数中会有对DOM的操作，这些操作需要在DOM渲染后再执行
  + 在Vue3中，DOM更新是通过scheduler来实现的。当数据变化时，Vue会将需要更新的组件加入到一个队列中，然后在下一次tick时，调用scheduler来执行这个队列中的所有组件的更新操作。在执行完组件的更新操作后，scheduler会检查postFlushCbs数组中是否有需要执行的effect函数，如果有，则依次执行这些函数。
  + hostInsert函数，它并不会直接渲染DOM。它只是将元素插入到容器中，具体的渲染操作是由scheduler来完成的。当scheduler执行时，它会遍历所有需要更新的组件，然后调用它们的render函数来生成新的虚拟DOM树，最后将新的虚拟DOM树渲染到真实的DOM中。

~~~js
const mountElement = (
  vnode,
  container,
  anchor,
  parentComponent,
  parentSuspense,
  isSVG,
  optimized
) => {
  let el;
  const { type, props, shapeFlag, dirs } = vnode;
  // 创建 DOM 元素节点
  el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is);
  if (props) {
    // 处理 props，比如 class、style、event 等属性
  }
  if (shapeFlag & 8 /* TEXT_CHILDREN */) {
    // 处理子节点是纯文本的情况
    hostSetElementText(el, vnode.children);
  } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
    // 处理子节点是数组的情况，挂载子节点
    mountChildren(
      vnode.children,
      el,
      null,
      parentComponent,
      parentSuspense,
      isSVG && type !== "foreignObject",
      optimized || !!vnode.dynamicChildren
    );
  }
  if (dirs) {
    invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
  }
  // 把创建的 DOM 元素节点挂载到 container 上
  hostInsert(el, container, anchor);
  if (dirs) {
    queuePostRenderEffect(() => {
      invokeDirectiveHook(vnode, null, parentComponent, "mounted");
    });
  }
};
~~~

##### invokeDirectiveHook实现
指令中钩子函数的执行通过invokeDirectiveHook。

+ 前两个参数是新旧vnode，第三个参数是组件实例，第四个参数是钩子名称
+ 遍历当前元素vnode的dirs数组，找到每一个指令的binding对象，找到每个binding对应的hook。
+ 如果传入了旧的vnode，那就把旧的binding解析出来
+ 最后执行对应的hook，并且传入一些响应的参数，包括元素的 DOM 节点 el，binding 对象，新旧 vnode

~~~Js
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    const hook = binding.dir[name];
    if (hook) {
      callWithAsyncErrorHandling(hook, instance, 8 /* DIRECTIVE_HOOK */, [
        vnode.el,
        binding,
        vnode,
        prevVNode,
      ]);
    }
  }
}
~~~

##### 更新 beforeUpdated update

+ 更新操作再patchElement实现
+ 在更新当前元素props后（patchProps），更新子节点前（patchChildren），执行beforeUate
+ 更新子节点后，通过 queuePostRenderEffect 的方式执行指令的 updated 钩子函数。



~~~js
const patchElement = (
  n1,
  n2,
  parentComponent,
  parentSuspense,
  isSVG,
  optimized
) => {
  const el = (n2.el = n1.el);
  const oldProps = (n1 && n1.props) || EMPTY_OBJ;
  const newProps = n2.props || EMPTY_OBJ;
  const { dirs } = n2;
  // 更新 props
  patchProps(
    el,
    n2,
    oldProps,
    newProps,
    parentComponent,
    parentSuspense,
    isSVG
  );
  const areChildrenSVG = isSVG && n2.type !== "foreignObject";
  if (dirs) {
    invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
  }
  // 更新子节点
  patchChildren(
    n1,
    n2,
    el,
    null,
    parentComponent,
    parentSuspense,
    areChildrenSVG
  );
  if (dirs) {
    queuePostRenderEffect(() => {
      invokeDirectiveHook(vnode, null, parentComponent, "updated");
    });
  }
};
~~~

##### 元素卸载

unmount 方法的主要思路就是用递归的方式去遍历删除自身节点和子节点。

可以看到，在移除元素的子节点之前会执行指令的 beforeUnmount 钩子函数，在移除子节点和当前节点之后，会通过 queuePostRenderEffect 的方式执行指令的 unmounted 钩子函数。

~~~js
const unmount = (vnode, parentComponent, parentSuspense, doRemove = false) => {
  const {
    type,
    props,
    children,
    dynamicChildren,
    shapeFlag,
    patchFlag,
    dirs,
  } = vnode;
  let vnodeHook;
  if ((vnodeHook = props && props.onVnodeBeforeUnmount)) {
    invokeVNodeHook(vnodeHook, parentComponent, vnode);
  }
  const shouldInvokeDirs = shapeFlag & 1 /* ELEMENT */ && dirs;
  if (shapeFlag & 6 /* COMPONENT */) {
    unmountComponent(vnode.component, parentSuspense, doRemove);
  } else {
    if (shapeFlag & 128 /* SUSPENSE */) {
      vnode.suspense.unmount(parentSuspense, doRemove);
      return;
    }
    if (shouldInvokeDirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
    }
    // 卸载子节点
    if (
      dynamicChildren &&
      (type !== Fragment ||
        (patchFlag > 0 && patchFlag & 64)) /* STABLE_FRAGMENT */
    ) {
      unmountChildren(dynamicChildren, parentComponent, parentSuspense);
    } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      unmountChildren(children, parentComponent, parentSuspense);
    }
    if (shapeFlag & 64 /* TELEPORT */) {
      vnode.type.remove(vnode, internals);
    }
    // 移除 DOM 节点
    if (doRemove) {
      remove(vnode);
    }
  }
  if ((vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
    queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }
    }, parentSuspense);
  }
};
~~~