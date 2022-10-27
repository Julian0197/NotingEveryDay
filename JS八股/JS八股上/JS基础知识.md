# JS基础

## new操作符实现原理

1. 先创建一个空对象
2. 设置原型，将空对象的原型设置为构造函数的prototype对象
3. 让构造函数的this指向这个对象，执行constructor
4. 判断函数返回值类型，如果是值类型返回创建的对象。如果是引用类型，就返回这个引用类型的对象

~~~js
function _new() {
    let constructor = Array.prototype.shift.call(arguments)
    if (typeof constructor ! == 'function') {
        console.error("type error")
        return
    }
    let newObj = Object.create(constructor.prototype)
    let result = constructor.apply(newObj, arguments)
    let flag = result && result instanceof object
    return flag ? : result : newObj
}
~~~

## map和Object的区别

|          | Map                                                          | Object                                                       |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 意外的键 | Map默认情况不包含任何键，只包含显式插入的键。                | Object 有一个原型, 原型链上的键名有可能和自己在对象上的设置的键名产生冲突。 |
| 键的类型 | Map的键可以是任意值，包括函数、对象或任意基本类型。          | Object 的键必须是 String 或是Symbol。                        |
| 键的顺序 | Map 中的 key 是有序的。因此，当迭代的时候， Map 对象以插入的顺序返回键值。 | Object 的键是无序的                                          |
| Size     | Map 的键值对个数可以轻易地通过size 属性获取                  | Object 的键值对个数只能手动计算                              |
| 迭代     | Map 是 iterable 的，所以可以直接被迭代。                     | 迭代Object需要以某种方式获取它的键然后才能迭代。             |
| 性能     | 在频繁增删键值对的场景下表现更好。                           | 在频繁添加和删除键值对的场景下未作出优化。                   |

## JS脚本延迟加载的方法

延迟加载就是等页面加载完成之后再加载Javascript文件。JS延迟加载有助于提高页面加载速度

+ **defer属性：**给 js 脚本添加 defer 属性，这个属性会让脚本的加载与文档的解析同步解析，然后在文档解析完成后再执行这个脚本文件，这样的话就能使页面的渲染不被阻塞。多个设置了 defer 属性的脚本按规范来说最后是顺序执行的，但是在一些浏览器中可能不是这样。
+ **async属性**：给 js 脚本添加 async 属性，这个属性会使**脚本异步加载**，不会阻塞页面的解析过程，但是当**脚本加载完成后立即执行 js 脚本**，这个时候**如果文档没有解析完成的话同样会阻塞**。多个 async 属性的脚本的执行顺序是不可预测的，一般不会按照代码的顺序依次执行。
+ **动态创建DOM**：动态创建 DOM 标签的方式，可以对文档的加载事件进行监听，当文档加载完成后再动态的创建 script 标签来引入 js 脚本。
+ **让JS最后加载：**将 js 脚本放在文档的底部，来使 js 脚本尽可能的在最后来加载执行。

## 数组有哪些原生方法

- 数组和字符串的转换方法：`toString()`、`toLocalString()`、`join()` 其中 join() 方法可以指定转换为字符串时的分隔符。
- 数组尾部操作的方法 `pop()` 和 `push()`，push 方法可以传入多个参数。
- 数组首部操作的方法 `shift()` 和 `unshift()` 重排序的方法 `reverse()` 和 `sort()`，sort() 方法可以传入一个函数来进行比较，传入前后两个值，如果返回值为正数，则交换两个参数的位置。
- 数组连接的方法`concat()`，返回的是拼接好的数组，不影响原数组
- 数组截取办法 `slice()`，用于截取数组中的一部分返回，不影响原数组
- 数组插入方法 `splice()`(splice(插入位置，删除元素的个数，替换的新元素))，影响原数组查找特定项的索引的方法，`indexOf()` 和 lastIndexOf() 迭代方法 every()、some()、filter()、map() 和 `forEach()` 方法
- 数组归并方法`reduce()`和reduceRight()

## 类数组，arguments理解，如何遍历类数组

