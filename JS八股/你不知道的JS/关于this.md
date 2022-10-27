# 二 关于this

## 1 为什么要用this

简单总结：`this`提供了一种更优雅的方式来隐式传递一个对象引用。可以将代码设计的更加简洁且容易复用。

## 2 关于this的误解

### 2.1 this不是指向函数自身

从函数内部引用自身，不能用this，必须需要具名函数的词法标示量来引用它。

~~~js
function foo() {
    foo.count = 1
}

setTimeout(function() {
    // 匿名函数无法指向自身
}, 10)
~~~

### 2.2 this不指向函数的词法作用域

this任何情况下都不指向函数的词法作用域，取决于函数在哪里被调用。

当一个函数被调用，会创建一个**执行上下文**，执行上下文包含函数在哪里被调用==调用栈==，函数的==调用方式==，传入的==参数==等信息，this就是这个上下文的一个属性，会在函数执行的过程中用到。

## 3 调用栈和调用位置

~~~js
function fun1() {
  // 当前调用栈：fun1
  // 当前调用位置：全局作用域
  console.log("fun1");
  fun2(); // fun2的调用位置：fun1
}

function fun2() {
  // 当前调用栈是 fun1 -> fun2
  // 当前调用位置：fun1
  console.log("fun2");
  fun3();
}

function fun3() {
  // 当前调用栈是 fun1 -> fun2 -> fun3
  // 当前调用位置：fun2
  console.log("fun3");
}

fun1(); // fun1的调用位置：全局作用域
~~~

在fun3的第一行打一个断点，通过调试工具可以看到当前的调用堆栈和 this 的值

![image-20220913182617748](C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220913182617748.png)

## 4 this的绑定规则

必须先确定函数的调用位置，再判断使用一下哪一项规则。

`调用位置：`

先分析**调用栈（为了达到当前执行位置所调用的所有函数）**，调用位置就是**当前正在执行函数的前一个调用中**

### 4.1 默认绑定

> **独立函数调用，无法应用其他规则时的默认规则**

函数调用时应用了this的默认绑定，因此this指向全局对象（node：global，浏览器：window）

~~~js
function foo() {
  console.log(this);
  console.log(this.a);
}
var a = 2

foo(); 
// Window
// 2
~~~

如果使用`严格模式`，则不能将全局对象用于默认绑定，this 会绑定到 **undefined**

~~~js
function foo() {
    'use strict'
    cosole.log(this)
}

foo() // undefined
~~~

### 4.2 隐式绑定

> **当函数引用有上下文对象，隐式绑定规则会把函数调用中的this绑定到这个上下文对象**

~~~js
function foo() {
  console.log(this);
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo,
};

obj.foo(); 
~~~

> 对象属性引用链中只有上一层或者说最后一层在调用位置中起作用。

~~~js
function foo() {
  console.log(this);
  console.log(this.a);
}

var obj2 = {
  a: 42,
  foo: foo,
};

var obj1 = {
  a: 2,
  obj2: obj2,
};

obj1.obj2.foo(); //42
~~~

#### 4.2.1 隐式丢失

**1.函数别名**

虽然`fun2`是`obj.fun1`的一个引用，但是实际上，它引用的是`fun1`**函数本身**，因此下面调用的`fun2()`其实是一个不带任何修饰的函数调用，因此应用了**默认绑定**。

~~~js
function fun1() {
  console.log(this);
  console.log(this.a);
}

var obj = {
  a: "局部参数",
  fun1: fun1,
};

var fun2 = obj.fun1; // 函数别名

var a = "全局参数";

obj.fun1(); // 局部参数
fun2(); // 全局参数 【所以说this是在调用时绑定的，不是在定义的时候绑定的】
~~~

**2.参数传递函数**

参数传递其实就是一种**隐式赋值**，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样。

~~~js
function fun1() {
  console.log(this);
  console.log(this.a);
}

function fun2(fn) {
  // obj.fun1传进来的是引用值，实际上就是fun1
  fn(); // 直接调用，指向window
}

var obj = {
  a: "局部参数",
  fun1: fun1,
};

var a = "全局参数";

fun2(obj.fun1); // 全局参数
~~~

这也就解释了为什么使用JavaScript环境中内置的setTimeout()函数中回调的`this`指向的是全局对象了 在回调函数中丢失`this`是非常常见的现象

~~~js
function setTimeout(fn, delay) {
	// 等待dealy毫秒
	fn(); // 调用位置 【obj.fun1是引用值，传进来的就是fun1，直接调用，this指向window】
}
setTimeout(obj.fun1, 100) // '全局对象'
~~~

**3.事件处理器**

还有一种情况`this`的行为会出乎我们意料：调用回调函数的函数可能会修改`this`。 在一些流行的**JavaScript库**中事件处理器常会把回调函数的this强制绑定到触发事件的**DOM元素**上。

