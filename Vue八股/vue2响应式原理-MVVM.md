## Vue基本原理

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220923113405053.png" alt="image-20220923113405053" style="zoom: 33%;" />

当一个Vue实例创建时，Vue会遍历data中的属性，用`Object.defineProperty`(vue3.0中使用`proxy`)将他们转化为getter/setter，并且在内部追踪相关依赖，在属性被访问和修改时通知变化。每个组件实例都有相应的**watcher**程序实例，它会在组件渲染的过程中把属性记录为依赖，之后当依赖项的setter被调用时，会通知watcher重新计算，从而使他关联的组件得以更新。

## Vue数据响应式原理

简单来说就是使用`Object.defineProperty`这个`API`为数据设置`get`和`set`。当读取到某个属性时，触发`get`将读取它的组件对应的`render watcher`收集起来；当重置赋值时，触发`set`通知组件重新渲染页面。如果数据的类型是数组的话，还做了单独的处理，对可以改变数组自身的方法进行重写，因为这些方法不是通过重新赋值改变的数组，不会触发`set`，所以要单独处理。响应系统也有自身的不足，所以官方给出了`$set`和`$delete`来弥补。



使用Vue时，修改数据（`state`），视图就会自动更新，这就是响应式系统。要实现响应式系统，需要：

+ **数据劫持**：当数据变化时，可以做一下特定的事
+ **依赖收集**：要知道视图层的内容（`DOM`）依赖了哪些数据(`state`)
+ **派发更新**：数据变化后，如何通知依赖这些数据的`DOM`。

vue的响应式原理实现了数据的**双向绑定**：将model绑定给view，当更新model时，view自动更新。用户更新view，model数据也自动更新。这里model，view涉及到了`MVVM模型`。

### 数据劫持

#### 对象的响应式处理

Vue2中使用`Object.defineProperty`进行数据劫持

~~~js
const obj = {}
Object.defineProperty(obj, b, {
    value: 3,
    // b属性不能更改
    writable: false // 是否可写，默认为true
    // 遍历obj时，b属性不会被遍历到
    enumerable: false // 是否可以被枚举，默认为true
})

let val = 1
Object.defineProperty(obj, a, {
    get() {
        console.log('get property a')
        return val
    },
    set(newVal) {
        if (val === newVal) return
        console.log('set property a => ${newVal}')
        val = newVal
    }
})
~~~

访问obj.a,调用getter方法；给obj.a设置新值，调用setter方法

相当于使用自定义的getter和setter重写了原来的行为，这就是数据劫持

但是上述代码中，总是需要一个全局变量（val）保存属性值，因此改用一下写法：

~~~js
function defineReactive(data, key, value = data[key]) {
    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(newVal) {
            if (newVal === val) return
            value = newVal
        }
    })
}
defineReactive(obj, a, 1)
~~~

在defineReactive中形成了**闭包**，value变量不会消失

**如果obj有多个属性？**

可以新建一个Observer类来遍历该对象 => 将一个正常的obj转化为每个层级的属性都是响应式的

~~~js
class Observer {
    constructor(value) {
        this.value = value
        this.walk()
    }
    walk() { // 遍历属性
        Object.keys(this.value).forEach((key) => defineReactive(this.value, key))
    }
}
const obj = {a: 1, b: 2}
new Observer(obj) // 对obj中每个属性进行数据劫持
~~~

上述情况适用于，单层的obj对象，如果**obj内部有嵌套属性**：使用**递归**完成嵌套属性的数据劫持	

~~~js
// 入口函数判断当前value是否是对象，如果是对象需要继续遍历做响应式处理，如果不是对象直接返回
function observe(data) {
    // data不是对象，说明已经到底
    if (typeof data ! == 'object') return
    // data是对象，继续调用Observer
    new Observer(data)
}

// Observer类：用于遍历当前数据，做数据劫持
class Observer {
    constructor(value) {
        this.value = value
        this.walk()
    }
    walk() {
        // 遍历当前对象（this.value），进行数据劫持
        Object.keys(this.value).forEach((key) => defineReactive(this.value, key))
    }
}

