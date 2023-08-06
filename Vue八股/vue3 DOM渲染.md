## vue3 DOM的更新

+ DOM更新通过 effect的`scheduler`实现。当响应式数据变化后，vue会将需要更新的组件放到一个队列，等到下一次tick再执行更新操作。
+ 下一次`tick`指的是浏览器的刷新间隔，每一次tick代表一次渲染循环，以固定频率(60次/秒)进行渲染
+ 具体来说，Vue3中使用了`requestAnimationFrame`来进行调度，`requestAnimationFrame`在浏览器下一次**重绘**之前执行，这样可以保证DOM更新发生在浏览器渲染之前。避免不必要的重绘，提高性能。

> vue3执行`update`，`mounted`中的副作用函数都会用`queuePostFlushCb`包裹，`queuePostFlushCb`是什么？

`queuePostFlushCb`函数会将副作用函数添加到一个内部的队列中，并在下一个刷新周期执行这些函数。这样做可以确保在组件状态更新完成后再执行副作用函数，以避免出现不一致的状态。

> vue3 的`nextTick`

~~~ts
const p = currentFlushPromise || resolvedPromise
return fn ? p.then(this ? fn.bind(this) : fn) : p
~~~

`nextTick`中的函数会在`currentFlushPromise`的`then`回调中才会执行

在组件更新函数`setupRenderEffect`中，我们关注到这个函数把更新函数`componentUpdateFn`包装为副作用函数`effect`并将`effect`的执行函数通过`queueJob`函数维护进任务队列`queue`。

最后在`queueFlush`函数中，我们就发现了`currentFlushPromise`被赋值

~~~ts
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
      isFlushPending = true;
      currentFlushPromise = resolvedPromise.then(flushJobs);
    }
  }
~~~

所以确保了，nextTick中的函数，一定是等待Dom更新完毕之后才去执行的，也就能拿到正确的Dom数据了。
