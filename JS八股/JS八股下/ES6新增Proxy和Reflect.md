### 从Vue响应式引入Proxy

Vue3摒弃了`Object.defineProperty()`，采用`Proxy`实现响应式。

前者实现数据劫持时，需要**深度遍历属性做响应式处理**，并且针对**数组**要在代理原型上实现setter方法，使用`Object.defineProperty`只对初试对象中的属性有监听作用，**对新增的属性无效**（Vue2中新增属性要用`Vue.$set`设置），因此使用`Proxy`可以避免以上问题。
### 代理Proxy

`Proxy`用于给源对象增设一层代理对象，对代理对象的所有操作都会被捕获器捕获，并由捕获器决定是否映射到源对象（注意：直接操作源对象不会被捕获器捕获）

#### 换个方式理解Proxy

虚拟DOM是对真实DOM对象的一层抽象，因为直接操作真实DOM带来的负面影响大，所以在虚拟DOM对象上操作，然后DIFF算法会依赖这层抽象来决定是够更新真实DOM。

### Proxy的使用

#### Proxy构造函数

接受两个参数：源对象 和 处理对象，缺少任何一个参数都会抛出`TypeError`错误。

~~~js
const origin = {};
const handler = {};
const proxy = new Proxy(origin, handler)
~~~

注意：Proxy的显示原型是undefined，但是Proxy构造函数实例对象的隐式原型指向Object.prototype

~~~js
const origin = {};
const handler = {};
const proxy = new Proxy(origin, handler);
console.log(Proxy.prototype === undefined); // true
console.log(proxy.__proto__ === origin.__proto__); // true
console.log(proxy.__proto__ === Object.prototype); // true
~~~

#### 如何区分源对象和代理对象

**全等运算符**

~~~js
const origin = {}
const handler = {}

const proxy = new Proxy(origin, handler)

console.log(origin instanceof Object) // true
console.log(proxy instanceof Object) // true

// 使用全等运算符区分源对象与代理对象
console.log(origin === proxy) // false
~~~

### Proxy捕获器

#### get

通过`[]`,`.`,`Object.create`等操作对代理对象中的属性访问时，会触发`get`捕获器，接受三个参数：源对象、本次访问的属性、代理对象

~~~js
const origin = { name: '鲨鱼辣椒' }
const handler = {
    // get可以返回任意值
    get(origin, property, proxy) {
        console.log('origin:', origin)
        console.log('property:', property)
        console.log('proxy:', proxy)
        // 但是要注意，如果你返回了proxy[property]，那就会造成无限递归
        // 因为get一直在被调用
        return origin[property]
    }
}

const proxy = new Proxy(origin, handler)
console.log(proxy.name)
// origin: {name: '鲨鱼辣椒'}
// property: name
// proxy: Proxy {name: '鲨鱼辣椒'}
// 鲨鱼辣椒
~~~

也可以在get中增加一些限制条件，来决定返回的值

~~~js
const origin = { name: '鲨鱼辣椒' }
const handler = {
    get(origin, property, proxy) {
        const v = origin[property]
        return v === '鲨鱼辣椒' ? effect() : v
    }
}
const effect = () => {
    // do something
    return '蜘蛛侦探'
}

const proxy = new Proxy(origin, handler)

console.log(proxy.name) // 蜘蛛侦探
~~~

#### set

修改对象属性时被触发，接受四个参数：要修改属性的对象，要修改的属性，新的属性值，代理对象。

注意：如果源对象中某个属性`unwritable`**且**`unconfigurable`，那么set捕获器不能修改他的值，只能返回相同值，否则会TypeError。

~~~js
const origin = { name: '鲨鱼辣椒' }
Object.defineProperty(origin, 'age', {
    value: 38,
    writable: false,
    configurable: false,
    enumerable: true
})
const handler = {
	set(origin, property, value, proxy) {
        console.log(`${property}被修改为${value}`)
        origin[property] = value
    }
}

const proxy = new Proxy(origin, handler)
proxy.age = 42; // age被修改为42
console.log(origin.age) // 38
~~~

#### has

has捕获器会在`in`检查一个对象中是否包含某个属性时触发，收到两个参数：要检查的对象 和 要检查的属性

注意：虽然`for...in`也用到了`in`操作符，但`has`却不会捕获`for...in`的操作

