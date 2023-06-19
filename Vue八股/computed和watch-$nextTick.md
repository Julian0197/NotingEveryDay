## computed和watch的区别

**Computed：计算属性**

依赖其他属性值，有缓存，只有它以来的属性发生变化，下一次获取的computed值才会重新计算（不支持异步数据的监听）

computed计算属性是一个函数，它接受一个函数作为参数。这个函数会被封装在reactiveEffect类中，并定义一个scheduler调度器。当依赖发生变化时，不会直接调用传入的函数，而是会执行scheduler。scheduler中会将dirty变量设为true，用来判断当前计算属性是否是第一次加载，如果已经加载过了就是false。

在get中，首先会检查是否有缓存。如果没有缓存，会调用activeEffect的run函数来执行传入的函数fn。如果有缓存，则直接返回缓存的value。执行scheduler表示，computed中的响应式数据发生变化，依赖关系发生更新，dirty变量变为true，这样下次访问该计算属性时，会再次调用effect.run。

总之，computed计算属性实现了缓存功能，只有在依赖发生变化时才会重新计算值，避免了重复计算的开销。同时，它也保证了响应式数据的实时更新。

**Watch侦听器**

不支持缓存，更多的是监听作用，**每当监听的数据变化时都会执行回调**（支持**异步数据的监听**）

**运用场景：**

- 当需要进行数值计算,并且依赖于其它数据时，应该使用 computed，因为可以利用 computed 的缓存特性，避免每次获取值时都要重新计算。
- 当需要在数据变化时执行异步或开销较大的操作时，应该使用 watch，使用 watch 选项允许执行异步操作 ( 访问一个 API )，限制执行该操作的频率，并在得到最终结果前，设置中间状态。这些都是计算属性无法做到的。

## nextTick原理

### 异步渲染视图

**为什么数据修改之后，没有立刻渲染视图？**

在Vue.js中，当状态发生变化，watcher会得到通知，触发虚拟DOM的渲染流程，**watcher触发渲染的操作是异步的**。**更新DOM通过使用`vm.$nextTick`注册到微任务中。**

**异步的原因：减少性能消耗**

数据变化后，组件内的所有状态变化都会通知同一个`watcher`，然后对整个组件进行`DIFF`算法并更新DOM。假设同一轮时间循环中，有多个事件发生了变化，那么组件的`watcher`会受到多份通知，进行多次渲染。

为了减少内存消耗，可以等待所有状态修改完毕后，一次性将整个组件的DOM渲染到最新。**所以将受到通知的watcher实例添加到队列中缓存起来，在添加队列之前检查其中是否已经存在相同的watcher，在下一次事件循环中，触发渲染流程。**

### nextTick的作用

作用：**将回调延迟到下次DOM更新之后执行**

本质：**将回调添加到任务队列中延迟执行**

1. 下一次DOM更新是指**下次微任务执行时更新DOM的操作**，默认nextTick添加到`microtasks`中，，但在特殊情况下会使用 `macrotasks`，比如 `v-on`。
2. 更新DOM的回调和`vm.$nextTick`注册的回调，都是添加到微队列中，**nextTick需要用在DOM更新循环结束后**，所以需要注意顺序问题，**如果需要在`vm.$nextTick`中获取更新后的DOM，先修改数据，再使用`vm.$nextTick`注册回调**

### nextTick原理

将传入的回调函数包装成异步任务，异步任务分为宏任务和微任务，为了尽快执行默认是选择的微任务

nextTick提供了四种异步方法 `Promise.then`,`Mutation Observer`,`setImmediate`,`setTimeout`

**大致流程为：**

+ 把回调函数包装一下放入callbacks等待执行，这时候会考虑传入函数执行失败或者不存在的情况
+ 再调用timeFunc，因为 `timerFunc` 是一个异步执行的函数，且定义一个变量`pending`来保证一个事件循环中只调用一次 `timerFunc` 函数

**源码解读**

源码位置：`core/util/next-tick`

~~~js
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

// 上面三行与核心代码关系不大
// noop表示一个无操作空函数，用作函数默认值，防止传入undefined报错
// handleError是错误处理函数
// isIe,isIOS,isNative是环境判断函数
// 其中isNative判断某个属性或方法是否原生支持，如果不支持或通过第三方实现支持都会返回 false