一个拥有 length 属性和若干索引属性的对象就可以被称为类数组对象，类数组对象和数组类似，但是不能调用数组的方法。常见的类数组对象有 arguments 和 DOM 方法的返回结果，函数参数也可以被看作是类数组对象，因为它含有 length属性值，代表可接收的参数个数。

常见的**类数组转换为数组**的方法有这样几种：

- 通过 call 调用数组的 `slice` 方法来实现转换

```javascript
Array.prototype.slice.call(arguments, 0)
```

- 通过 call 调用数组的 `splice` 方法来实现转换

```javascript
Array.prototype.splice.call(arguments, 0)
```

- 通过 apply 调用数组的 `concat` 方法来实现转换

```javascript
Array.prototype.caocat.apply([], arguments)
```

- 通过 `Array.from` 方法来实现转换

  对一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例。

```javascript
Array.from(arguments)
```

## 如何遍历类数组

+ 用call或者apply将数组的方法用到类数组

~~~js
function foo() {
    Array.prototype.call.call(arguments, a => console.log(a))
}
~~~

+ Array.from将类数组转化为数组，再使用forEach

~~~js
function foo() {
    const arr = Array.from(arguments)
    arr.forEach(a => console.log(a))
}
~~~

+ 使用扩展运算符将类数组转化为数组

~~~js
function foo() {
    const arr = [...arguments]
    arr.forEach(a => console.log(a))
}
~~~

## 什么是DOM和BOM

+ DOM（Document Object Model）：文档对象模型，它指的是把文档当做一个对象，这个对象主要定义了处理网页内容的方法和接口。
+ BOM（Browser Object Model）：浏览器对象模型，它指的是把浏览器当做一个对象来对待，这个对象主要定义了与浏览器进行交互的法和接口。BOM的核心是window，window对象具有双重角色，他既是通过JS访问浏览器窗口的一个接口，又是一个Global（全局）对象。这意味着网页中定义的任何属性和函数都是全局对象的属性或方法。window 对象含有 location 对象、navigator 对象、screen 对象等子对象，并且 DOM 的最根本的对象 document 对象也是 BOM 的 window 对象的子对象。

## 常见的DOM操作有哪些

1. DOM节点的获取
   + getElementById 按照ID查询
   + getElementByTagName 按照标签名查询
   + getElementByClassName 按照类名查询
   + querySelectorAll 按照css选择器查询

~~~js
// 按照 id 查询
var imooc = document.getElementById('imooc') // 查询到 id 为 imooc 的元素

// 按照标签名查询
var pList = document.getElementsByTagName('p')  // 查询到标签为 p 的集合

// 按照类名查询
var moocList = document.getElementsByClassName('mooc') // 查询到类名为 mooc 的集合

// 按照 css 选择器查询
var pList = document.querySelectorAll('.mooc') // 查询到类名为 mooc 的集合
~~~

2. DOM节点的创建

**创建一个新节点，并把它添加到指定节点的后面。** 已知的 HTML 结构如下：

~~~html
<html>
  <head>
    <title>DEMO</title>
  </head>
  <body>
    <div id="container"> 
      <h1 id="title">我是标题</h1>
    </div>   
  </body>
</html>
~~~

要求添加一个有内容的 span 节点到 id 为 title 的节点后面，做法就是：

~~~js
// 首先获取父节点
var container = document.getElementById('container')
// 创建新节点
var targetSpan = document.createElement('span')
// 设置span节点的内容
targetSpan.innerHtml = 'hello world'
// 把新创建的元素塞进父节点里去
container.appendChild(targetSpan)
~~~

3. DOM节点的删除

删除指定的DOM节点，已知的HTML结构如下：

~~~html
<html>
  <head>
    <title>DEMO</title>
  </head>
  <body>
    <div id="container"> 
      <h1 id="title">我是标题</h1>
    </div>   
  </body>
</html>
~~~

需要删除 id 为 title 的元素，做法是：

~~~js
// 获取目标元素的父元素
var container = document.getElementById('container')
// 获取目标元素
var targetNode = document.getElementById('title')
// 删除目标元素
container.removeChile(targetNode)
~~~

或者通过子节点数组来完成删除：

~~~js
// 获取目标元素的父元素
var container = document.getElementById('container')// 获取目标元
var targetNode = container.childNodes[1]// 删除目标元素
container.removeChild(targetNode)
~~~