// defineReactive方法
function defineReactive(data, key, value = data[key]) {
    // 如果value是对象，说明属性有嵌套，递归调用observe函数监测该对象
    // 如果value不是对象，说明是属性，observe函数会直接返回
    observe(value)
    Object.defineReactive(data, key, {
        get() {
            return value
        },
        set(newVal) {
            if (newVal === val) return
            value = newVal
            observe(newVal) // 设置的新值也要进行监听
        }
    })
}
~~~

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220923211216856.png" alt="image-20220923211216856" style="zoom:25%;" />

三个函数相互调用形成递归。这个时候`setter`为什么不直接调用渲染函数来重新渲染页面，这样不可以实现响应式么？

可以，但是代价是任何一个数据的变化，都会导致页面的重新渲染。但我们想要的效果是：**数据变化时，只更新与这个数据有关的`DOM`结构，这就涉及到了下面说的`依赖`**

#### 数组的响应式处理

##### 1.为什么要对数组做特殊处理呢？

~~~js
function defineReactive(obj, key, val) {
    const dep = new Dep()
    observe(value)
    Object.defineProperty(obj, key, {
        get() {
            console.log('get: ', val)
            return val
        },
        set(newVal) {
            console.log('set: ', newVal)
            value = newVal
        }
    })
}
const arr = [1, 2, 3]
arr.forEach((val, index, arr) => {
  defineReactive(arr, index, val)
})
~~~

访问修改数组元素，`getter`和`setter`会被触发。但是如果`arr.unshift(0)`呢？数组的每个元素要依次向后移动一位，这就会触发`getter`和`setter`，导致依赖发生变化。由于数组是顺序结构，所以索引(key)和值不是绑定的，因此这种处理方法是有问题的。

那既然不能监听数组的索引，那就**监听数组本身**吧。`vue`对`js`中7种会改变数组的方法进行了重写：`push, pop, unshift, shift, splice, reverse, sort`。那么，我们就要对`Observer`进行修改了：

~~~js
class Observer {
    constructor(value) {
        this.value = value
        if (Array.isArray(value)) {
            // .......代理原型代码
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }
    walk(obj) {
        Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]))
    }
    // 需要继续监听数组内的元素（如果数组内元素是对象）
    observeArray(arr) {
        arr.forEach((i) => observe(i))
    }
}
~~~

##### 2.代理原型

调用`arr.push`时，实际上是调用了`Array.prototype.push()`，对push方法进行特殊处理，除了重写原型方法，还可以使用**代理原型**。

在数组实例和`Array.prototype`之间增加了一层代理来实现派发更新（先不看依赖收集），数组调用代理原型方法派发更新，代理原型再调用真实原型实现原有的功能：

~~~js
// observe.js
if (Array.isArray(value)) {
    Object.setPrototypeOf(value, proxyPrototype) // value.__proto__ === proxyPrototype
    this.observeArray(value)
}
~~~

~~~js
// array.js
const arrayPrototype = Array.prototype // 缓存真实原型

// 需要处理的方法
const reactiveMethods = [
  'push',
  'pop',
  'unshift',
  'shift',
  'splice',
  'reverse',
  'sort'
]

// 增加代理原型proxyPrototype.__proto__ === arrayPrototype
const proxyPrototype = Object.create(arrayPrototype)

// 定义响应式方法
reactiveMethods.forEach((method) => {
    const originalMethod = arrayPrototype[method]
    // 在代理原型上定义变异响应式方法
    Object.defineProperty(proxyPrototype, method, {
        value: function reactiveMethod(...args) {
            const result = originalMethod.apply(this, args) // 执行原型默认的方法
            // 派发更新代码先省略
            return result
        },
        enumerable: false,
        writable: true,
        configuable: true
    })
})
~~~

如何派发更新？

