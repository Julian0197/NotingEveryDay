#### 响应式

响应式数据reactive或者ref，都会包裹一层代理对象，在get时候出发track收集依赖，在set时触发trigger将依赖库中的依赖函数拿出来一个个执行。Proxy代理对象是针对对象，所以有一个targetMap存储所有响应式对象，对应的值是对象的属性，每个对象的属性又是一个Set库，里面放着依赖函数（唯一，避免重复触发）。

所有用到响应式对象的函数都会被包裹成effect类，在effect类中将当前函数计为activeEffect，track收集依赖拿到的就是当前的activeEffect。然后会调用run函数再执行传过来的fn，执行的时候会触发getter收集依赖。

~~~js
let activeEffect
class ReactiveEffect {
    private _fn
    constructor(fn) {
        this._fn = fn
    }
    run() {
        activeEffect = this
        this._fn()
    }
}

const targetMap = new Map()
export function track(target, key) {
    // target => key => dep
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
    }
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    dep.add(activeEffect)
}

export function trigger(target, key) {
    if(!activeEffect) return
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    for (const effect of dep) {
        effect.run()
    }
}

export function effect(fn) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}
~~~

~~~js
function reactive(obj) {
    return new Proxy(obj, {
        get(target, key, reveiver) {
            tarck(target, key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, newVal, receiver) {
      		// 触发依赖
      		trigger(target, key)
      		Reflect.set(target, key, newVal, receiver)
    	}
    })
}
~~~

##### computed

内部将传入的函数包裹为effect，第一次使用，缓存为false，触发getter，将缓存变为true，下一次拿数据，根据缓存的值直接拿缓存。改变数据后，setter进行处理，利用scheduler调度器函数，不触发依赖而是将缓存清空，这样下次再用到数据会重新调getter。

#### 渲染，vnode

createApp（App）将vue组件挂载到真实的DOM元素上（mount）

mount函数会先生成根组件vnode，再交给render函数，patch函数是render函数的入口

patch函数中会根据传入的vnode类型是component还是element还是text等做不同处理

如果是component，会执行拆解组件，生成一个组件实例，将setup的返回值给组件实例，setup中也会处理父传子的属性或者插槽，最后处理vnode中的render函数（实际是template要转化一下），render产生的是虚拟节点，接下来递归调用patch继续处理

如果是element，渲染element节点其实是对真实dom节点进行操作，通过document.createElement(vnode.type)创建元素，setAttribute添加属性，container。append添加到dom容器，当然我们的element会有children，也会递归调用patch对children  vnode做处理

