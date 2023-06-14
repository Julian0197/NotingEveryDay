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

生成一个`modelValue`属性和`onUpdate:modelValue`事件
~~~html
<Son v-model="data"></Son>
~~~

在子组件中

~~~js
// 声明，接受数据和方法
const props =  defineProps({
    modelValue: Object
  })
const emits = defineEmits(['update:modelValue']) 
// 调用
const change = (val) => emits('update:modelValue', val)
~~~

**从原理上分析**
首先注册了一个自定义组件，内部使用了原生input，并通过v-model绑定父组件传过来的value。props不能直接作为原生input的v-model值，因为prop不能直接修改。在计算属性中使用getter取值。
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

## v-if、v-for、v-show

### v-if和v-show区别

+ v-if是动态地向DOM树添加或删除DOM元素，v-show是通过css的`display:none`样式控制显示隐藏
+ v-if是惰性的，如果初始条件为假，则什么也不做，只有在条件第一次变为真时才开始局部编译， v-show是在任何条件下都被编译，然后被缓存，而且DOM元素保留。（这里局部编译可以理解为生成vnode）
+ v-if有更高的切换消耗，适合不经常改变的情况。v-show有更高的初始消耗，适合频繁切换的场景。

### v-for和v-if不能一起连用

v-for优先级更高，不能在同一子元素使用，需要条件渲染，将v-if放到子元素中。


## data为什么是一个函数而不是对象

JS中对象是引用类型数据，当多个实例引用同一个对象，只要一个实例对这个对象进行操作，其他实例中的数据也会发生变化。

所以组件中的data写成函数形式，数据以函数返回值形式定义，这样每次复用组件，就会返回一个新的data，也就是每个组件都能有自己的空间，各自维护自己的数据不会干扰其他组件运行。

