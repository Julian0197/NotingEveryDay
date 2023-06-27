## v-model原理

vue的响应式原理只实现了从数据层到dom层的单向绑定（渲染函数作为响应式数据的依赖会被收集），v-model实现了双向绑定达到操作DOM也能改变数据。
### 作用在input表单上

`<input v-model="searchText"/>`

上述代码编译成render函数：

~~~js
import {
  vModelText as _vModelText,
  createVNode as _createVNode,
  withDirectives as _withDirectives,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from "vue";
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _withDirectives(
    (_openBlock(),
    _createBlock(
      "input",
      {
        "onUpdate:modelValue": ($event) => (_ctx.searchText = $event),
      },
      null,
      8 /* PROPS */,
      ["onUpdate:modelValue"]
    )),
    [[_vModelText, _ctx.searchText]]
  );
}
~~~

+ withDirective的第一个参数是vnode，额外传递了一个prop参数` "onUpdate:modelValue": ($event) => (_ctx.searchText = $event)`，用来更新searchText；
+ 第二个参数添加了vModelText 指令。

#### vModelText 的实现：

+ hook函数，第一个参数是DOM真实节点对象，第二个是binding对象，第三个是节点的vnode
+ created创建元素时:
  + 把v-model绑定的value赋值给el.value，实现了数据到DOM的单向流动
  + 再通过getModelAssigner，拿到props中的onUpdate:modelValue 属性对应的函数，赋值给el._assign
  + 最后通过addEventListener监听input标签的事件，会根据是否配置lazy属性决定监听input还是change事件
+ update更新元素时：
  + 在组件更新前判断如果数据的值和 DOM 的值不同，则把数据更新到 DOM 上

~~~js
const vModelText = {
  created(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el.value = value == null ? "" : value;
    el._assign = getModelAssigner(vnode);
    const castToNumber = number || el.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      } else if (castToNumber) {
        domValue = toNumber(domValue);
      }
      el._assign(domValue);
    });
    if (trim) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
    }
  },
  beforeUpdate(el, { value, modifiers: { trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (document.activeElement === el) {
      if (trim && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && toNumber(el.value) === value) {
        return;
      }
    }
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  },
};
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"];
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    trigger(target, "input");
  }
}
~~~

##### 修饰符

1. lazy修饰符

配置lazy，监听的是input的change事件，在input失去焦点时候触发。否则实时监听触发更新。还会多监听 compositionstart 和 compositionend 事件。

当用户在使用一些中文输入法的时候，会触发 compositionstart 事件，这个时候设置 e.target.composing 为 true，这样虽然 input 事件触发了，但是 input 事件的回调函数里判断了 e.target.composing 的值，如果为 true 则直接返回，不会把 DOM 值赋值给数据。

然后当用户从输入法中确定选中了一些数据完成输入后，会触发 compositionend 事件，这个时候判断 e.target.composing 为 true 的话则把它设置为 false，然后再手动触发元素的 input 事件，完成数据的赋值。

2. trim修饰符

触发input或者change时会手动调用trim去除收尾空格，还会额外监听 change 事件执行 el.value.trim() 把 DOM 的值的首尾空格去除。

3. number修饰符

如果配置了 number 修饰符，或者 input 的 type 是 number，就会把 DOM 的值转成 number 类型后再赋值给数据。

### 作用在自定义组件上

下面是案例，定义了一个custom-input自定义组件，并使用v-model给传递数据。组件内部有一个input输入框，使用v-model绑定父组件传递过来的props。因为props不可直接更改，所以使用计算属性，当改变input框的值时，派发一个自定义事件 update:modelValue，修改父组件传入的数据。

~~~js
app.component("custom-input", {
  props: ["modelValue"],
  template: `
    <input v-model="value">
  `,
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
});
~~~

接下来我们可以在其他地方使用这个组件：`<custom-input v-model="searchText" />`

模板编译后生成的render函数是：
~~~js
import {
  resolveComponent as _resolveComponent,
  createVNode as _createVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from "vue";
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_custom_input = _resolveComponent("custom-input");
  return (
    _openBlock(),
    _createBlock(
      _component_custom_input,
      {
        modelValue: _ctx.searchText,
        "onUpdate:modelValue": ($event) => (_ctx.searchText = $event),
      },
      null,
      8 /* PROPS */,
      ["modelValue", "onUpdate:modelValue"]
    )
  );
}
~~~

编译结果中，并没有用withDirective包裹。对示例稍作修改：
`<custom-input :modelValue="searchText" @update:modelValue="$event=>{searchText = $event}"/>`

~~~js
import {
  resolveComponent as _resolveComponent,
  createVNode as _createVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from "vue";
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_custom_input = _resolveComponent("custom-input");
  return (
    _openBlock(),
    _createBlock(
      _component_custom_input,
      {
        modelValue: _ctx.searchText,
        "onUpdate:modelValue": ($event) => {
          _ctx.searchText = $event;
        },
      },
      null,
      8 /* PROPS */,
      ["modelValue", "onUpdate:modelValue"]
    )
  );
}
~~~

v-model作用于组件本质是一个语法糖：往组件传入一个modelValue的prop，并监听一个名为update:modelValue的自定义事件。

所以在子组件内，定义一个名字为modelValue的prop，然后在数据改变的时候派发update:modelValue事件，事件的回调函数接受一个参数，执行的时候会把参数 $event 赋值给数据 data。

**vue2和vue3 v-model 的差异:**

vue2中自定义组件只可以使用一次v-model，如果需要绑定多个属性，需要手动在子组件中通过props和emit来实现。vue3中一个组件可以使用多次，支持传参数：
`<custom-input v-model:text="searchText"/>`

~~~js
import {
  resolveComponent as _resolveComponent,
  createVNode as _createVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from "vue";
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_custom_input = _resolveComponent("custom-input");
  return (
    _openBlock(),
    _createBlock(
      _component_custom_input,
      {
        text: _ctx.searchText,
        "onUpdate:text": ($event) => (_ctx.searchText = $event),
      },
      null,
      8 /* PROPS */,
      ["text", "onUpdate:text"]
    )
  );
}
~~~

### 自定义事件派发

看一下派发事件函数，emit的实现

~~~js
function emit(instance, event, ...args) {
  const props = instance.vnode.props || EMPTY_OBJ;
  let handlerName = `on${capitalize(event)}`;
  let handler = props[handlerName];

  if (!handler && event.startsWith("update:")) {
    handlerName = `on${capitalize(hyphenate(event))}`;
    handler = props[handlerName];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6 /* COMPONENT_EVENT_HANDLER */,
      args
    );
  }
}
~~~

emit 方法支持 3 个参数，第一个参数 instance 是组件的实例，也就是执行 $emit 方法的组件实例，第二个参数 event 是自定义事件名称，第三个参数 args 是事件传递的参数。

emit 方法首先获取事件名称，把传递的 event 首字母大写，然后前面加上 on 字符串，比如我们前面派发的 update:modelValue 事件名称，处理后就变成了 onUpdate:modelValue。

接下来，通过这个事件名称，从 props 中根据事件名找到对应的 prop 值，作为事件的回调函数。

如果找不到对应的 prop 并且 event 是以 update: 开头的，则尝试把 event 名先转成连字符形式然后再处理。

找到回调函数 handler 后，再去执行这个回调函数，并且把参数 args 传入。针对 v-model 场景，这个回调函数就是拿到子组件回传的数据然后修改父元素传入到子组件的 prop 数据，这样就达到了数据双向通讯的目的。