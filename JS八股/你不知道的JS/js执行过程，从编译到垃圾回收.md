## v8引擎工作原理

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0c0b9cad2684c7fb72b40e7afa9b5c6~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp">

V8有许多模块组成，以下四个模块最重要：
+ `Parser`：负责将JS源码转化为AST
  + 如果函数没被调用，不会转化为ast
+ `Ignition`：解释器，将AST转化为Bytecode，解释执行字节码；同时收集TurboFan优化编译所需的信息，比如函数参数的类型。
+ `TurboFan`：编译器，利用解释器所收集的类型形象，将字节码转化为优化的汇编代码
+ `Orinoco`：垃圾回收模块

## 编译阶段

### 词法分析Scanner

将字符串组成的代码块，分解成对编程语言来讲有意义的代码块，被称为词法单元（token）

`var name = "FinGet"`
~~~js
[
    {
        "type": "Keyword",
        "value": "var"
    },
    {
        "type": "Identifier",
        "value": "name"
    },
    {
        "type": "Punctuator",
        "value": "="
    },
    {
        "type": "String",
        "value": "'finget'"
    },
    {
        "type": "Punctuator",
        "value": ";"
    }
]
~~~

### 语法分析Parser

将词法单元转化为一个由元素逐级嵌套所组成的代表程序语法结构的树，被称为抽象语法树AST

~~~js
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "name"
          },
          "init": {
            "type": "Literal",
            "value": "finget",
            "raw": "'finget'"
          }
        }
      ],
      "kind": "var"
    }
  ],
  "sourceType": "script"
}
~~~
生成ast的过程中如果遇到不符合语法规则的代码，比如错误位置，类型错误，将无法正确构建ast，此时会终止解析并排除`SyntaxError`语法错误。

### 字节码生成

可以用 `node --print-bytecode` 查看字节码。

机器码和字节码区别：
+ 抽象层面：计算机可直接执行的指令，二进制表示，和操作系统有关系；字节码介于源码和机器码之间。
+ 可执行性：机器码可以直接运行；字节码需要解释器或者即时编译器转化为机器码。
+ 可移植性：在不同操作系统上，机器码需要重新编译；字节码不需要
+ 硬件效率：机器码更高，由硬件直接执行；字节码需要经过解释器逐行转换，即时编译技术能在运行时动态编译成机器码，提高一些效率。

JIT：即时编译，一边解释，一边执行

+ js引擎增加了一个监视器，监控代码的运行情况，记录一行代码一共运行了多少次等。如果一行代码运行几次，会被标记为`warm`，如果运行了很多次，会被标记成`hot`。
+ 基线编译器：如果某行代码变成了warm，JIT就会把他送到基线编译器去编译，并存储编译结果，以后会用编译的结果替换这段代码的执行。
+ 优化编译器：如果某行代码变成了hot，JIT会把他送到优化编译器中，生成一个更快速且高效的代码。
例如：循环加一个对象属性时，假设它是 INT 类型，优先做 INT 类型的判断;
+ 反优化：即使前99个变量都是INT类型，可能第100个就不是INT了，这时JIT就会认为做出一个错误的判断并把优化的代码丢掉，执行过程又会回到解释器或者基线编译器。这也就是为什么js在执行过程中，会来回在机器码和字节码中来回转换。

### 作用域

作用域是一套规则，用来管理引擎如何查找变量。ES5之前只有全局作用域和函数作用域，ES6出现了块级作用域。块级作用域不是`{}`内的作用域，而是const/let关键字的作用域。

~~~js
var name = 'FinGet';

function fn() {
  var age = 18;
  console.log(name);
}
~~~

上述代码在解析的时候会确定作用域。
<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20a45dfbc56a4eb0943b5e9f301d190a~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp">

#### 词法作用域

~~~js
function fn() {
    console.log(myName)
}
function fn1() {
    const myName = " FinGet "
    fn()
}
var myName = " global_finget "
fn1()
~~~

上述代码的执行结果是`global_finget`，打印的是全局myName变量。虽然fn在函数fn1内部调用，但是fn1访问的作用域只能是自己的函数作用域和全局作用域。没有办法访问到fn1函数作用域内部的块级作用域中的变量。

词法作用域：变量的作用域由它在代码中声明的位置决定，与调用时的上下文无关。也就是说变量的作用域是在编译的时候确定的，不是在执行的时候确定的。

## 执行阶段

### 执行上下文

函数执行时，就会创建一个执行上下文，执行上下文是JS代码被解析和执行时所在环境的抽象概念。

JS有三种执行上下文类型：
+ 全局执行上下文
+ 函数执行上下文
+ eval

##### 创建阶段

在任意js代码被执行时，开始创建执行上下文：
+ 确定this指向
+ 词法环境
+ 变量环境

##### this指向

在全局上下文中，this指向全局对象，在浏览器中，this 的值指向 window 对象。 在函数执行上下文中，this 的值取决于函数的调用方式。如果它被一个对象引用调用，那么 this 的值被设置为该对象，否则 this 的值被设置为全局对象或 undefined（严格模式下）。

#### 词法环境

