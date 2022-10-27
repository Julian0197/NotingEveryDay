## v-model原理

**（1）作用在表单元素上** 动态绑定了input的value指向了message变量，当触发input事件会动态地把message设置为value。

~~~vue
<input v-model='sth'/>
//  等同于
<input
	v-bind:value = "sth"
    v-on:input="sth=$event.target.value"
>
// $event指当前触发的事件对象
// $event.target 指当前触发的事件对象的DOM
// $event.target.value 就是当前dom的value值;

~~~

**（2）作用在组件上** 在自定义组件中，v-model 默认会利用名为 value 的 prop和名为 input 的事件

**本质是一个父子组件通信的语法糖，通过prop和$.emit实现。**

~~~vue
<custom-input v-model="searchText">
// 相当于
<custom-input
  v-bind:value="searchText"
  v-on:input="searchText = $event"           
></custom-input>
// $event就是子组件中派发input事件传递的数据
~~~

+ 父组件将`searchText`变量传入子组件custom-input，使用的prop名为`value`
+ 父组件监听`input`事件，子组件中通过`$emit`派发input事件并传递值，父组件将接收到的值赋给`searchText`

custom-input组件：

~~~vue
Vue.component('custom-input', {
  props: ['value'],
  template: `
    <input
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
  `
})
~~~

## data为什么是一个函数而不是对象

JS中对象是引用类型数据，当多个实例引用同一个对象，只要一个实例对这个对象进行操作，其他实例中的数据也会发生变化。

所以组件中的data写成函数形式，数据以函数返回值形式定义，这样每次复用组件，就会返回一个新的data，也就是每个组件都能有自己的空间，各自维护自己的数据不会干扰其他组件运行。

