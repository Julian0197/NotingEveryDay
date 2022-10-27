# this/call/apply/bind

## 1 对this的理解

this和调用位置有关

this依据以下四种规则：

+ 独立函数调用，在非严格模式下，this指向**全局对象**（window/global)，严格模式下指向undefined
+ 隐式绑定，this指向函数引用的**上下文对象**
  + 发生隐式丢失：函数别名引用，参数传递函数（回调函数），事件处理器
+ 显示绑定，Function的原型上**call、apply、bind**可以改变this指向

+ new绑定，this指向创建的新对象

绑定的优先级从上至下。

注意：箭头函数this不适用上述标准，而是继承外层函数调用的this

## 2 call和apply的区别

都是用于强制绑定this，区别在于接受的参数:

+ apply接受的第二个参数是数组或类数组
+ call接受的参数数量不固定，从第二个参数往后依次传入将函数

## 3 手写call、apply和bind

### 3.1 call

~~~js
Function.prototype.myCall = function(context) {
    if (typeof this ! == "function") {
        console.error("type error")
    }
    let args = Array.prototype.slice.call(arguments, 1)
    let result = null
    // 判断context是否传入
    context = context || window
    context.fn = this
    result = context.fn(...args)
    delete context.fn
    return result
}
~~~

### 3.2 apply

~~~js
Function.prototype.myApply = function(context) {
    if (typeof this ! == "function") {
        console.error("type error")
    }
    let result = null
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

### 3.3 bind

~~~js
Function.prototype.bind = function(context) {
    if (typeof this ! == "function") {
    	throw new TypeError("Error");
 	}
    let args = [...argumnts].slice(1)
    let fn = this
    let Fn = function() {
        let newArgs = [...arguments]
        return fn.apply(this instanceof Fn ? this : context, args.concat(newArgs))
    }
    let temp = function() {}
    if (this.prototype) {
        temp.prototype = this.prototype
    }
	// temp的实例继承原函数的所有属性方法, 并使Fn.prototype指向temp的实例, 
    // 这样可以使Fn.prototype的修改影响不到原函数的属性方法.
    Fn.prototype = new temp()
    return Fn
}
~~~