词法环境是一个包含标识符变量映射的结构。（标识符：变量/函数名称，变量：实际对象或者原始值的引用）两部分组成：
+ 环境记录器：存储变量 和 函数声明的实际位置
+ 对外部环境的引用：可以访问其外部词法环境（实现作用域链的重要部分）

词法环境有两种类型：
+ 全局环境：在全局执行上下文中，此时对外部环境的引用为null。拥有一个全局对象（window），及其关联的方法和属性以及用户定义的全局变量，this指向这个全局对象
+ 函数环境：用户在函数中定义的变量在这里存储，对外部环境的引用可能为全局环境也有可能为函数环境  
  + 环境记录器还包含了一个 arguments对象，该对象包含了索引和传递给函数参数的映射以及参数的长度。

#### 变量环境

也是一个词法环境，区别：
+ 变量环境组件登记`var`,`function`声明
+ 词法环境登记`let`,`const`,`class`声明

变量环境和词法环境的同时出现是为了，实现块级作用域的同时不影响var变量声明和function函数声明。

示例代码：
~~~js
let a = 20;  
const b = 30;  
var c;

function multiply(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = multiply(20, 30);
~~~

执行上下文对象：
~~~js
// 全局执行上下文
GlobalExectionContext = { 

  ThisBinding: <Global Object>,
  // 全局上下文中的词法环境
  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      a: < uninitialized >,  
      b: < uninitialized >,  
      multiply: < func >  
    }  
    outer: <null>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      c: undefined,  
    }  
    outer: <null>  
  }  
}
// 函数执行上下文
FunctionExectionContext = {  
   
  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      Arguments: {0: 20, 1: 30, length: 2},  
    },  
    outer: <GlobalLexicalEnvironment>  // 指定全局环境
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      g: undefined  
    },  
    outer: <GlobalLexicalEnvironment>  
  }  
}
~~~

仔细看上面的：a: < uninitialized >,c: undefined。所以你在let a定义前console.log(a)的时候会得到Uncaught ReferenceError: Cannot access 'a' before initialization。

在编译阶段，发生了变量提升，变量声明会被提升到当前作用域顶部。如果是var声明的变量提升到全局作用域或者函数作用域顶部，并会赋值undefined。如果是const或者let声明的变量，会被提升到块级作用域的顶部，但不会初始化，所以声明之前使用会报错ReferenceError（运行时才报错）

#### 执行栈

每个函数都会有自己的执行上下文，多个执行上下文就会以栈的方式来管理。

## V8垃圾回收

### 内存分配

#### 栈

+ JS基本类型数据（Number、Boolean、String、Null、Undefined、Symbol、BigInt）保存在栈
+ 栈是临时存储空间，内容小存储连续，由系统进行自动分配和垃圾回收，所以垃圾回收机制是基于下面的堆内存而言。
+ 为什么基本类型存储在栈？
  + JS需要栈维护程序运行期间执行上下文的状态，如果栈空间大了，所有数据都存放在栈空间，会影响上下文切换效率。

#### 堆

+ 存储引用类型数据，是GC工作的地方
+ 不是所有的堆内存都会发生垃圾回收，只有新生代和老生代被GC管理。
+ 堆的分类
  + 新生代
  + 老生代
  + 大对象空间：这是比空间大小还要大的对象，大对象不会被gc处理。
  + 代码空间：这里是JIT所编译的代码。这是除了在大对象空间中分配代码并执行之外的唯一可执行的空间
  + map空间：存放 Cell 和 Map，每个区域都是存放相同大小的元素，结构简单。

### 代际假说

+ 第一个是大部分对象在内存中存在的时间很短，简单来说，就是很多对象一经分配内存，很快就变得不可访问；
+ 第二个是不死的对象，会活得更久。

v8引擎会把堆分为新生代和老生代：
+ 新生代存放生存时间短的对象，老生代存放存活时间长的对象
+ 新生代只支持1-8M容量，老生代支持更大容量

### 新生代垃圾回收

+ 先将新生代一分为二，处于使用状态的为使用区，处于空闲状态的为空闲区
+ 新加入对象会放入使用区，当使用区快写满，执行一次垃圾回收
+ 垃圾回收，新生代回收会给使用区中所有活动对象做标记，再把使用区的活动对象复制到空闲区
+ 垃圾清理使用区后，反转使用区和空闲区
+ 另一种情况：当复制一个活动对象到空闲区占用空间超过25%，直接晋升到老生代

### 老生代垃圾回收

用标记整理算法清除老生代垃圾：
+ 标记阶段：从一组根元素开始，地柜遍历，遍历过程中到达的元素被称为活动区，没有到达的元素就可以判断为非活动对象
+ 清除阶段：老生代垃圾回收器会直接将非活动对象，也就是数据清理掉
+ 标记清除算法在清除后会产生大量不连续的内存碎片，而标记整理在算法标记结束后，会将活着的对象（即不需要清理的对象）向内存的一端移动

### 并行回收

全停顿：垃圾回收如果耗费时间，那么主线程的JS操作就要停下来等待垃圾回收完成继续执行，我们把这种行为叫做全停顿（Stop-The-World）。

并行，也就是同时的意思，它指的是垃圾回收器在主线程上执行的过程中，开启多个辅助线程，同时执行同样的回收工作

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f0eef6c0d3bd49659a564fe698d17f43~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp">



