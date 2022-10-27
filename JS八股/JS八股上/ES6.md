# ES6八股

## 1.let、const和var的区别

1. **块级作用域：**块级作用域由`{ }`包括，let和const具有块级作用域，var不存在块级作用域，块级作用域解决了ES5中的两个问题：
   + 内层变量可能覆盖外层变量
   + 用来计数的循环变量会泄露为全局变量
2. **变量提升：**var存在变量提升，let和const不存在变量提升，所以变量只能在声明之后使用，否则会报错。
3. **给全局添加属性：**浏览器的全局对象是window，node的全局对象是global，var声明的变量为全局变量，会将这个变量添加为全局对象的属性，但let和const不会。
4. **重复声明：**var声明变量时可以重复声明，后声明的同名变量会覆盖之前声明的。const和let不允许重复声明。
5. **暂时性死区：**ES6规定，如果区块中存在let和const命令，这个区块对这些命令声明的变量从一开始就形成了封闭作用域。凡是在声明之前使用这些变量，会报错。
6. **初试值设置：**变量声明前，var和let可以不用设置初始值。而const声明的变量必须赋初始值。
7. **指针指向：**let声明的变量可以更改指针指向（重新赋值），const声明的变量不允许改变指针的指向。

## 2.const对象的属性可以修改吗

const保证的是该变量所指向的内存地址不能改变。

对于基本类型数据（Number、String、Boolean），其值就保存在变量所指向的那个内存地址（栈内），相当于常量。

对于引用数据类型（对象、数组），变量指向的内存地址保存的是一个指针（栈内），该指针指向真正的值（堆内）。所以const只是确保指针不变，他所指向的数据结构不能控制。

## 3.箭头函数和普通函数区别

1. **箭头函数更加简洁**

   + 如果没有参数，直接写一个空括号
   + 如果只有一个参数，可以省去参数的括号
   + 如果有多个参数，用逗号分割
   + 如果函数体的返回值只有一句，可以省略大括号
   + 如果函数体不需要返回值，且只有一句话，可以给这个语句前面加一个void关键字。最常见的就是调用一个函数：

   ~~~js
   let fn = () => void doesNoReturn()
   ~~~

2. **箭头函数没有自己的this，定义时确定并且不会改变**

箭头函数不会创建自己的this，它只会在自己作用域的上一层继承。所以**箭头函数的this在定义时就已经确定了，之后不会改变**。

~~~js
var id = 'GLOBAL';
var obj = {
  id: 'OBJ',
  a: function(){
    console.log(this.id);
  },
  b: () => {
    console.log(this.id);
  }
};
obj.a();    // 'OBJ'
obj.b();    // 'GLOBAL'
new obj.a()  // undefined
new obj.b()  // Uncaught TypeError: obj.b is not a constructor
~~~

对象obj的方法b是使用箭头函数定义的，这个函数中的this永远指向它定义时所处的全局环境中的this，即使这个函数由obj调用，this依旧指向window。

需要注意定义对象的`{ }`是无法形成一个单独的作用域，依旧处于全局执行环境中。

3. **call()、apply()、bind()等方法不能改变箭头函数中this的指向**

~~~js
var id = 'Global';
let fun1 = () => {
    console.log(this.id)
};
fun1();                     // 'Global'
fun1.call({id: 'Obj'});     // 'Global'
fun1.apply({id: 'Obj'});    // 'Global'
fun1.bind({id: 'Obj'})();   // 'Global'
~~~

4. **箭头函数不能作为构造函数使用**

箭头函数是ES6中提出，没有prototype，没有自己的this指向，也没有arguments属性，所以不能new一个箭头函数

new操作的实现步骤：

+ 创建一个空对象
+ 将构造函数的prototype属性赋给空对象
+ 添加父类的属性到新对象上并初始化（this指向新对象），保存方法的执行结果
+ 判断函数的返回值类型，如果执行结果是值类型，就返回创建的对象，如果是引用类型，就返回这个引用类型的对象。(返回基本数据类型时返回值会被忽略)

5. **箭头函数没有arguments**

箭头函数没有自己的arguments对象。在箭头函数中访问arguments实际上获得的是它外层函数的arguments值。

6. **箭头函数没有prototype**

7. **箭头函数不能用作Generator函数，不能使用yeild关键字**

## 4.箭头函数的this指向哪里

箭头函数本身没有属于自己的this，它的this捕获自其上下文的this。

可以使用Babel理解一下箭头函数

~~~js
// ES6
const obj = {
    getArrow() {
        return () => {
            console.log(this === obj)
        }
    }
}
obj.getArrow()
~~~