4. 修改DOM元素

修改DOM元素可以分为很多维度，比如移动DOM元素的位置，修改DOM元素的属性

**将指定的两个 DOM 元素交换位置，** 已知的 HTML 结构如下：

```javascript
<html>
  <head>
    <title>DEMO</title>
  </head>
  <body>
    <div id="container"> 
      <h1 id="title">我是标题</h1>
      <p id="content">我是内容</p>
    </div>   
  </body>
</html>
复制代码
```

现在需要调换 title 和 content 的位置，可以考虑 insertBefore 或者 appendChild：

```javascript
// 获取父元素
var container = document.getElementById('container')   
 
// 获取两个需要被交换的元素
var title = document.getElementById('title')
var content = document.getElementById('content')
// 交换两个元素，把 content 置于 title 前面
container.insertBefore(content, title)
```

## JS为什么要进行变量提升，它导致了什么问题

变量提升的表现是，无论在函数中何处声明的变量，好像都被提升到了函数首部，可以在变量声明前访问到而不会出错。

> 这里注意，var定义的变量函数声明和函数初始化（赋值undefined）都被提升了，所以在变量声明前访问不会出错。
>
> 但是let和const仅仅提升了变量的创建，没有提升初始化,所以在变量声明之前使用变量，会造成暂时性死区
>
> 另外注意const声明的变量一定要同时赋值，因为const定义的变量不能改变内存地址

造成变量声明提升的**本质原因**是 js 引擎在代码执行前有一个解析的过程，创建了执行上下文，初始化了一些代码执行时需要用到的对象。当访问一个变量时，会到当前执行上下文中的作用域链中去查找，而作用域链的首端指向的是当前执行上下文的变量对象，这个变量对象是执行上下文的一个属性，它包含了函数的形参、所有的函数和变量声明，这个对象的是在代码解析的时候创建的。

JS在拿到一个变量或者一个函数的时候，会有两步操作，即解析和执行。

- 在解析阶段

  ，JS会检查语法，并对函数进行预编译。解析的时候会先创建一个全局执行上下文环境，先把代码中即将执行的变量、函数声明都拿出来，变量先赋值为undefined，函数先声明好可使用。在一个函数执行之前，也会创建一个函数执行上下文环境，跟全局执行上下文类似，不过函数执行上下文会多出this、arguments和函数的参数。

  - 全局上下文：变量定义，函数声明
  - 函数上下文：变量定义，函数声明，this，arguments

- **在执行阶段**，就是按照代码的顺序依次执行。

那为什么会进行变量提升呢？主要有以下两个原因：

- 解析和预编译过程中的声明提升可以提高性能，让函数可以在执行时预先为变量分配栈空间
- 声明提升还可以提高JS代码的容错性，使一些不规范的代码也可以正常执行

## for in，Object.keys，for of 的区别

### `for...in`

+ 遍历对象及其**原型链**上可枚举的属性
+ 如果用于遍历数组，除了遍历其元素外，还会遍历开发者对数组对象自定义的可枚举属性及其原型链上的可枚举属性
+ 遍历获取的是对象的**键名**
+ 某些情况下，可能按随机顺序遍历数组

~~~js
Array.prototype.getLength = function() {
    return this.length
}
var arr = ['a', 'b', 'c']
arr.name = 'June'
Object.defineProperty(arr, 'age', {
    enumerable: true,
    value: 17,
    writable: true,
    configuable: true
})
for(var i in arr) {
    console.log(i); // 0,1,2,name,age,getLength
}
~~~

### `Object.keys`

+ 返回对象自身**可枚举属性（键名）**组成的数组
+ 不会遍历对象原型链上的属性以及 Symbol 属性

~~~js
function Person() {
    this.name = 'June'
}
Person.prototype.getName = function() {
    return this.name
}
var person = new Person()
Object.defineProperty(person, 'age', {
    enumerable: true,
    value: 17,
    writable: true,
    configurable: true
});
console.log(Object.keys(person));   // ['name', 'age']
~~~

### `for...of`