对象使用`dep.notify`派发更新，dep数组存储了对该数据依赖的`watcher`对象，当触发`setter`时，会调用`dep`数组中所有`watcher`中的回调函数。之所以能够拿到`dep`数组，因为`dep`在`getter`和`setter`形成了闭包，保存了`dep`数组，保证每个属性都有自己的`dep`数组。

array的派发更新不是在setter中实现，而是在array的代理原型中实现，这个时候无法访问到dep数组。

如果在`array.js`中定义一个`dep`，那所有的数组都会共享这一个`dep`，显然是不行的。因此，vue在每个对象身上添加了一个自定义属性：`__ob__`，这个属性保存自己的`Observer`实例，然后在`Observer`上添加一个属性`dep`

##### 3.`__ob__`属性

对`observe`做一个修改：

~~~js
// observe.js
function observe(value) {
    if (typeof value ! == 'object') return
    let ob
    // __ob__可以用来标识当前对象是否已经被监听
    if (value.__ob__ && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else {
        ob = new Observer(value)
    }
    return ob
}
~~~

`Observer`也要修改

~~~js
constructor(value) {
  this.value = value
  this.dep = new Dep()
  // 在每个对象身上定义一个__ob__属性,指向每个对象的Observer实例
  def(value, '__ob__', this)
  if (Array.isArray(value)) {
    Object.setPrototypeOf(value, proxyPrototype)
    this.observeArray(value)
  } else {
    this.walk(value)
  }
}

// 工具函数def，就是对Object.defineProperty的封装
function def(obj, key, value, enumerable = false) {
    Object.defineProperty(obj, key, {
        value,
        enumerable,
        writable: true,
        configuable: true
    })
}
~~~

这样，对象`obj: { arr: [...] }`就会变为`obj: { arr: [..., __ob__: {} ], __ob__: {} }`

还有一个小细节，`push, unshift, splice`可能会向数组中增加元素，这些增加的元素也应该被监听：

~~~js
// array.js
reactiveMethods.forEach((method) => {
    const originalMethod = arrayPrototype[method]
    Object.defineProperty(proxyPrototype, method, {
        value: function reactiveMethod(...args) {
            const result = originalMethod.apply(this, args)
            const ob = this.__ob__ // 新增
            // 对push，unshift，splice的特殊处理
            let inserted = null
            switch(method) {
                case 'push':
                case 'unshift':
                    inserted = args
                    break
                case 'splice'
                    // splice方法的第三个及以后的参数是新增的元素
                    inserted = args.slice(2)
            }
            // 如果有新增元素，继续监听
            if (inserted) ob.observeArray(inserted)
            ob.dep.notify() // 新增
            return result
        },
        enumerable: false,
        writable: true,
        configuable: true
    })
})
~~~

到这里，我们通过在对象身上新增一个`__ob__`属性，完成了数组的派发更新，接下来是依赖收集

##### 5.依赖收集

依赖收集之前，先看一下`__ob__`

~~~js
const obj = {
    arr: [
        {
            a: 1
        }
    ]
}
~~~

执行`observe(obj)`后，`obj`变成了下面的样子

~~~js
obj: {
  arr: [
    {
      a: 1,
      __ob__: {...} // 增加
    },
    __ob__: {...}   // 增加
  ],
  __ob__: {...}     // 增加
}
~~~

我们的`defineReactive`函数中，为了递归地为数据设置响应式，调用了`observe(val)`，而现在的`observe()`会返回`ob`，也就是`value.__ob__`，那我们不妨接收一下这个返回值

```js
// defineReactive.js
let childOb = observe(val) // 修改

set: function reactiveSetter(newVal) {
  if (val === newVal) {
    return
  }
  val = newVal
  childOb = observe(newVal) // 修改
  dep.notify()
}
```

那这个`childOb`是什么呢？比如看`obj.arr`吧：

1. 执行`observe(obj)`会触发`new Observer(obj)`，设置了`obj.__ob__`属性，接下来遍历`obj`的属性，执行`defineReactive(obj, arr, obj.arr)`
2. 执行`defineReactive(obj, arr, obj.arr)`时，会执行`observe(obj.arr)`，返回值就是`obj.arr.__ob__`

也就是说，每个属性(比如`arr`属性)的`getter`和`setter`不仅通过闭包保存了属于自己的`dep`，而且通过`__ob__`保存了自己的`Observer`实例，`Observer`实例上又有一个`dep`属性。如果添加以下代码：

```js
// defineReactive.js
get: function reactiveGetter() {
  if (Dep.target) {
    dep.depend()
    childOb.dep.depend() // 新增
  }
  return val
}
```

就会有下面的情况：**每个属性的`getter`和`setter`通过闭包保存了`dep`，这个`dep`收集了依赖自己的`watcher`， 闭包中还保存了`chilOb`，`childOb.dep`也保存了依赖自己的`watcher`，这两个属性保存的`watcher`相同，那前文讲到的派发更新就能够实现了**。

> `obj.prop`闭包中保存的`childOb`就是`obj.prop.__ob__`，闭包中的`dep`与`childOb.dep`保存的内容相同

但是`dep`和`childOb.dep`保存的`watcher`并不完全相同，看`obj[arr][0].a`，由于这是一个基本类型，对它调用`observe`会直接返回，因此所以没有`__ob__`属性，但是这个属性闭包中的`dep`能够收集到依赖自己的`watcher`。所以上述代码可能会报错，故做如下修改

~~~js
get: function reactiveGetter() {
  if (Dep.target) {
    dep.depend()
    if (childOb) {
      childOb.dep.depend() // 新增  
    }
  }
  return val
}
~~~

##### 6. 依赖数组就等于依赖了数组中所有的元素

~~~js
const obj = {
  arr: [
    { a: 1 }
  ]
}

observe(obj)

// 数据监听后的obj
obj: {
  arr: [
    {
      a: 1,
      __ob__: {...}
    },
    __ob__: {...}
  ],
  __ob__: {...}
}
~~~

新建一个依赖`arr`的`watcher`，如果为`obj.arr[0]`增加一个属性：

~~~js
Vue.set(obj.arr[0], 'b', 2) // 注意是Vue.set
~~~

这样是不会触发`watcher`回调函数的。因为我们的`watcher`依赖`arr`，求值时触发了`obj.arr`的`getter`，所以`childOb.dep(arr.__ob__.dep)`中收集到了`watcher`。但是`obj.arr[0].__ob__`中并没有收集到`watcher`，所以为其设置新值不会触发更新。但是`Vue`认为，**只要依赖了数组，就等价于依赖了数组中的所有元素**，因此，我们需要进一步处理

```js
// defineReactive.js
get: function reactiveGetter() {
  if (Dep.target) {
    dep.depend()
    if (childOb) {
      childOb.dep.depend()
      // 新增
      if (Array.isArray(val)) {
        dependArray(val)
      }
    }
  }
  return val
}

function dependArray(array) {
  for (let e of array) {
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
```

以上新增代码的作用，就是当依赖是数组时，遍历这个数组，为每个元素的`__ob__.dep`中添加`watcher`。

**总结**

通过设置代理原型，让数组执行变异方法来完成响应式，并且为每个属性设置了`__ob__`属性，这样，我们在闭包之外就能访问`dep`了，从而完成派发更新，包括`Vue.set`方法也利用了这个属性。

其实对于数组来说，依赖收集阶段依然是在`getter`中完成的，只不过是借助了`arr.__ob__`来完成，并且需要对数组的所有项都添加依赖，而更新派发是在变异方法中完成的，依然借助了`__ob__`。

### 收集依赖与派发更新

#### 依赖

vue响应系统中，每个`watcher`实例**订阅**一个或多个数据，这些数据也被称为`watcher`的依赖，当依赖发生变化，`watcher`实例会接收到数据发生变化这条消息，之后会执行一个回调函数来实现某些功能（比如更新页面）

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220923225517140.png" alt="image-20220923225517140" style="zoom:33%;" />

`Watcher`类可以如下实现：

~~~js
class Watcher {
    constructor(data, expression, cb) {
        // data：数据对象，如obj
        // expression：表达式 如obj.a 根据data和expression可以获取watcher依赖的数据
        // cb：依赖变化时触发的回调函数
        this.data = data
        this.expression = expression
        this.cb = cb
        // 初始化watcher实例时订阅数据
        this.value = this.get()
    }
    get() {
        const value = parsePath(this.data, this.expression)
        return value
    }
    
    // 当收到数据变化的消息时执行该方法，从而调用cb
    update() {
        this.value = parsePath(this.data, this.expression) // 对存储数据进行更新
        cb() // 执行回调函数
    }
}
function parsePath(obj, expression) {
    const segments = expression.split('.')
    for (let key of segments) {
        if (!obj) return
        obj = obj[key]
    }
    return obj
}
~~~

总结一下，需要实现的功能：

1. 有一个数组来存储`watcher`
2. `watcher`实例需要订阅数据，也就是要获取对数据的依赖
3. `watcher`的依赖发生变化时触发`watcher`的回调函数，也就是派发更新

每个数据都应该维护一个属于自己的数组，这个数组存放依赖自己的`watcher`，我们可以在`defineReactive`中定义一个数组`dep`,这样通过闭包，每个属性都能拥有一个属于自己的`dep`。

**因为一个数据可能在多个地方使用，所以每次用到这个数据的地方都会新建watcher对象，并存到这个数据的dep数组中，当这个数据更新，会执行dep中所有watcher对象的update回调函数**

~~~js
function defineReactive(data, key, value = data[key]) {
    const dep = [] // 增加
    observe(value)
    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(newVal) {
            if (newVal === value) return
            value = newVal
            observe(newVal)
            dep.notify()
        }
    })
}
~~~

