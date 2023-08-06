## script setup语法糖的优势

### 属性和方法无需返回，可直接使用

setup() 来写组合式 API 时，内部定义的属性和方法，必须使用 return 暴露到上下文，外部才能够使用。

使用 script setup 语法糖，不需要 return 和 setup函数，只需要全部定义到 script setup 内。

### 组件自动注册

在 script setup 语法糖中，引入的组件可以自动注册，不需要再通过 components 进行注册，而且无法指定当前组件的名字，会自动以**文件名**为主，省去了 name 属性。

### 获取props

父组件给子组件传值时，需要 props 接收。`setup( props, context )`接收两个参数，props 接收传递的数。

而 script setup 语法糖接收 props 中的数据时，使用 defineProps 方法来获取

### 获取 attrs、slots 和 emits

setup( props, context )接收两个参数，context 上下文环境，其中包含了属性、插槽、自定义事件三部分。

~~~ts
setup(props,context){
 const { attrs, slots, emit } = context
 // attrs 获取组件传递过来的属性值，
 // slots 组件内的插槽
 // emit 自定义事件 子组件
}
~~~

使用 script setup 语法糖时:
+ useAttrs 方法 获取 attrs 属性
+ useSlots 方法获取 slots 插槽
+ defineEmits 方法获取 emit 自定义事件

在模板中，可以直接通过 `$slot, $attrs获取`

### 对外暴露属性

script setup 语法糖的组件默认不会对外暴露任何内部声明的属性。如果有部分属性要暴露出去，可以使用 `defineExpose`。

### defineOptions定义组件name

1. 安装`unplugin-vue-define-options`依赖

2. 如果用vite搭建的项目，在`vite.config.ts`中配置：

~~~ts
import { defineConfig } from 'vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(), DefineOptions()],
})
~~~

3. 在`tsconfig.json`设置`types`:

~~~json
{
    "compilerOptions": {
       "types": ["unplugin-vue-define-options/macros-global" /* ... */]
    }
}
~~~

+ `compilerOptions`是用来配置 TypeScript 编译器的选项。它允许你指定一系列编译器的设置，以控制编译过程和生成的 JavaScript 代码的行为。
+ `types`属性是compilerOptions的一个子属性，它用来告诉编译器要包含哪些类型声明文件。
  + 类型声明文件用于描述 JavaScript 代码中的类型信息，以便在 TypeScript 中进行类型检查和提示。
  + 通过在types属性中指定类型声明文件的名称，编译器会自动将这些类型声明文件包含在编译过程中。
+ 对于给定的代码片段，它告诉编译器在编译过程中包含名为"unplugin-vue-define-options/macros-global"的类型声明文件。