```js
const origin = { name: '鲨鱼辣椒' }
const handler = {
    has() {
        console.log('has被触发了') // 只会输出一次
    }
}

const proxy = new Proxy(origin, handler)

name in proxy // has被触发了
for (const name in proxy) { } 
```

> 还有其他捕获器比如：
>
> + apply(target, context, argumentsList) {} 拦截函数调用
> + constructor(target, argumentsList, newTarget) {} 拦截new操作符
> + deleteProperty(target, property) {} 拦截对象属性的删除操作

### 多层代理

可以给源对象创建多层代理，也就是为源对象添加多个处理对象。

~~~Js
const origin = { name: '鲨鱼辣椒' }
const handler = descriptor => ({
    get(origin, property) {
        console.log(descriptor)
        return origin[property]
    }
})

const firstProxy = new Proxy(origin, handler('你正在访问第一层代理'))
const secondProxy = new Proxy(firstProxy, handler('你正在访问第二层代理'))

console.log(secondProxy.name) // 鲨鱼辣椒
~~~

### 反向代理

根据JS中的`原型链`机制，让**代理对象成为兜底对象**。

~~~js
const origin = {
    sayName(name) {
        return name
    }
}
const handler = {
    get(origin, property, proxy) {
        return effect
    }
}

// 兜底
const effect = function (name) {
    return name
}
const proxy = new Proxy({}, handler)

// 使Proxy的实例作为其它对象的原型对象
origin.__proto__ = proxy

console.log(origin.sayName('鲨鱼辣椒')) // 鲨鱼辣椒
console.log(origin.sayAge(25)) // 25
~~~

调用`sayName`，origin本身就有，直接调用

调用`sayAge`，origin本身没有，于是顺着原型链查找，而`origin.prototype`是`proxy`，相当于访问了`proxy.sayAge`，虽然proxy没有这个方法，但是会调用`get`捕获器，返回`effect`函数，传参25，最后调用返回。

此时的代理对象proxy就是我们的兜底对象

### 撤销代理

`Proxy.revocable`用于撤销代理对象和源对象之间的关联。该方法会返回一个对象，返回的这个对象中包含代理对象`proxy`与撤销函数`revoke`，需要注意的是，`revoke`无论调用多少次，其结果总是相同，但如果在调用之后还试图访问代理对象中的属性，则会抛出`TypeError`。撤销代理之后不会对源对象造成任何负面影响

~~~js
const origin = { name: '鲨鱼辣椒' }
const handler = {
    get(origin, property) {
        return origin[property]
    }
}

const { proxy, revoke } = Proxy.revocable(origin, handler)

console.log(origin.name) // 鲨鱼辣椒
console.log(proxy.name) // 鲨鱼辣椒

// 撤销代理
revoke()
console.log(origin.name) // 鲨鱼辣椒
console.log(proxy.name) // TypeError(触发了捕获器，所以返回TypeError)
~~~

> 撤销代理一个可能的应用场景是，假设你有一个很重要的`global`对象，里面存储了各式各样的`API`，现在你只想把这个对象暴露出去，那每位用户便都拥有了访问和自定义global对象内容的权力，但如果你只想让用户访问，而不给予它们修改的权力，此时你便可以使用`撤销代理`了，当`global`被替换或者里面的数据发生改变时，我们就可以撤销代理，当用户再次访问或试图修改数据时会抛出一个`TypeError`，用户就可以根据当前错误来清楚的知道我们的本意并做出相应的操作

### Proxy具体应用

#### 监听属性

利用get、set、has等捕获器监听对象属性的读写、修改、删除等操作

#### 隐藏属性

不借助`Symbol`来实现"曲线"隐藏属性

~~~js
const origin = { name: '鲨鱼辣椒', age: 25 }
const handler = {
    get(origin, property) {
        return property === 'age' ? undefined : origin[property]
    }
}

const proxy = new Proxy(origin, handler)

console.log(proxy.name) // 鲨鱼辣椒
console.log(proxy.age) // undefined
~~~

### 属性验证

在捕获器中对每次修改的属性进行验证

~~~js
const origin = { name: '鲨鱼辣椒', age: 25 }
const handler = {
    set(origin, property, value) {
        if (property !== 'age') return origin[proerpty] = value
        if (value >= 30) return false
        return origin[property] = value
    }
}

const proxy = new Proxy(origin, handler)
proxy.name = '蜻蜓队长'
proxy.age = 18
console.log(proxy.name) // 蜻蜓队长
console.log(proxy.age) // 18
proxy.age = 31
console.log(proxy.age) // 18
~~~