### 4.3 显示绑定

在Function的原型对象上有三个方法`apply`、`call`、`bind`可以显式的改变this的指向

**显式绑定仍然无法解决我们之前提出的丢失绑定问题**

这是因为**显式绑定**，会**立即执行**这个函数，回调函数中函数的执行时间是不确定的，所有我们需要**提前将this绑定到指定的对象上**，在**需要的时候调用**回调函数时，this是明确的。

显式强制绑定（**硬绑定**）就是解决这个问题的

#### 4.3.1 硬绑定

创建函数`fun2()`，并在它的内部手动调用了`fun1.call(obj)`，因此**强制**把`fun1`的`this`绑定到了`obj`。 无论之后如何调用函数`fun2`，它总会手动在`obj`上调用`fun1`。

~~~js
function fun1() {
  console.log(this);
  console.log(this.a);
}

var obj = {
  a: "局部对象",
};

function fun2() {
  fun1.call(obj); // 显式绑定
}

fun2(); // 局部对象 【内部进行了绑定】

setTimeout(fun2, 100); // 局部对象

// 硬绑定后的fun2不能再修改this
fun2.call(window); // 局部对象
~~~

这种绑定是一种显式的强制绑定，因此我们称之为硬绑定

#### 4.3.2 硬绑定应用场景

**1.创建一个包裹函数，负责接收参数并返回值**

~~~js
function fun1(something) {
  console.log(this.a, something);
  return this.a + something;
}

var obj = {
  a: 2,
};

// 创建一个包裹函数，负责接收参数并返回值
function fun2() {
  return fun1.apply(obj, arguments);
}

var b = fun2(3); // 2 3

console.log(b); // 5
~~~

**2.创建一个可以重复使用的 辅助绑定函数**

~~~js
function fun1(something) {
  console.log(this.a, something);
  return this.a + something;
}

// 辅助绑定函数
function bind(fn, obj) {
  return function () {
    return fn.apply(obj, arguments);
  };
}

var obj = {
  a: 2,
};

var fun2 = bind(fun1, obj);

var b = fun2(3); // 2 3 
console.log(b); // 5
~~~

其实这个辅助绑定函数，JavaScript已经帮我们创建好了就是函数原型上的`bind()`方法

#### 4.3.3 API调用的上下文

第三方库的许多函数，以及JavaScript语言和宿主环境中许多新的内置函数，都提供了一个可选的参数，通常被称为“上下文”（context），其作用和`bind(..)`一样，确保你的回调函数使用指定的`this`

~~~js
function fun(el) {
	console.log(el, this.id);
}
var obj = {
	id: 'awesome'
}
// 第二个参数用来指定this
[1,2,3].forEach(fun, obj); // 1 awesome 2 awesome 3 awesome
~~~

### 4.4 new绑定

在JavaScript中，**构造函数只是一些使用new操作符时被调用的函数**。 它们并不会属于某个类，也不会实例化一个类。 实际上，它们甚至都不能说是一种特殊的函数类型，它们只是被new操作符调用的普通函数而已

JavaScript中的所有的函数都是可以用new来调用，称为**构造函数调用**

使用`new`来调用函数，或者说发生构造函数调用时，会自动执行下面的操作：

1. 创建一个全新的对象
2. 这个对象执行[[prototype]]连接，隐式原型 指向 构造函数的显式原型
3. 这个新对象会绑定到函数调用的`this`
4. 如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象

```js
function fun(a){
	this.a = a;
}
// 将fun构造函数中的 this 绑定到obj
var obj = new fun(2)
console.log(obj.a) // 2
```

**手写new**

~~~js
export default function _new() {
    const constructor = Array.prototype.shift.call(arguments)
    if (typeof constructor ! == 'function') {
        console.log("type error")
        return
    }
    let newObj = Object.create(constructor.prototype, arguments)
    let result = constructor.apply(newObj, argument)
    let flag = result && (typeof result === 'object' || typeof result === 'function')
    return flag ? result : newObj
}
~~~

### 4.5 绑定的优先级

new绑定 > 显式绑定 > 隐式绑定 > 默认绑定(最低)

#### 4.5.1 显示绑定 > 隐式绑定

~~~js
function fun() {
  console.log(this.a);
  console.log(this);
}
let obj1 = {
  a: "obj1里面的a",
  fun: fun,
};

let obj2 = {
  a: "obj2里面的a",
  fun: fun,
}

obj1.fun() // 隐式绑定obj1
fun.call(obj2) // 显式绑定obj2
// 比较优先级
obj1.fun.call(obj2); // obj2
~~~

#### 4.5.2 new绑定 > 隐式绑定

~~~js
function fun(a) {
  this.a = a;
}

let obj1 = {
  fun: fun,
};

