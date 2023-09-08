### watch

+ 作用：侦听一个或多个响应式数据源，在数据源变化时，调用所给的回调函数。
+ 参数：数据源，回调函数，可配置选项
  1. 数据源：函数（返回值），ref，响应式对象，以上数值构成的数组
  2. 回调： 可接受新值和旧值，以及一个用于注册副作用清理的回调函数。该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如等待中的异步请求。
  3. 选项：immediate立即调用，deep深度监听（对象会自动调用该属性）


```js
export function watch(
  source,
  cb,
  options
) {
  // 副作用函数
  const getter = source
  // 调度函数
  const scheduler = () => cb()
  // 通过 ReactiveEffect 类实例化出一个 effect 实例对象
  const effect = new ReactiveEffect(getter, scheduler)
  // 立即执行实例对象上的 run 方法，执行副作用函数，触发依赖收集
  effect.run()
}
```

原理：
1. 通过 ReactiveEffect 类实例化出一个 reactive effect 实例对象，然后执行实例对象上的 run 方法就会执行 getter 副作用函数
2. getter 副作用函数里的响应式数据发生了读取的 get 操作之后触发了依赖收集
3. 当响应式数据变化的时候，会触发副作用函数的重新执行，但又因为传入了 scheduler 调度函数，所以会执行调度函数，而调度函数里是执行了回调函数 cb，从而实现了监测。

### watchEffect

+ 作用：立即运行函数，追踪其内部的响应式数据，发生变化时触发该函数
+ 参数：副作用函数，可选项
  + `flush: 'post'`：默认情况下，用户创建的侦听器回调，都会在 Vue 组件更新之前被调用。这意味着你在侦听器回调中访问的 DOM 将是被 Vue 更新之前的状态。侦听器延迟到组件渲染之后再执行。
  + 这些配置选项，根据scheduler调度器实现，调度器提供了三个入列方式的API，控制执行顺序（组件更新前，组件更新执行，组件更新后执行