转化后：

~~~js
// ES5, 由Babel转译
var obj = {
    getArrow: function getArrow() {
        var _this = this
        return function() {
            console.log(_this === obj)
        }
    }
}
~~~

## 5. 扩展运算符的作用以及使用场景

1. **对象扩展运算符**

对象扩展运算符`...`用于取出参数对象中所有可遍历属性，拷贝到当前对象中

~~~js
let bar = {a: 1, b: 2}
let baz = {...bar} //{a: 1, b: 2}
~~~

上述方法实际上等价于

~~~js
let bar = {a: 1, b: 2}
let baz = Object.assign({}, bar)
~~~

`Object.assign`方法用于对象的合并，将源对象的所有可枚举属性，复制到目标对象。第一个参数是目标对象，第二个参数是源对象。（如果目标对象和源对象有变量同名，后面的属性会覆盖前面的）

同样，如果用户自定义的属性，放在扩展运算符后面，则扩展运算符内部的同名属性会被覆盖掉。

~~~js
let bar = {a: 1, b: 2};
let baz = {...bar, ...{a:2, b: 4}};  // {a: 2, b: 4}
~~~

扩展运算符和`Object.assign`都属于浅拷贝

2. **数组扩展运算符**

数组的扩展运算符可以将一个数组转为用逗号分隔的参数序列，且每次只能展开一层数组。

~~~js
console.log(...[1, 2, 3]) // 1 2 3
console.log(...[1, [2, 3, 4], 5])
// 1 [2, 3, 4] 5
~~~

+ **将数组转换为参数序列**

~~~js
function add(x, y) {
    return x + y
}
const numbers = [1, 2]
add(...number) // 3
~~~

+ **复制数组**

~~~js
const arr1 = [1, 2]
const arr2 = [...arr1]
~~~

**扩展运算符(…)用于取出参数对象中的所有可遍历属性，拷贝到当前对象之中**，这里参数对象是个数组，数组里面的所有对象都是基础数据类型，将所有基础数据类型重新拷贝到新的数组中。

+ **合并数组**

~~~js
const arr1 = ['two', 'three'];
const arr2 = ['one', ...arr1, 'four', 'five'];
console.log(arr2)
// ["one", "two", "three", "four", "five"]
~~~

+ 扩展运算符与解构赋值结合起来，用于生成数组

~~~js
const [first, ...rest] = [1,2,3,4,5]
console.log(first) // 1
console.log(rest) // [2,3,4,5]
~~~

**注意：如果将扩展运算符用于数组赋值，只能放在参数的最后一位，否则会报错**

~~~js
const [...rest, last] = [1,2,3,4,5]
// Uncaught SyntaxError: Rest element must be last element
~~~

+ **将字符串转为真正的数组**

~~~js
console.log([..."hello"])
// [ "h", "e", "l", "l", "o" ]
~~~

+ **任何 Iterator 接口的对象，都可以用扩展运算符转为真正的数组**

比较常见的应用是可以将某些数据结构转为数组：

~~~js
// arguments对象
function foo() {
  const args = [...arguments];
}
~~~

用于替换`es5`中的`Array.prototype.slice.call(arguments)`写法。

+ **使用Math函数获取数组中特定值**

~~~js
const numbers = [9, 4, 7, 1];
Math.min(...numbers); // 1
Math.max(...numbers); // 9
~~~

## 6.对对象与数组的解构的理解

解构是 ES6 提供的一种新的提取数据的模式，这种模式能够从对象或数组里有针对性地拿到想要的数值。 

**1）数组的解构** 在解构数组时，以元素的位置为匹配条件来提取想要的数据的

~~~js
const [a, b, c] = [1, 2, 3]
const [a,,c] = [1,2,3]
~~~

**2）对象的解构** 对象解构比数组结构稍微复杂一些，也更显强大。在解构对象时，是以属性的名称为匹配条件，来提取想要的数据的。现在定义一个对象：

~~~js
const stu = {
  name: 'Bob',
  age: 24
}
const { name, age } = stu
consol.log(name, age) // "Bob" 24
~~~

**对象解构**严格以**属性名**作为定位依据，所以就算调换了 name 和 age 的位置，结果也是一样的

### 解构原理

解构是ES6提供的语法糖，内在是针对`可迭代对象`和`Iterator接口`，通过遍历器按顺序获取对应的值进行赋值。

#### Iterator