### 代理存在的问题

this指向问题

~~~js
const origin = {
    name: '鲨鱼辣椒',
    say() {
        // 两次的this并不相同
        return this
    }}
const handler = {}

const proxy = new Proxy(origin, handler)

console.log(origin.say()) // {name: '鲨鱼辣椒', say: ƒ}
console.log(proxy.say()) // Proxy {name: '鲨鱼辣椒', say: ƒ}
~~~

还有一个特殊的例子就是`Date`类型了。根据ECMAScript规范，Date类型方法的执行依赖于`this`上的内部槽位`[[ NumberDate ]]`，但代理对象毫无疑问是不存在这个槽位的，所以在使用代理对象访问`Date`类上的方法时会抛出`TypeError`

```js
const origin = new Date()
const handler = {}

const proxy = new Proxy(origin, handler)

console.log(proxy.getDate()) // TypeError
```

### 反射Reflect

`Object.defineProperty`在对一个不可写且不可配置的属性进行`getter`或`setter`时会抛出`TypeError`，通常我们需要使用`try catch`去捕获这个错误

~~~js
const obj = { name: '鲨鱼辣椒' }
Object.defineProperty(obj, 'age', {
    value: 25,
    writable: false,
    configurable: false,
    get() {
        return obj['age']
    }
})
console.log(obj.age) // TypeError
~~~

但使用`Reflect.defineProperty`则不会，而是会返回`false`来代表此次操作失败

~~~js
const obj = { name: '鲨鱼辣椒' }
Object.defineProperty(obj, 'age', {
    value: 25,
    writable: false,
    configurable: false
})
console.log(obj.age) // 25
console.log(Reflect.defineProperty(obj, 'age', {
    get() { return }
})) // false
console.log(obj.age) // 25
~~~

#### Reflect常用方法

**get**

~~~js
const obj = { name: '鲨鱼辣椒' }
console.log(Reflect.get(obj, 'name')) // 鲨鱼辣椒
~~~

**set**

该方法的返回值为`true`或`false`，`true`代表本次操作成功，`false`代表失败；操作成功是指对于那些可写且可配置的属性。要注意的是，当操作失败时，在严格模式下会抛出`TypeError`。

~~~js
const obj = { name: '鲨鱼辣椒' }
Object.defineProperty(obj, 'age', {
    value: 25,
    writable: false,
    configurable: false
})
console.log(obj.age) // 25
console.log(Reflect.set(obj, 'age', 26)) // false
console.log(obj.age) // 25
~~~

**has**

检查一个对象中是否包含(继承)某个属性，相当于`in`操作符。

~~~js
const origin = {age: 25}
const obj = { name: '鲨鱼辣椒' }
obj.__proto__ = origin
console.log('age' in obj) // true
console.log(Reflect.has(obj,'age')) // true
~~~

**defineProperty**

用法基本同`Reflect.set`一致

~~~js
const obj = { name: '鲨鱼辣椒' }
Object.defineProperty(obj, 'age', {
    value: 25,
    writable: false,
    configurable: false
})
console.log(obj.age) // 25
console.log(Reflect.defineProperty(obj, 'age', {
    get() { return }
})) // false
console.log(obj.age) // 25
~~~

**deleteProperty**

返回一个`布尔值`，代表是否删除成功，删除成功是指对于那些可写且可配置的属性

~~~js
const obj = { name: '鲨鱼辣椒' }
Object.defineProperty(obj, 'age', {
    value: 25,
    writable: false,
    configurable: false
})
console.log(Reflect.deleteProperty(obj, 'name')) // true
console.log(Reflect.deleteProperty(obj, 'age')) // false
~~~

**ownKeys**

接收一个对象作为参数，并将该对象中`自有属性`、`符号值`、`不可枚举属性`作为数组返回，该数组中的每个成员都是字符串或符号值

~~~js
const origin = { bigName: 'SYLJ' }
const obj = {
    name: '鲨鱼辣椒',
    [Symbol.for('age')]: 25,
}
obj.__proto__ = origin
Object.defineProperty(obj, 'gender', {
    value: '男',
    writable: false,
    configurable: false,
    enumerable: false
})
console.log(Reflect.ownKeys(obj)) // ['name', 'gender', Symbol(age)]
~~~