#### 依赖收集

当页面初次渲染时（暂时忽略渲染函数和虚拟DOM部分）：渲染引擎会解析模板，比如引擎遇到了一个插值表达式，如果此时实例化一个`watcher`，会执行自身的`get`方法，`get`方法作用是获取自己依赖的数据，而我们用`defineProperty`重写了数据的访问行为，为每个数据定义了`getter`,`getter`会执行，因此我们在`getter`中把当前的`watcher`添加到`dep`数组中，就能完成**依赖收集**

> 执行`getter`时，`new Watcher()`的`get`方法还没有执行完毕。
>
> `new Watcher()`时执行`constructor`，调用了实例的`get`方法，实例的`get`方法会读取数据的值，从而触发了数据的`getter`，`getter`执行完毕后，实例的`get`方法执行完毕，并返回值，`constructor`执行完毕，实例化完毕。

通过上面的分析，我们只需要对`getter`进行一些修改：

```js
get() {
  dep.push(watcher) // 新增
  return value
}
```

我们在模板编译函数中实例化`watcher`，`getter`中拿不到这个实例对象。解决方法：将`watcher实例`放入全局中，比如放到`window.target`上

~~~js
// watcher的get方法
get() {
    window.target = this
    const value = parsePath(this.data, this.expression)
    return value
}
~~~