Iterator是一种接口，为各种不一样的数据解构提供统一的访问机制。任何数据结构只要有Iterator接口，就能通过遍历操作，依次按顺序处理数据结构内的所有成员。ES6中的`for...of`语法相当于遍历器，会在遍历数据结构时，自动寻找Iterator接口

Iterator作用：

+ 为各种数据结构提供统一的访问接口
+ 使得数据结构能按次序排列处理
+ 可以使用ES6最新语法for...of进行遍历

~~~js
function makeIterator(array) {
    var nextIndex = 0
    return {
        next: function() {
            return nextIndex < array.length ? {value: array[nextIndex++]} : {done: true}
        }
    }
}
~~~

#### 可迭代对象

可迭代对象是Iterator接口的实现，仅仅是一种协议。任何遵循该协议的对象都能成为可迭代对象。

**可迭代协议：**对象必须实现@@iterator方法，即对象原型链上必须有一个名叫`symbol.iterator`的属性，该属性的值为无参函数，函数返回迭代器协议。

**迭代器协议：**定义了标准的方式来产生一个有限或无限序列值。其要求必须实现一个next()方法，该方法返回对象有done(boolean)和value属性。

通过以上可知，自定义数据结构，只要拥有Iterator接口，并将其部署到自己的Symbol.iterator属性上，就可以成为可迭代对象，能被for of循环遍历。

~~~js
// 自定义可迭代对象
let obj = {
    [symbol.iterator]: function() {
        return {
            next: function() {
                return {value: 1, done: true}
            }
        }
    }
}

for (let item of obj) {
    console.log(item) // 不会报错，因为obj已经是可迭代对象
}
~~~



## 7.如何提取高度嵌套的对象里的指定属性

有时会遇到一些嵌套程度非常深的对象：

```javascript
const school = {
   classes: {
      stu: {
         name: 'Bob',
         age: 24,
      }
   }
}
```

像此处的 name 这个变量，嵌套了四层，此时如果仍然尝试老方法来提取它：

```javascript
const { name } = school
```

显然是不奏效的，因为 school 这个对象本身是没有 name 这个属性的，name 位于 school 对象的“儿子的儿子”对象里面。要想把 name 提取出来，一种比较笨的方法是逐层解构：

~~~js
const { classes } = school
const { stu } = classes
const { name } = stu
name // 'Bob'
~~~

还有一种更标准的做法，可以用一行代码来解决这个问题：

~~~js
const {classes: {stu: {name}}} = school
console.log(name)  // 'Bob'
~~~

可以在解构出来的变量名右侧，通过冒号+{目标属性名}这种形式，进一步解构它，一直解构到拿到目标数据为止。

## 对rest参数的理解

扩展运算符被用在函数形参上时，可以把一个分离的参数序列整合成一个数组

~~~js
function mutiple(...args) {
  let result = 1;
  for (var val of args) {
    result *= val;
  }
  return result;
}
mutiple(1, 2, 3, 4) // 24
~~~

这里，传入 mutiple 的是四个分离的参数，但是如果在 mutiple 函数里尝试输出 args 的值，会发现它是一个数组：

```javascript
function mutiple(...args) {
  console.log(args)
}
mutiple(1, 2, 3, 4) // [1, 2, 3, 4]
```

这就是 … rest运算符的又一层威力了，它可以把函数的多个入参收敛进一个数组里。这一点**经常用于获取函数的多余参数，或者像上面这样处理函数参数个数不确定的情况。**

## 8.ES6中模板语法与字符串处理

ES6 提出了“模板语法”的概念。在 ES6 以前，拼接字符串是很麻烦的事情：

~~~js
var name = 'css'   
var career = 'coder' 
var hobby = ['coding', 'writing']
var finalString = 'my name is ' + name + ', I work as a ' + career + ', I love ' + hobby[0] + ' and ' + hobby[1]
~~~

下面使用**模板字符串拼接数组**：

~~~js
var name = 'css'
var career = 'coder'
var hobby = ['coding', 'writing']
var finalString = `my name is ${name}, I work as a ${career} I love ${hobby[0]} and ${hobby[1]}`
~~~

模板字符串的关键优势有两个：

1. 在模板字符串中，空格、缩进、换行都会被保留
2. 模板字符串完全支持“运算”式的表达式，可以在${}里完成一些计算

基于第一点，可以在模板字符串里无障碍地直接写 html 代码：

```javascript
let list = `
	<ul>
		<li>列表项1</li>
		<li>列表项2</li>
	</ul>
`;
console.log(message); // 正确输出，不存在报错
复制代码
```

基于第二点，可以把一些简单的计算和调用丢进 ${} 来做：