+ ES6新增的循环遍历语法
+ 允许遍历含有`Iterator`接口的数据结构（数组，类数组，字符串，Map，Set等）
+ 不支持遍历普通对象（因为没有`Iterator`接口）
+ 遍历获得的是对象的**键值**

~~~js
// 1. 不会遍历到对象属性及其原型属性,遍历得到的是键值
Array.prototype.getLength = function() {
    return this.length;
};
var arr = ['a', 'b', 'c'];
arr.name = 'June';
Object.defineProperty(arr, 'age', {
    enumerable: true,
    value: 17,
    writable: true,
    configurable: true
});
for(let i of arr) {
    console.log(i); // a,b,c
}
~~~

~~~js
// 2. 如果要遍历对象，可与 Object.keys 配合
var person = {
    name: 'June',
    age: 17,
    city: 'guangzhou'
}
for (let key of Object.keys(person)) {
    console.log(person[key]); // June, 17, guangzhou
}
~~~

~~~js
// 3. 配合 entries 输出数组索引和值/对象的键值
var arr = ['a', 'b', 'c'];
for (let [index, value] of Object.entries(arr)) {
    console.log(index, ':', value)
    // 0:a, 1:b, 2:c
}
var obj = {name: 'June', age: 17, city: 'guangzhou'};
for(let [key, value] of Object.entries(obj)) {
    console.log(key, ':', value);
    // name:June,age:17,city:guangzhou
}
~~~

~~~js
// 4. 如果需要遍历的对象是类数组对象，用Array.from转成数组即可。
var obj = {
    0:'one',
    1:'two',
    length: 2 // 类数组对象具有length属性
};
obj = Array.from(obj);
for(var k of obj){
    console.log(k) // one two
}
~~~

~~~js
// 5. 如果不是类数组对象，就给对象添加一个[Symbol.iterator]属性，并指向一个迭代器即可

// 方法1：
var obj = {
    a:1,
    b:2,
    c:3
};
obj[Symbol.iterator] = function() {
    var keys = Object.keys(this)
    var count = 0
    return {
        next() {
            if (count < keys.length) {
                return {value: obj[keys[count++]], done: false}
            } else {
                return {value: undefined, done: true}
            }
        }
    }
}
for(var k of obj){
	console.log(k); // 1 2 3
}

// 方法2：
var obj = {
    a:1,
    b:2,
    c:3
};
obj[Symbol.iterator] = function*(){
    var keys = Object.keys(obj);
    for(var k of keys){
        yield [k,obj[k]]
    }
};

for(var [k,v] of obj){
    console.log(k,v);
}
~~~

## 数组的遍历方式

1. `for循环、while循环`
2. `for...of`

​	遍历的是具有Iterator迭代器的数据结构，不返回原型链上的属性，返回的是键值

3. `forEach()`

   调用数组中每个元素，将元素传递给函数，没有返回值，不改变原数组

   - item： 必需。当前元素
   - index： 可选。当前元素的索引值。
   - arr： 可选。当前元素所属的数组对象

   ~~~js
   let arr = [1,2,3];
   arr.forEach((item, index, arr) => {
     console.log(item + "," + index + ","+ arr)
   })
   // 1,0,1,2,3
   // 2,1,1,2,3
   // 3,2,1,2,3
   ~~~

   该方法还可以有第二个参数，用来绑定回调函数内部this变量（前提是回调函数不能是箭头函数，因为箭头函数没有this）：

   ~~~js
   let arr = [1,2]
   let arr1 = [2,4]
   arr.forEach(function(item,index,arr) {
       console.log(this[index]) // 2 4 (this相当于arr1)
   }, arr1)
   ~~~

4. `map()`

   + map()方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。该方法按照原始数组元素顺序依次处理元素。
   + 不会对空数组检测，会返回一个空数组，**不会修改原数组**
   + 该方法的第一个参数为回调函数，他有三个参数（item，index，arr）

   ~~~js
   let arr = [1, 2, 3];
    
   arr.map(item => {
       return item+1;
   })
   // 返回值： [2, 3, 4]
   ~~~

   第二个参数用来绑定函数内部的this变量，可选：

   ~~~js
   var arr = ['a', 'b', 'c'];
    
   [1, 2].map(function (e) {
       return this[e];
   }, arr)
    // 返回值： ['b', 'c']
   ~~~

   该方法可以进行链式调用

   ~~~js
   let arr = [1,2,3]
   arr.map(item => item+1).map(item => item+1)
   // 返回值： [3, 4, 5]
   ~~~

