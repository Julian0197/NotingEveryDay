### v-model原理

#### 作用在自定义组件上

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

### v-if、v-for、v-show

#### v-if和v-show区别

+ v-if是动态地向DOM树添加或删除DOM元素，v-show是通过css的`display:none`样式控制显示隐藏
+ v-if是惰性的，如果初始条件为假，则什么也不做，只有在条件第一次变为真时才开始局部编译， v-show是在任何条件下都被编译，然后被缓存，而且DOM元素保留。
+ v-if有更高的切换消耗，适合不经常改变的情况。v-show有更高的初始消耗，适合频繁切换的场景。

#### v-for和v-if不能一起连用

v-for优先级更高，不能在同一子元素使用，需要条件渲染，将v-if放到子元素中。


### data为什么是一个函数而不是对象

JS中对象是引用类型数据，当多个实例引用同一个对象，只要一个实例对这个对象进行操作，其他实例中的数据也会发生变化。

所以组件中的data写成函数形式，数据以函数返回值形式定义，这样每次复用组件，就会返回一个新的data，也就是每个组件都能有自己的空间，各自维护自己的数据不会干扰其他组件运行。

