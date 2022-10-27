## 1.关于this指向两道题

**题目1：**

~~~Js
var length = 10;
function fn() {
    console.log(this.length)
};
var obj = {
    length: 5, 
    method: function (fn) {
        fn();
        arguments[0]();
        fn.call(obj, 12);
    }
};
obj.method(fn, 1); // 10 2 5
~~~

> 执行`obj.method(fn, 1)`相当于执行：
>
> + `fn()`
> + `arguments[0]()`
> + `fn.call(obj, 12)`
>
> this指向只和调用时候的位置有关。
>
> 1. 第一个直接调用fn()，在非严格模式下，this指向全局对象window，所以打印**10**
> 2. arguments\[0]()是作为 arguments 对象的属性 [0] 来调用 fn 的，所以 fn 中的 this 指向属性访问主体的对象 arguments，arguments的长度是传入的参数个数**2**
> 3. 强制绑定this给obj，并立即执行，所以返回**5**



**题目2：**

~~~~js
var length = 10;

function fn() {
    console.log(this.length);
}

var obj = {
    length: 5,
    method: function(fn) {
        fn();
    },
    getLength: function() {
        setTimeout(function() {
            console.log(this.length);
        })
    }
};

obj.method(fn); // 10
obj.method(fn.bind(obj)) // 5
obj.getLength(); // 10
~~~~

> 第三个相当于`window.setTimeout(...)`,this指向window



## 2.宏任务微任务

~~~js
new Promise((a, b) => {
    for (var i = 0; i < 10; i++) {
        i == 0 && a()
    }
})
~~~



## 3.闭包

~~~Js
function fun(n, o) {
    console.log(o)
    return {
        fun: function(m) {
            return fun(m, n)
        }
    }
}

var a = fun(0) // undefined
a.fun(1) // 0
a.fun(2) // 0
a.fun(3) // 0

var b = fun(0).fun(1).fun(2).fun(3) // undefined 0 1 2

var c = fun(0).fun(1) // undefined 0
c.fun(2) // 1
c.fun(3) // 1
~~~

> return返回的对象有一个属性对应一个新建的函数，这个函数对象内部将会形成一个闭包作用域，使其能够访问外层函数的变量n以及外层函数fun。

为了不混淆fun函数和返回的fun属性，等价转化上述代码：

~~~js
function _fn_(n,o){
    console.log(o);
    return {
        fn:function(m){
            return _fn_(m,n)
        }
    }
}
 
const a=_fn_(0);a.fn(1);a.fn(2);a.fn(3);
const b=_fn_(0).fn(1).fn(2).fn(3);
const c=_fn_(0).fn(1);c.fn(2);c.fn(3);
~~~

1. a执行过程
   + `const a=_fn_(0)`调用外层函数，只传入了一个变量，所以打印o是undefined
   + `a.fn(1)`调用fn(1)时m为1，闭包又保存了外层函数的n，第一次调用时n=0，所以相当于再执行`_fn_(1,0)`，打印o是0
   + `a.fn(2)`和`a.fn(3)`同上，都是打印闭包保存的0
2. b执行过程
   + 第一次调用`_fn_(0)`，传入参数n为0，o为undefined，打印undefined，并返回一个对象，对象中有一个属性为函数，并产生闭包，保存了外部的n和函数\_fn_
   + 然后调用上述对象的函数fn，并传入参数1赋值给m，并在fn内部继续调用`_fn_(1,0)`，打印出来的o为0，再返回一个对象，有一个属性为函数，闭包保存了n=1和外部函数\_fn_
   + 继续调用上述对象的函数fn，传入参数2赋值给m，在fn内部继续调用`_fn_(2,1)`，打印出来o为1，再返回一个对象，有一个属性为函数，闭包保存了n=2和外部函数\_fn_
   + 继续调用上述对象的函数fn，传入参数3赋值给m，在fn内部继续调用`_fn_(3,2)`，打印出来o为2，再返回一个对象，有一个属性为函数，闭包保存了n=3和外部函数\_fn_
3. c执行过程
   + 第一次调用`_fn_(0)`，传入参数n=0，o为undefined，打印undefined，并返回一个对象，对象中有一个属性为函数，产生了闭包，保存了外部的n=0和函数\_fn_
   + 继续调用上述对象的函数fn，传入参数1给m，在fn内部继续调用`_fn_(1,0)`，打印出来o为0，并返回一个对象，对象有一个属性是函数，保存了外部的n=1和函数\_fn_
   + `c.fn(2)`调用上述对象内部的函数fn，传入参数2给m，在fn内部继续调用`_fn_(2,1)`，打印出来o为1，返回的对象由于没有保存会被垃圾回收。
   + `c.fn(3)`调用的对象中，闭包保存的n=1，所以调用函数fn，函数内部继续调用`_fn_(3,1)`，打印出来的o还是1