> 注意不能写成`window.target = new Watcher()`因为执行到`getter`的时候，实例化`watcher`还没有完成，所以`window.target`还是`undefined`

然后将`getter`中的`dep.push(watcher)`修改为`dep.push(window.target)`



> **总结：依赖收集**
>
> 渲染页面碰到插值表达式，比如`v-bind`等需要数据的地方，会实例化`watcher`对象，`new watcher()`时候调用`constructor`中的`get`方法，`get`方法中将新建的watcher实例传递给`window.target`,访问数据时又触发了`getter`，将依赖该数据的watcher添加到`dep`数组中，从而完成了依赖收集。我们理解为watcher在收集依赖，而代码的实现方式是在数据中存储依赖自己的watcher

利用这种方法，每遇到一个插值表达式就会新建一个`watcher`，这样每个节点就会对应一个`watcher`。实际上这是`vue1.x`的做法，以节点为单位进行更新，粒度较细。而`vue2.x`的做法是每个组件对应一个`watcher`，实例化`watcher`时传入的也不再是一个`expression`，而是渲染函数，渲染函数由组件的模板转化而来，这样一个组件的`watcher`就能收集到自己的所有依赖，以组件为单位进行更新，是一种中等粒度的方式。要实现`vue2.x`的响应式系统涉及到很多其他的东西，比如组件化，虚拟`DOM`等

