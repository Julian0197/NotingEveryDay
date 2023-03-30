### Vue 中的 defineComponent
目的：ts类型推断

`export default {}`，对于编辑器来说，`{}`只是一个对象。

`export default defineComponent({})`，`{}`就变成了参数，对参数类型的提示可以实现{}中属性的提示，包括对参数进行类型推导

vscode因为插件功能，不写defineComponent一样有提示