5. `filter()`

   filter用于过滤数组，满足条件的元素会返回。它的参数是一个回调函数，所有数组元素依次执行函数，结果为true的返回。该方法返回一个新数组，不改变原数组。

   ~~~js
   let arr = [1, 2, 3, 4, 5]
   arr.filter(item => item > 2) 
   
   // 结果：[3, 4, 5]
   ~~~

   同样，他也有第二个参数，用来绑定参数函数内部的this变量。

   我们可以使用`filter()`方法来移除数组中的undefined、null、NAN等值

   ~~~js
   let arr = [1, undefined, 2, null, 3, false, '', 4, 0]
   // Boolean 是一个函数，它会对遍历数组中的元素，并根据元素的真假类型，对应返回 true 或 false.
   arr.filter(Boolean)
   
   // 结果：[1, 2, 3, 4]
   ~~~

6. `every()`

   every方法会对数组中的每一项进行遍历，只有**所有元素都符合条件**，才返回true，否则返回false

   ~~~js
   let arr = [1, 2, 3, 4, 5]
   arr.every(item => item > 0) 
   
   // 结果： true
   ~~~

7. `some()`

   some方法会对数组中的每一项进行遍历，只要有一个元素符合条件，就返回true，否则就返回false。

   ~~~js
   let arr = [1, 2, 3, 4, 5]
   arr.some(item => item > 4) 
   
   // 结果： true
   ~~~

> `some()`和`every()`方法都接受一个函数作为参数，该参数函数可以接收三个参数，分别是当前数组元素、当前元素索引、当前元素所在数组。

8. `find()`

   find方法返回**通过函数内判断的数组的第一个元素的值**。该方法为数组中的每个元素都调用一次函数执行：

   + 当数组中的元素在测试条件时返回 true 时， `find()` 返回符合条件的元素，之后的值不会再调用执行函数。
   + 如果没有符合条件的元素返回 undefined
   + 对于空数组，函数是不会执行的。 该方法并没有改变数组的原始值。

   ~~~js
   let arr = [1, 2, 3, 4, 5]
   arr.find(item => item > 2) 
   
   // 结果： 3
   ~~~

9. `findIndex()`

   和find方法几乎一样，返回的结果是**索引值**

10. `reduce()`

    reduce方法对数组中的每个元素执行一个reducer函数(升序执行)，将其结果汇总为单个返回值。

    **语法：**`arr.reduce(callback,[initialValue])`

    (1) callback （执行数组中每个值的函数，包含四个参数）

    + previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
    + currentValue （数组中当前被处理的元素）
    + index （当前元素在数组中的索引）
    + array （调用 reduce 的数组）

    (2) `initialValue` （作为第一次调用 callback 的第一个参数。）

    ~~~js
    var arr = [1, 2, 3, 4]
    var sum = arr.reduce((prev, cur, index, arr) => {
        console.log(prev, cur, index);
        return prev + cur;
    })
    console.log(arr, sum);
    ~~~

    <img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220930173413530.png" alt="image-20220930173413530" style="zoom:25%;" />

    增加一个初始值（initialValue）：

    ~~~js
    var arr = [1, 2, 3, 4]
    var sum = arr.reduce((prev, cur, index, arr) => {
        console.log(prev, cur, index);
        return prev + cur;
    }, 5)
    console.log(arr, sum);
    ~~~

    <img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220930173633379.png" alt="image-20220930173633379" style="zoom:25%;" />

    **如果没有提供initialValue，reduce 会从索引1的地方开始执行 callback 方法，跳过第一个索引。如果提供initialValue，从索引0开始**

    注意，**该方法如果添加初始值，就会改变原数组**，将这个初始值放在数组的**最后一位**。

11. `reduceRight()`

    和reduce用法几乎一致，只是该方法对数组进行倒序查找

##  解释型语言和编译型语言的区别



## 强类型语言和弱类型语言的区别