#### 派发更新

实现依赖收集后，最后要实现的功能是派发更新，也就是依赖发生变化后触发`watcher`的回调函数。在依赖收集时，获取数据，会触发这个数据的`getter`，说明`watcher`就依赖这个数据，当数据变化时候，在`setter`中派发更新并通知`watcher`。

~~~js
// setter中
set(newVal) {
    if (newVal === val) return
    value = newVal
    observe(newVal)
    dep.forEach(d => d.update) // update是watcher中的方法
}
~~~

### 优化代码

#### Dep类

可以将dep数组抽象成为一个类

~~~js
class Dep {
    constructor {
        this.subs = []
    }
	depend() {
        this.addSub(window.target)
    }
	notify() {
        const subs = [...this.subs]
        subs.forEach((s) => s.update())
    }
	addSub(sub) {
        this.subs.push(sub)
    }
}
~~~

`defineReactive`函数需要修改一下

~~~js
function defineReactive(data, key, value=data[key]) {
    const dep = new Dep()
    observe(value)
    Object.defineProperty(data, key, {
        get() {
            dep.depend()
            return value
        },
        set(newVal) {
            if (newVal === value) return
            value = newVal
            observe(newVal)
            dep.notify
        }
    })
}
~~~

#### update方法

`watcher`中的`update`方法

~~~js
update() {
    this.value = parsePath(this.data, this.expression)
    this.cb()
}

~~~

回顾一下`vm.$watch`方法，我们可以在定义的回调中访问`this`，并且该回调可以接收到监听数据的新值和旧值，因此做如下修改

```js
update() {
  const oldValue = this.value
  this.value = parsePath(this.data, this.expression)
  this.cb.call(this.data, this.value, oldValue)
}
```

### 学习Vue源码

在[Vue源码--56行](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fvuejs%2Fvue%2Fblob%2Fdev%2Fsrc%2Fcore%2Fobserver%2Fdep.js)中，我们会看到这样一个变量：`targetStack`，看起来好像和我们的`window.target`有点关系，没错，确实有关系。设想一个这样的场景：我们有两个嵌套的父子组件，渲染父组件时会新建一个父组件的`watcher`，渲染过程中发现还有子组件，就会开始渲染子组件，也会新建一个子组件的`watcher`。在我们的实现中，新建父组件`watcher`时，`window.target`会指向父组件`watcher`，之后新建子组件`watcher`，`window.target`将被子组件`watcher`覆盖，子组件渲染完毕，回到父组件`watcher`时，`window.target`变成了`null`，这就会出现问题，因此，我们用一个栈结构来保存`watcher`。

~~~js
const targetStack = []
function pushTarget(_target) {
    targetStack.push(window.target)
    window.target = _target
}
function popTarget() {
    window.target = targetStack.pop()
}
~~~

watcher的get方法也要修改

~~~js
get() {
    pushTarget(this) // 往栈中推入当前的watcher实例
    const value = parsePath(this.data, this.expression)
    popTarget() 
    return value
}
~~~

此外，`Vue`中使用`Dep.target`而不是`window.target`来保存当前的`watcher`，这一点影响不大，只要能保证有一个全局唯一的变量来保存当前的`watcher`即可.

### 总结代码

~~~js
// observe监测数据是否是对象
function observe(data) {
    if (typeof data ! == 'object') return 
    new Observer(data)
}

// Observer会将对象data的子元素响应式处理
class Observer {
    constructor(value) {
        this.value = value
        this.walk()
    }
    walk() {
        Object.keys(this.value).forEach((key) => {
            defineReactive(this.value, key)
        })
    }
}

