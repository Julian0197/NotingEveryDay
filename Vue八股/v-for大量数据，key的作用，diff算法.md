### v-for 的 key

- `key` 不能取数组的索引，否则当插入一个元素后，数组的索引发生大规模的变动，会造成性能损失。
- 性能损失发生在 `diff`上，vue3 会先根据这个 key 去移动位置，再去通过 patchElement 对比 type，props 和 children
  - 如果 key 不同，这个 patch 会非常耗性能

### v-memo

`vue3.2` 新增 API，`v-memo` 是一种高效的优化组件重渲染的指令。它可以阻止组件元素在没有必要的情况下进行重新渲染，从而提高应用程序的性能。

缓存一个模板的子树。在元素和组件上都可以使用。为了实现缓存，该指令需要传入一个固定长度的依赖值数组进行比较。如果数组里的每个值都与最后一次的渲染相同，那么整个子树的更新将被跳过。

正确指定缓存数组很重要，否则应该生效的更新可能被跳过。v-memo 传入空依赖数组 (`v-memo="[]"`) 将与 `v-once` 效果相同。

最常见的情况可能是有助于渲染海量 v-for 列表 (长度超过 1000 的情况)：\

+ 当组件的 selected 状态改变，默认会重新创建大量的 vnode，即使绝大部分都没有变化（selected 状态没有改变，仍然为 false）。Vue 会将这些新的 vnode 跟上一个状态的 vnode 进行比对，找到它们的差异，然后进行更新。
+ 由于只有少部分差异，但由于 vnode 数量巨大，会消耗非常多的性能用于查找差异，这种场景下使用 v-memo 就非常的合适。
+ Vue 作为一个组件级框架，当状态变化时，它只能知道该组件发生了变化，却不知道具体是哪个元素发生了变化，因此还需对比 VNode 前后的变化，找到变化的元素，然后进行更新。
+ 通过给 memo 函数传入组件函数，实现对组件的缓存，memo 函数默认会根据 props 前后是否变化，选择是否重新创建 VDOM。

```js
<template>
    <div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
        <p>ID: {{ item.id }} - selected: {{ item.id === selected }}</p>
        <p>...more child nodes</p>
    </div>
</template>
```
+ v-memo 其实就是判断 memo 的依赖是否改变，没有改变则使用缓存的 VNode，否则就调用 render 函数创建新的 VNode。
+ Vue 在对比 VNode 时，如果 VNode 的引用没有变化，就会直接跳过该 VNode 的比对，从而实现提高性能。