```javascript
function add(a, b) {
  const finalString = `${a} + ${b} = ${a+b}`
  console.log(finalString)
}
add(1, 2) // 输出 '1 + 2 = 3'
```

除了模板语法外， ES6中还新增了一系列的字符串方法用于提升开发效率：

1. **存在性判定：**在过去，当判断一个字符/字符串是否在某字符串中时，只能用 `indexOf > -1` 来做。现在 ES6 提供了三个方法：`includes`、`startsWith`、`endsWith`，它们都会返回一个布尔值来告诉你是否存在。

   - **includes**：判断字符串与子串的包含关系：

   ```javascript
   const son = 'haha' 
   const father = 'xixi haha hehe'
   father.includes(son) // true
   ```

   - **startsWith**：判断字符串是否以某个/某串字符开头：

   ```javascript
   const father = 'xixi haha hehe'
   father.startsWith('haha') // false
   father.startsWith('xixi') // true
   ```

   - **endsWith**：判断字符串是否以某个/某串字符结尾：

   ```javascript
   const father = 'xixi haha hehe'
   father.endsWith('hehe') // true
   ```

2. **自动重复**：可以使用 repeat 方法来使同一个字符串输出多次（被连续复制多次）：

   ~~~js
   const sourceCode = 'repeat for 3 times;'
   const repeated = sourceCode.repeat(3) 
   console.log(repeated) // repeat for 3 times;repeat for 3 times;repeat for 3 times;
   ~~~




## 总结ES6新特性

## 1.新增块状作用域，let和const命令

+ let和const不存在变量提升（或者说，只存在变量提升，但是初试化没有提升）如果在声明之前使用变量，会出现暂时性死区
+ let和const不允许变量重复声明
+ let和const声明的变量具有块状作用域，块状作用域解决了：内部变量覆盖外部变量的问题 和 用来计数的变量泄露为全局变量
+ const定义一个只读变量，不能修改，所以必须声明时就赋值
+ let和const声明的变量不在属于window

## 2.解构赋值

1. **数组、对象、字符串等解构赋值的基本用法及默认值的设置**
2. **解构的用途**
   (1) 交换变量的值
   (2) 接收函数返回的多个值
   (3) 函数参数默认值的设置 (4) 用于模块导入的按需加载

## 3.字符串扩展

1. **模版字符串**
2. **方法的增添** `includes()`,`startsWith()`,`endsWith()`.....
3. **正则表达式的具名组匹配**

## 4.数值的扩展

1. **完善二进制（0b开头）与八进制（0o开头）的表示**
2. **方法的移植与增加** 将`parseInt()`和`parseFloat()`从`window`对象移植到`Number`对象上
3. **指数运算符**

## 5. 函数的扩展

1. **函数参数默认值的设置**
2. **箭头函数**
    使用箭头函数的注意事项:
    (1)函数体内的`this`对象，就是定义时所在的对象，而不是使用时所在的对象
    (2)不可以当作构造函数，也就是说，不可以使用`new`命令，否则会抛出一个错误
    (3)不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替
3. **rest参数**

- rest参数只包含那些没有对应形参的实参；而 arguments 对象包含了传给函数的所有实参。

  ~~~js
  function add(first, ...values) {
    let sum = 0;
    console.log(first)
    for (var val of values) {
      sum += val;
    }
    return sum;
  }
  
  add(10, 1, 2, 3) // 10 6
  ~~~

- arguments 对象不是一个真实的数组；而rest参数是真实的 Array 实例，也就是说你能够在它上面直接使用所有的数组方法

- rest 参数之后不能再有其他参数（即只能是最后一个参数），否则会报错。`a,...b, c`

- 函数的length属性，不包括 rest 参数。

## 6. 数组的扩展

1. 扩展运算符
   用途
   (1)复制数组
   (2)合并数组
   (3)函数的rest参数
2. 方法的扩展`Array.from()`、`Array.of()`实例上的方法`fill()`、`flat()`

## 7. 对象的扩展

1. 属性以及方法的简洁表示
2. 属性名表达式
3. 可遍历性`for..in`、`Object.key(obj)`
4. super关键字的增加
5. 新增方法`Object.is()`、`Object.assign()`

## 8. Module导入模块

讲到这一点就很有必要给面试官讲一下ES6模块与CommoonJS模块的差异

1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。

## 9. 其他方面

1. promise与async的运用和理解，提及这里他接下来可能会问promise的实现，这也是一道常考题
2. Symbol数据类型
3. set和map结构
4. class