export let isUsingMicroTask = false // 标记nextTick 最终是否以微任务执行

const callbacks = [] // 存放调用nextTick时传入的回调函数
let pending = false // 标记是否已经向任务队列中添加了一个任务，如果pending为true说明不能再添加了
// 当向任务队列中添加任务时，将pending置为true

// 声明nextTick函数，接受一个回调函数和一个执行上下文作为参数
// 回调的this自动绑定到调用它的实例上
export funciton nextTick(cb?: Function, ctx?: Object) {
    let _resolve
    // 将传入的回调函数放入数组，这里对callbacks形成了闭包
    callbacks.push(() => { // 对传入的回调函数进行try catch错误捕获
        if (cb) {
            try {
                cb.call(ctx)
            } catch(e) { // 统一的错误处理
                handleError(e, ctx, 'nextTick')
            }
        } else if (_resolve) {
            _resolve(ctx)
        }
    })
    
    // 如果当前没有在任务队列的回调函数，就执行timeFunc选择当前环境优先支持的异步方法
    if (!pending) {
        pending = true
        timeFunc()
    }
    
    // 如果没有传入回调，并且当前环境支持promise，就返回一个promise
    // 在返回的promsie.then中DOM已经更新好了
    if (!cb && typeof Promise ! == 'undefined') {
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}

// 判断当前环境先支持的异步方法，优先选择微任务
// 优先级：Promise---> MutationObserver---> setImmediate---> setTimeout
// setTimeout 可能产生一个 4ms 的延迟，而 setImmediate 会在主线程执行完后立刻执行
// setImmediate 在 IE10 和 node 中支持

// 当在同一轮事件循环中多次调用 nextTick 时 ,timerFunc 只会执行一次

let timeFunc
// 判断当前环境是否支持promsie
if (typeof Promise ! == 'udnefined' && isNative(Promise)) {
    const p = Promise.resolve()
    timeFunc = () => {
        // 用Promise.then把flushCallbacks函数包裹成一个异步微任务
        p.then(flushCallbacks)
        if (isIOS) setTimeout(noop)
    }
    // 标记当前 nextTick 使用的微任务
    isUsingMicroTask = true
}

    // 如果不支持 promise，就判断是否支持 MutationObserver
    // 不是IE环境，并且原生支持 MutationObserver，那也是一个微任务
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
    let counter = 1
    // new 一个 MutationObserver 类
    const observer = new MutationObserver(flushCallbacks) 
    // 创建一个文本节点
    const textNode = document.createTextNode(String(counter))   
    // 监听这个文本节点，当数据发生变化就执行 flushCallbacks 
    observer.observe(textNode, { characterData: true })
    timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)  // 数据更新
    }
    isUsingMicroTask = true    // 标记当前 nextTick 使用的微任务
    
    
    // 判断当前环境是否原生支持 setImmediate
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    timerFunc = () => { setImmediate(flushCallbacks)  }
} else {

    // 以上三种都不支持就选择 setTimeout
    timerFunc = () => { setTimeout(flushCallbacks, 0) }
}

// 如果多次调用nextTick，会依次执行nextTick方法，将回调函数放入callbacks数组中
// 最后通过flushCallbacks函数遍历callbacks数组的拷贝并执行
function flushCallbacks() {
    pending = false    
    const copies = callbacks.slice(0)    // 拷贝一份 callbacks
    callbacks.length = 0    // 清空 callbacks
    for (let i = 0; i < copies.length; i++) {    // 遍历执行传入的回调
        copies[i]()
    }
}

// 为什么要拷贝一份 callbacks

// 用 callbacks.slice(0) 将 callbacks 拷贝出来一份，
// 是因为考虑到在 nextTick 回调中可能还会调用 nextTick 的情况,
// 如果在 nextTick 回调中又调用了一次 nextTick，则又会向 callbacks 中添加回调，
// 而 nextTick 回调中的 nextTick 应该放在下一轮执行，
// 否则就可能出现一直循环的情况，
// 所以需要将 callbacks 复制一份出来然后清空，再遍历备份列表执行回调
~~~