// 数据劫持，使用了闭包可以保存value
function defineReactive(data, key, value=data[key]) {
    const dep = new Dep()
    observe(value)
    Object.defineProperty(data, key, {
        get: function reactiveGetter() {
            dep.depend()
            return value
        },
        set: function reactiveSetter(newValue) {
            if (newValue === value) return
            value = newValue
            observe(newValue)
            dep.notify()
        }
    })
}


// 依赖
class Dep {
    constructor() {
        this.subs = []
    }
    depend() {
        if (Dep.target) {
            this.addSub(Dep.target)
        }
    }
    notify() {
        const subs = [...this.subs]
        subs.forEach((s) => s.update())
    }
    addSub(sub) {
        this.subs.push(sub)
    }
}
Dep.target = null

const TargetStack = []
function pushTarget(_target) {
    TargetStack.push(Dep.target)
    Dep.target = _target
}
function popTarget() {
    Dep.target = TargetStack.pop()
}

// watcher
class Watcher {
    constructor(data, expression, cb) {
        this.data = data
        this.expression = expression
        this.cb = cb
        this.value = this.get()
    }
    get() {
        pushTarget(this)
        const value = parsePath(this.data, this.expression)
        popTarget()
    }
    update() {
        const oldValue = this.value
        this.value = parsePath(this.data, this.expression)
        this.cb.call(this.data, this.value, oldValue)
    }
}

// 工具函数
function parsePath(obj, expression) {
    const segments = expression.solit('.')
    for (let key of segments) {
        if (!obj) {
            obj = obj[key]
        }
    }
    return obj
}
~~~

1. 调用`observe(obj)`，将obj设置为响应式对象，`observe`函数，`Observe类`，`defineeactive`函数互相调用，递归地将obj设置为响应式对象
2. 渲染页面时，实例化`watcher`，这个过程为读取依赖数据的值，所以会触发`getter`，将依赖该数据的`watcher`对象添加到该数据的`dep`数组中
3. 依赖变化时触发了`setter`，派发更新，执行对该数据`dep`数组中所有`watcher`对象的回调函数

### 注意

#### 闭包

`defineReactive`中形成了闭包，这样每个对象的每个属性都能保存自己的值`value`和依赖对象`dep`

#### 只要触发getter就会收集依赖么

答案是否定的。在`Dep`的`depend`方法中，我们看到，只有`Dep.target`为真时才会添加依赖。比如在派发更新时会触发`watcher`的`update`方法，该方法也会触发`parsePath`来取值，但是此时的`Dep.target`为`null`，不会添加依赖。仔细观察可以发现，**只有`watcher`的`get`方法中会调用`pushTarget(this)`来对`Dep.target`赋值，其他时候`Dep.target`都是`null`，而`get`方法只会在实例化`watcher`的时候调用**，因此，在我们的实现中，**一个`watcher`的依赖在其实例化时就已经确定了，之后任何读取值的操作均不会增加依赖**。

## 双向数据绑定的原理

Vue采用**数据劫持**和**发布者-订阅者模式**分方法，通过`Object.defineProperty()`来劫持各个属性的setter、getter，在数据变动时发布消息给订阅者，触发相应的监听回调。

问题：

+ app.message修改数据，vue内部是如何监听message数据的改变
  + **Object.defineProperty => 监听对象属性的改变**
+ 当数据发生改变时，Vue如何知道要通知哪些人，界面发生刷新
  + **发布-订阅者模式**

以下是具体实现步骤：

1. 需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上setter和getter，给这个对象的某个值进行赋值，就会触发setter，那么就能监听到数据变化
2. compile解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知更新视图。	
3. Watcher订阅者是Observer和Compile之间的桥梁，主要做的事情有：①在自身实例化时往属性订阅器(dep)里面添加自己 ②自身必须有一个update()方法 ③待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。

4. MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听model中数据发生的变化，通过Compile解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220923193425900.png" alt="image-20220923193425900" style="zoom:33%;" />