obj1.fun("隐式绑定");
console.log(obj1.a); // "隐式绑定"

let obj2 = new fun("new绑定");
console.log(obj2.a); // "new绑定"

// 比较优先级
let obj3 = new obj1.fun("new绑定");
console.log(obj1.a); // "隐式绑定"
console.log(obj3.a); // "new绑定"
~~~

#### 4.5.3 new绑定 > 显式绑定

~~~js
function fun(a) {
  this.a = a;
}

let obj1 = {};

let fun1 = fun.bind(obj1);
fun1("硬绑定的a");
console.log(obj1.a); // 硬绑定的a

let fun2 = new fun1("new绑定的a");
console.log(obj1.a); // 硬绑定的a
console.log(fun2.a); // new绑定的a
~~~

### 4.6 规则总结

1. 由`new`调用，绑定到新创建的对象。
2. 由call、apply、bind调用，硬绑定到指定的对象
3. 由上下文对象调用，绑定到那个上下文对象
4. 默认：严格模式下绑定到undefined，否则绑定到全局对象

## 5 绑定例外

### 5.1 显式绑定时传入`null`

如果你把`null`或者`undefined`作为this的绑定对象传入call、apply或者bind，这些值在调用时会被忽略，实际应用的是**默认绑定规则** 

~~~js
function fun(a, b) {
  console.log(`a:${a}, b:${b}`);
}

// 将数组展开成参数【ES6可以使用展开运算符】
fun.apply(null, [2, 3]); // a:2, b:3

// 函数柯里化
let fun1 = fun.bind(null, 2);
fun1(3); // a:2, b:3。
~~~

总是传null也不太好，可以传一个空对象ø

**补充：`Object.create(null)`比起`{}`,更空，因为{}还继承了`Object.prototype`，而null是原型链终点。**

~~~js
function fun(a, b) {
  console.log(`a:${a}, b:${b}`);
}

let ø = Object.create(null);

// 将数组展开成参数【ES6可以使用展开运算符】
fun.apply(ø, [2, 3]); // a:2, b:3

// 函数柯里化
let fun1 = fun.bind(ø, 2);
fun1(3); // a:2, b:3
~~~

### 5.2 间接引用

~~~js
function fun() {
  console.log(this.a);
}

var a = "全局的a";

let obj1 = {
  a: "obj1中的a",
  fun: fun
};
let obj2 = {
  a: "obj2中的a"
};

obj1.fun(); // obj1中的a

obj2.fun = obj1.fun;
obj2.fun(); // obj2中的a

(obj2.fun = obj1.fun)(); // 全局的a
~~~

赋值表达式返回值时目标函数的引用，因此调用位置是fun()，而不是obj2.fun()或obj1.fun()

### 5.3 软绑定

硬绑定会大大降低函数的灵活性，使用硬绑定之后就**无法使用隐式绑定或者显式绑定**来修改`this`。

让this在默认情况下不再指向全局对象（非严格模式）和undefined（严格模式），而是**指向两者之外的一个对象**，这点和硬绑定效果相同，但是同时又保留了隐式绑定和显示绑定在之后可以**修改this指向**的能力。

~~~js
if (!Function.prototype.softBind) {
    Function.prototype.softBind = function(obj) {
        var fn = this
        var curried = Array.slice.call(arguments, 1)
        var bound = function() {
            return fn.apply(!this || this === (window || global)) ? obj : this,
            curried.concat.apply(curried, arguments)
            )
        }
        bound.prototype = Object.create( fn.prototype);
        return bound
    }
}
~~~

它会对指定的函数进行封装，首先检查调用时的`this`，如果 `this `绑定到全局对象或者 `undefined`，那就把指定的默认对象 `obj` 绑定到 `this`，否则不会修改`this`。

~~~js
function foo() {
	console.log("name: " + this.name);
}
var obj = { name: "obj" }, 
	obj2 = { name: "obj2" }, 
	obj3 = { name: "obj3" };
var fooOBJ = foo.softBind( obj );
fooOBJ(); // name: obj
obj2.foo = foo.softBind(obj); 
obj2.foo(); // name: obj2 <---- 看!!!
fooOBJ.call( obj3 ); // name: obj3 <---- 看! 
setTimeout( obj2.foo, 10 ); // name: obj <---- 应用了软绑定
~~~

可以看到，软绑定版本的 `foo()` 可以手动将 `this `绑定到 `obj2` 或者 `obj3` 上，但如果应用默认绑定，则会将 `this` 绑定到 `obj`。

### 5.4 箭头函数

箭头函数并不是使用function关键字定义的

箭头函数不使用this的四种标准规则，**而是根据外层（函数或者全局）作用域【词法作用域】来决定this【继承外层函数调用的this绑定】**

箭头函数的绑定**无法被修改**。（new也不行！）
