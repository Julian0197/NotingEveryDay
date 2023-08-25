## vue3 DOM的更新

+ DOM更新通过 effect的`scheduler`实现。当响应式数据变化后，vue会将需要更新的组件放到一个队列，等到下一次tick再执行更新操作。
+ 下一次`tick`指的是浏览器的刷新间隔，每一次tick代表一次渲染循环，以固定频率(60次/秒)进行渲染
  
https://juejin.cn/post/7093880734246502414?searchId=20230814145726EDB1007322FD67FB4C4D

### 组件的异步更新

~~~ts
instance.update = new ReactiveEffect(
  componentUpdateFn,
  () => queueJob(update), // updata: () => effect.run() 返回值 componentUpdateFn
  // 将effect添加到组件的scope.effects中
  instance.scope // track it in component's effect scope
)
~~~

上述代码是**组件更新的effect函数**：

在响应式数据发生变化后，不会立刻执行effect，而是会执行`scheduler`中的`queueJob(update)`

#### queueJob

~~~ts
// packages/runtime-core/src/scheduler.ts
export function queueJob(job: SchedulerJob) {
  if (
    !queue.length ||
    !queue.includes( // queue中是否已经存在相同job
      job,
      isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
    )
  ) {
    if (job.id == null) {
      // 向queue添加job queue是一个数组
      queue.push(job)
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job)
    }
    // 执行queueFlush
    queueFlush()
  }
}
~~~

queueJob主要是将scheduler添加到`queue`队列，然后执行`queueFlush`

#### queueFlush

~~~ts
function queueFlush() {
  // isFlushing和isflushPending初始值都是false
  // 说明当前没有flush任务在执行，也没有flush任务在等待执行
  if (!isFlushing && !isFlushPending) {
    // 初次执行queueFlush将isFlushPending设置为true 表示有flush任务在等待执行
    isFlushPending = true
    // resolvedPromise是promise.resolve()
    // flushJobs被放到微任务队列中 等待所有同步scheduler执行完毕后执行
    // 这样就可以保证flushJobs在一次组件更新中只执行一次
    // 更新currentFlushPromise 以供nextTick使用
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}
~~~

+ `flushJobs`被放到微任务队列中 等待所有同步`scheduler`执行完毕后执行
+ 这样就可以保证`flushJobs`在一次组件更新中只执行一次

#### flushJobs

Vue3的Scheduler提供了三个入列方式的API：
+ `queuePreFlushCb` API: 加入 Pre 队列 组件更新前执行
+ `queueJob` API: 加入 queue 队列 组件更新执行
+ `queuePostFlushCb` API: 加入 Post 队列 组件更新后执行

出列方式：
~~~ts
function flushJobs(seen?) {
    isFlushPending = false
    // 组件更新前队列执行
    flushPreFlushCbs(seen)
    try{
        // 组件更新队列执行
        let job
        while (job = queue.shift()) {
            job && job()
        }
    } finally {
        // 组件更新后队列执行
        flushPostFlushCbs(seen)
        // 如果在执行异步任务的过程中又产生了新的队列，那么则继续回调执行
        if (
            queue.length ||
            pendingPreFlushCbs.length ||
            pendingPostFlushCbs.length
        ) {
            flushJobs(seen)
        }
    }
}
~~~

当所有的同步scheduler执行完毕后，就会去处理微任务队列的任务，就会执行flushJobs回调函数。
#### 总结

+ 组件内当修改响应式数据后，组件更新函数会被放到queue中
+ 注册一个微任务，这个微任务负责执行queue中的所有job
  + 所以这时就算我们同步修改多次/多个响应式数据，同一个组件的更新函数只会被放入一次到queue中
+ 等到同步操作结束后才会去执行注册的微任务，组件更新函数才会被执行，组件才会被更新。

### 生命周期Hooks的调用

~~~ts
instance.update = effect(() => {
    if (!instance.isMounted) {
        const { bm, m } = instance
        // 生命周期：beforeMount hook
        if (bm) {
            invokeArrayFns(bm)
        }
        // 组件初始化的时候会执行这里
        // 为什么要在这里调用 render 函数呢
        // 是因为在 effect 内调用 render 才能触发依赖收集
        // 等到后面响应式的值变更后会再次触发这个函数  
        const subTree = (instance.subTree = renderComponentRoot(instance))
        patch(null, subTree, container, instance, anchor)
        instance.vnode.el = subTree.el 
        instance.isMounted = true
        // 生命周期：mounted
        if(m) {
            // mounted需要通过Scheduler的函数来调用
            queuePostFlushCb(m)
        }
    } else {
        // 响应式的值变更后会从这里执行逻辑
        // 主要就是拿到新的 vnode ，然后和之前的 vnode 进行对比

        // 拿到最新的 subTree
        const { bu, u, next, vnode } = instance
        // 如果有 next 的话， 说明需要更新组件的数据（props，slots 等）
        // 先更新组件的数据，然后更新完成后，在继续对比当前组件的子元素
        if(next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
        }

        // 生命周期：beforeUpdate hook
        if (bu) {
            invokeArrayFns(bu)
        }

        const subTree = renderComponentRoot(instance)
        // 替换之前的 subTree
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        // 用旧的 vnode 和新的 vnode 交给 patch 来处理
        patch(prevSubTree, subTree, container, instance, anchor)

        // 生命周期：updated hook
        if (u) {
            // updated 需要通过Scheduler的函数来调用
            queuePostFlushCb(u)
        }
    }
}, {
    scheduler() {
        queueJobs(instance.update)
    }
})
~~~

Vue3更新的副作用函数中，会调用两个生命周期hooks：
1. 组件挂载之前：`beforeMount` 和 `mounted`
2. 组件更新：`beforeUpdate` 和 `updated`
3. `beforeMount` 和 `beforeUpdate` **同步**执行
4. `updated` 和 `mounted` 异步，通过 `Scheduler` 的 `queuePostFlushCb` 来处理。
   1. `queuePostFlushCb` 中的函数会在组件更新后执行
   2. 通过异步执行 `mounted/updated` 能够确保所有的节点已经全部挂载完毕，而组件的更新过程通过异步的方式则是为了性能考虑。

### vue3 的`nextTick`

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