## MVVM、MVC、MVP的区别

MVC、MVVM、MVP是三种常见的软件架构设计模式，主要通过分离关注点来组织代码架构，优化开发效率。

在开发单页面应用时，往往一个路由对应着一个脚本文件，所有的页面逻辑都在脚本文件里。页面的渲染，数据的获取，对用户事件的响应等所有逻辑都混合在一起，这样在开发简单项目时，可能还看不出问题，如果项目变得复杂，整个文件会变得冗长，这样对项目开发和后期维护非常不利。

### MVC

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220925105254659.png" alt="image-20220925105254659" style="zoom:33%;" />

Controller是MVC中的C，指控制层，在Controller层会接受用户的所有操作，并根据写好的代码进行相应的操作——触发Model层或者触发View层。

注意：Controller层触发View层，并不会更新View层中数据，View层中的数据是通过监听Model层数据变化而自动更新的，与Controller层无关

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220925133554479.png" alt="image-20220925133554479" style="zoom:33%;" />

MVC框架主要有两个缺点：

+ MVC框架大部分逻辑集中在Controller层，代码量也集中在Controller层，这带给 Controller 层很大的压力，而已经有独立处理事件能力的 View 层却没有用到。
+ Controller 层和 View 层之间是一一对应的，断绝了 View 层复用的可能，因而产生了很多冗余代码。

为了解决以上问题，MVP框架被提出

### MVP

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220925134021612.png" alt="image-20220925134021612" style="zoom:33%;" />

在MVC框架中，View层可以通过访问Model层来更新，但在MVP框架中，View层不能再直接访问Model层，必须通过Presenter层提供的接口，然后Presenter层再去访问Model层

**由于分离了Model层和View层，所以View层可以抽离出来做成组件，在复用性上比MVC模型好很多**

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220925135346275.png" alt="image-20220925135346275" style="zoom:33%;" />

View 层与 Model 层确实互不干涉，View 层也自由了很多。但还是有问题，因为 View 层和 Model 层都需经过 Presenter 层，致使 Presenter 层比较复杂，维护起来会有一定的问题。

而且因为**没有绑定数据**，**所有数据都需要 Presenter 层进行“手动同步”**，代码量比较大，虽然比 MVC 模型好很多，但也是有比较多的冗余部分。

为了让 View 层和 Model 的数据始终保持一致，避免同步，MVVM 框架出现了。

### MVVM

MVVM分为Model、View和ViewModel：

+ model代表数据模型，数据和业务逻辑都在Model层定义
+ View代表UI视图，负责数据的展示
+ ViewModel负责监听Model中数据的改变并且控制视图的更新，处理用户交互操作

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220923145247924.png" alt="image-20220923145247924" style="zoom:33%;" />

**Model和View并无直接关联，而是通过ViewModel来进行联系，Model和ViewModel之间存在双向数据绑定的联系。**因此当Model中的数据改变时会触发View层的刷新，View中由于用户交互操作而改变的数据也会在Model中同步。

**vue中的MVVM**

vue并没有完全遵循MVVM，但是收到了MVVM的启发

M（Model）模型：对应data中的数据

V（View）视图：模板template

VM（ViewModel）视图模型：Vue实例对象

1. 实现DOM监听
2. 实现数据绑定

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220925141033464.png" alt="image-20220925141033464" style="zoom:25%;" />

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220925141059504.png" alt="image-20220925141059504" style="zoom:25%;" />

MVVM本质上是MVC的改进版

模型model指的是后端传递的数据，视图view指的是所看到的页面。

视图模型viewModel是 mvvm 模式的核心，它是连接 view 和 model 的桥梁。它有两个方向：

+ 将模型转化成视图，即将后端传递的数据转化成所看到的页面。实现的方式是：数据绑定
+ 将视图转化成模型，即将所看到的页面转化成后端的数据。实现的方式是：DOM 事件监听

这两个方向都实现的，我们称之为**数据的双向绑定**







