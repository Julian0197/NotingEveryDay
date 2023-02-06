# JS基础

## 1.手写Object.create

**`Object.create()`** 方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype），也就是说返回的是一个实例。

~~~js
function create(obj) {
    function F() {}
    F.prototype = obj
    return new F()
}
~~~

## 2.手写instanceof

`instanceof` 运算符用于判断构造函数的 prototype 属性是否出现在对象的原型链中的任何位置。

1. 获取类型的原型
2. 获取对象的原型
3. 循环判断对象的隐式原型是否等于类型的显示原型，直到原型链的终点`null`

~~~js
function instanceof(left, right) {
    // null 和基本类型数据返回false，typeof null = Object，所以要单独区分
    if (left === null || typeof left ! == 'object') return false
    let proto = left.__proto__,
    	prototype = right.prototype
    while（proto) {
        if (proto === prototype) return true
        proto = proto.__proto__
    }
    return false
}
~~~

## 3.手写new

new做了什么？

- 创建一个新的对象
- 继承父类原型上的方法.
- 添加父类的属性到新的对象上并初始化(this指向新的对象），保存方法的执行结果。
- 判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象。(返回基本数据类型时返回值会被忽略)

~~~js
function _new() {
    // 取出第一个参数
    let constructor = Array.prototype.shift.call(arguments)
    // 判断参数是否是一个函数
    if (typeof constructor ! == 'function') {
        console.error("type error")
        return 
    }
    // 新建一个空对象，对象的原型为构造函数的prototype
    let newObj = Object.create(constructor.prototype)
    // this指向新对象，并执行函数
    let result = constructor.apply(newObj, argumemts)
    // 判断返回结果
    let flag = result && (typeof result === 'object' || typeof result === 'function')
    return flag ? result : newObj
}
~~~

上一种方式使用`Object.create`创建新对象

~~~js
function _new() {
    let constructor = Array.prototype.shift.call(arguments)
    if (typeof constructor ! == 'function') {
		console.error("type error")
        return 
    }
    let newObj = {}
    newObj.__proto__ = constructor.prototype
    let result = constructor.apply(newObj, arguments)
    return result instanceof Object ? result : newObj
}
~~~

## 4.手写防抖函数

防抖：**指定时间内只会执行一次任务**，如果在等待过程中再一次触发事件，定时器重新计时，直到到达了指定时间再去执行回调。（输入框时时搜索）

~~~js
function debounce(callback, delay) {
    let timer = null // 在return的函数中对timer实现了闭包
    return function() {
        // 不写也没关系，箭头函数中的this会向上查找
        let context = this,
            arg = arguments
        if(timer) {
            cleatTimeout(timer)
        }
        timer = setTimeut(() => {
            callback.apply(context, args)
        }, delay)
    } 
}	
~~~

总结：

+ timer不能放在内部函数中，因为每次触发事件，调用函数，都会创建一个新的函数作用域内的timer 变量，每次操作的timer不一样
+ 将变量timer定义为全局变量也可以达到防抖的目的，但是闭包有2个优势：
  + 不用担心全局变量污染问题
  + 多次调用，相互不影响。如果声明全局变量，每次声明需要不同的名字。

## 5.手写节流函数

节流：**控制事件执行的时间间隔**，在函数需要频繁触发时，函数执行一次后，只有在大于这个时间间隔才会执行第二次。（窗口跳转，页面滚动，登录发送短信）

**注意：**

+ 返回函数使用闭包，闭包会在内存中永久保存，pre始终是上次运行后的结果
+ 修改this始终让函数指向绑定事件的DOM元素

~~~js
// 当绑定事件后，throttle事件立即执行，所以this指向dom1
dom1.addEventListener('scroll', throttle(()=>{}, 500))

function throttle(callback, delay) {
    let pre = Date.now()
    return function(event) {
        const now = Date.now()
        if ((now - pre) > delay) {
            // callback默认this指向window，要修改为指向dom
            callback.call(this,event)
            pre = now
        }
    }
}
~~~

## 6.手写call

1. 先判断调用对象是否是函数，即使定义在函数的原型上，但是可能出现使用call等方式的调用
2. 判断上下文对象是否存在，如果不存在设置window
3. 处理传入的参数，截取第一个参数后的所有参数
4. 将函数作为上下文对象的一个属性
5. 使用上下文对象来调用这个方法，并保存返回的结果
6. 删除刚才新增的属性
7. 返回结果

context是要绑定的对象，this是调用的函数

~~~js
Function.prototype._call = function(context) {
    if (typeof this ! == "function") {
        conole.log("type error")
        return
    }
    // 获取参数，第0个参数是context
    let args = [...arguments].slice(1),
        result = null
    // 如果没传入context，设置为windows
    context = context || window
    // 将调用函数设置成对象的方法
    context.fn = this
    // 调用函数
    result = context.fn(...args)
    // 将属性删除
    delete context.fn
    return result
    
}
~~~

## 7.手写apply

1. 判断对象是否是函数
2. 判断传入函数是否存在上下文对象，如果没有，设置成window
3. 将函数作为上下文对象的一个属性
4. 判断参数值是否传入
5. 使用上下文对象调用这个方法，并保存返回结果
6. 删除新增的属性
7. 返回结果

~~~js
Function.prototype._apply = function(context) {
    if (this ! == "function") {
		throw new TypeError("Error");
    }
    let reult = null
    context = context || window
    context.fn = this
    if (arguments[1]) {
        result = context.fn(...arguments[1])
    } else {
        result = context.fn()
    }
    delete context.fn
    return result
}
~~~

## 8.手写bind

bind()方法**创建一个新的函数**, 当被调用时，将其this关键字设置为提供的值，在调用新函数时，在任何提供之前提供一个给定的参数序列。

~~~js
var a ={
    name : "Cherry",
    fn : function (a,b) {
        console.log( a + b)
    }
}

var b = a.fn;
b.bind(a,1,2)  // 没有输出
b.bind(a,1,2)()// 3 需要手动调用
~~~

1. 判断调用对象是否为函数
2. 保存当前函数的引用，获取其余传入的参数
3. 创建一个函数返回
4. 函数内部使用apply绑定函数调用，**需要判断函数作为构造函数的情况，这个时候需要传入当前函数的 this 给 apply 调用**，其余情况都传入指定的上下文对象。
5. 返回的构造函数需要有原函数的prototype，而且必须保证修改返回函数的prototype，原函数的属性方法不会改变，因此要深拷贝

~~~js
Function.prototype._bind = function(context) {
    // 先判断this是不是函数
    if (typeof this ! == "function") {
        throw new TypeError("Error")；
    }
    // args是obj之后的参数
    let args = [...arguments].slice(1);
    let fn = this;
    let Fn = function() {
        // newArgs是当用new调用bind函数时传入的参数
        let newArgs = [...arguments]；
        // 如果当前this是构造函数Fn的实例对象，说明他是new出来的，此时要修改this指向实例对象而不是先前传入的context，并需要合并之前bind的参数+new的参数
        return fn.apply(this instanceof Fn ? this : context, args.concat(newArgs))
    }
    // Fn若作为构造函数，必须拥有原函数的prototype，但如果直接Fn.prototype = this.prototype再return Fn的话，是浅拷贝;
    
    // 使用一个空对象进行中转，为了避免在修改Fn原型时也把绑定的函数原型一起被修改。
    let temp = function(){};
    if (this.prototype) {

        temp.pototype = this.prototype
    }
	// temp的实例继承原函数的所有属性方法, 并使Fn.prototype指向temp的实例, 
    // 这样可以使Fn.prototype的修改影响不到原函数的属性方法.
    Fn.prototype = new temp()
    return Fn
}
~~~

## 9. 手写软绑定

使用硬绑定之后就**无法使用隐式绑定或者显式绑定**来修改`this`

让this在默认情况指向指定的一个对象（硬绑定也有的功能），同时又保留了隐式绑定和显式绑定之后可以修改this指向的能力

~~~js
Function.prototyp.softBind = function(obj) {
    let fn = this
    let curried = Array.slice.call(arguments, 1)
    let bound = function() {
        // this绑定到全局对象或者undefined，那就把指定的obj绑定给他，否则不会修改this
        return fn.apply(
        	!this || this === (window || global) ? obj : this,
            curried.concat(arguments)
        )
    }
    bound.prototype = Object.create(fn.prototype)
    return bound
}
~~~

## 10.手写类型判断

借助`Object.prototype.toString`可以返回**对象内部属性**，内部属性在JS中主要用来变向获取数据类型

~~~js
function getType(value) {
    if (typeof value === 'object') {
        let valueClass = Object.prototype.toString.call(value) // [object Class]
        let type = valueClass.split(' ')[1].split('')
        type.pop() // 去除最后的]
        return type.join("").toLowerCase()
    } else {
        return typeof value
    }
}
~~~

`[object Class]`也可以用正则表达式获取，`String.prototype.match()`方法返回一个数组，其中包含与正则表达式相匹配的结果。如果没有找到任何匹配，则返回 `null`。

如果找到了匹配，数组中的第一个元素将是完整的匹配字符串，后续元素将是匹配正则表达式中的捕获组（如果有的话）。每个捕获组的结果将作为数组的一个独立元素。

~~~python
let str = "The quick brown fox";
let result = str.match(/quick (brown) fox/);
console.log(result);
// Output: [ "quick brown fox", "brown", index: 4, input: "The quick brown fox" ]
~~~

数组的第一个元素 `result[0]` 表示完整的匹配字符串（"quick brown fox"）。第二个元素 `result[1]` 表示第一个捕获组的匹配字符串（"brown"）。第三个元素 `result[2]` 表示完整匹配字符串在输入字符串中的起始位置（4），第四个元素 `result[3]` 表示输入字符串本身（"The quick brown fox"）。

~~~js
function getType(value) {
  if (typeof value === 'object') {
    let valueClass = Object.prototype.toString.call(value) 
    // 匹配[object class]中的class字符串
    return valueClass.match(/\[object (.*)\]/)[1].toLowerCase()
  } else {
    return typeof value
  }
}
~~~

## 11.函数柯里化的实现

函数柯里化指的是一种将**使用多个参数的一个函数**转换成一系列**使用一个参数的函数**的技术。

~~~js
function add(a, b) {
    return a + b;
}

// 执行 add 函数，一次传入两个参数即可
add(1, 2) // 3

// 假设有一个 curry 函数可以做到柯里化
var addCurry = curry(add);
addCurry(1)(2) // 3
~~~

实现：

~~~js
function curry(fn, args) {
    // 获取原函数需要的参数长度
    let length = fn.length;
    args = args || [];
    return function() {
        // 拿到已经传入的参数
        let subArgs = args.slice(0)
        // 拼接得到现有的所有参数
        for (let i = 0; i < arguments.length; i++) {
            subArgs.push(arguments[i])
        }
        // 判断现在参数个数是否已经满足函数所需参数的需要
        if (subArgs.length > = length) {
            return fn.apply(this, subArgs)
        } else {
            // 参数不够，递归返回柯里化函数，等待参数传够
            // 注意这里也是call，subArgs是一个数组，curry的第二个参数就是一个数组，而fn接受的是一个个参数
            return curry.call(this, fn, subArgs)
        }
    }
}
~~~

**ES6实现**

~~~Js
function curry(fn, ...args) {
  return fn.length <= args.length ? fn(...args) : curry.bind(null, fn, ...args);
}
~~~



**当参数长度不固定**

~~~js
function add (...args) {
    //求和
    return args.reduce((a, b) => a + b)
}

function curry(fn) {
    let args = [];
    return function temp(...newArgs) {
        if (newArgs) {
            // 闭包
            args = [
                ...args,
                ...newArgs
            ]
            return temp
        } else {
            let val = fn.apply(this, args);
            args = []; // 保证再次调用时清空
            return val;
            
        }
    }
    
}
~~~



## 10.实现浅拷贝

浅拷贝指：一个新的对象对原始对象的属性值精确拷贝，如果原始对象是基本数据类型，拷贝的就是基本数据类型的值；如果原始对象是引用数据类型，拷贝的就是内存地址。如果浅拷贝内存地址所指向的那个值发生改变，那么源对象和拷贝对象中的数据都会发生改变。

1. **`Object.assign()`**

ES6中的拷贝方法，第一个参数是目标对象，第二个参数是源对象。

**注意：**

- 如果目标对象和源对象有同名属性，或者多个源对象有同名属性，则后面的属性会覆盖前面的属性。

- 如果该函数只有一个参数，当参数为对象时，直接返回该对象；当参数不是对象时，会先将参数转为对象然后返回。

- 因为`null` 和 `undefined` 不能转化为对象，所以第一个参数不能为`null`或 `undefined`，会报错。

  ~~~js
  let target = {a: 1};
  let object2 = {b: 2};
  let object3 = {c: 3};
  Object.assign(target,object2,object3);  
  console.log(target);  // {a: 1, b: 2, c: 3}
  ~~~

2. **扩展运算符**

使用扩展运算符可以在构造字面量对象时，进行属性的拷贝，语法：`let cloneObj = { ...obj };`

~~~js
let obj1 = {a:1,b:{c:1}}
let obj2 = {...obj1};
obj1.a = 2;
console.log(obj1); //{a:2,b:{c:1}}
console.log(obj2); //{a:1,b:{c:1}}
obj1.b.c = 2;
console.log(obj1); //{a:2,b:{c:2}}
console.log(obj2); //{a:1,b:{c:2}}
~~~

2. **数组原型方法实现浅拷贝**

   1. **`Array.prototype.slice`**

   `slice()`方法是JavaScript数组的一个方法，这个方法可以从已有数组中返回选定的元素：用法：`array.slice(start, end)`，该方法不会改变原始数组。

   该方法有两个参数，两个参数都可选，如果两个参数都不写，就可以实现一个数组的浅拷贝。

   ~~~js
   let arr = [1,2,3,4];
   console.log(arr.slice()); // [1,2,3,4]
   console.log(arr.slice() === arr); //false (内存地址不一样)
   ~~~

   2. **`Array.prototype.concat`**

   - `concat()` 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
   - 该方法有两个参数，两个参数都可选，如果两个参数都不写，就可以实现一个数组的浅拷贝。

   ~~~js
   let arr = [1,2,3,4];
   console.log(arr.concat()); // [1,2,3,4]
   console.log(arr.concat() === arr); //false
   ~~~

3. **手写浅拷贝**

   ~~~js
   function shallowCopy(object) {
       // 只拷贝对象
       if (!object || typeof object ! == "object") return 
       
       // 判断传入的object是数组还是对象
       let newObj = Array.isArray(object) ? [] : {}
       
       // 遍历object，并且判断key是object自身的属性而不是由原型链继承的，就拷贝
       for (let key in object) {
           if (object.hasOwnProperty(key)) {
               newObj[key] = object[key];
           }
       } 
       return newObj
   }
   ~~~

## 11.实现深拷贝

回顾浅拷贝：将一个对象的值复制给另一个对象，如果值是引用类型，会将这个引用类型的地址复制给对象，因此两个对象会有同一个引用类型的引用。浅拷贝可以通过扩展运算符，Object.assign还有数组的slice和concat方法实现。

**深拷贝：**当遇到引用类型数据，会新建一个引用类型并将对应的值复制给它，因此对象获得的是一个新的引用类型，而不是一个原有类型的引用。

1. **`JSON.stringify()`**

+ `JSON.parse(JSON.stringify(obj))`，先利用`JSOS.stringify`将js对象序列化（JSON字符串），再使用`JSON.parse`反序列化还原为js对象
+ 这个方法可以简单粗暴地实现深拷贝，但是拷贝的对象中如果存在`函数`、`undefined`、`symbol`，当使用`JSON.stringify()`进行处理后都会消失

~~~js
let obj1 = {  a: 0,
              b: {
                 c: 0
                 }
            };
let obj2 = JSON.parse(JSON.stringify(obj1));
obj1.a = 1;
obj1.b.c = 1;
console.log(obj1); // {a: 1, b: {c: 1}}
console.log(obj2); // {a: 0, b: {c: 0}}
~~~

2. **函数库`lodash`的`_.clooeDeep方法`**

~~~js
var _ = require('lodash')
var obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
var obj2 = _.cloneDeep(obj1);
console.log(obj1.b.f === obj2.b.f);// false
~~~

3. **手写深拷贝**

~~~js
// target为要深拷贝的对象，map存储已经克隆过的对象
function deepClone(target, map= new weakMap()) {
    // 先判断target是否是引用类型数据，是的话就循环遍历所有元素
    if (typeof target === "object") {
        // 再判断是否已经克隆过了，如果克隆过直接返回结果
        if (map.get(target)) {
            return map.get(target)
        }
        // 没有克隆过，克隆后再存放克隆结果
        // 判断target是对象还是数组
        let isArray = Array.isArray(target)
        const result = isArray ? [] : {}
        map.set(target, result)
        if (isArray) { // target是数组
            target.forEach((item, index) => {
                result[index] = deepClone(item, map)
            })
        } else { // target是对象
            Object.keys(target).forEach((key, index) => {
                result[key] = deepClone(target[key], map)
            })
        }
        return result
    } else { // 基础数据类型，就直接返回
        return target
    }
}]
~~~

WeakMap 中使用一个**对象作为键**。**引用对象为弱引用，没有其他对这个对象的引用 —— 该对象将会被从内存（和map）中自动清除**；强引用当其他对象存在对该对象的引用时，则需要手动删除该对象才行。

- 此外特别说明：WeakMap 和 Map 的很重要的不同点就是，WeakMap 的键必须是对象，不能是原始值。

WeakMap 不支持迭代以及 keys()，values() 和 entries() 方法。所以没有办法获取 WeakMap 的所有键或值。

WeakMap 的主要优点是它们对对象是弱引用，被它们引用的对象很容易地被垃圾收集器移除。但这是以不支持一些对象方法为代价换来的

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221112141836131.png" alt="image-20221112141836131" style="zoom: 33%;" />

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20221112141901007.png" alt="image-20221112141901007" style="zoom:35%;" />
