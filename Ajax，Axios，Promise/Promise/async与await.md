### async与await

async await进一步优化Promise的写法，async函数始终返回一个Promise，await可以实现一个 等待 的功能

async await被称为异步编程的终极解决方案，可以用同步的形式书写异步代码，并且能**更简洁地实现异步代码顺序执行**，无需链式调用promise



**async function**

async是异步的简写，用来声明异步函数

**函数的返回值是Promise对象**，Promise对象的结果由async函数执行的返回值决定



**await expression**

await相当于**then的语法糖**，用来暂停异步函数代码的执行，等待promise解决

当await右侧的表达式是Promise（或值），返回的是Promise成功的值，否则得到的结果就是他本身

**注意**：

+ **await必须放在async函数里面，但async可以没有await**
+ **await只能得到成功的结果，如果await的promise失败，就会抛出异常，需要try-catch**
+ **try-catch只能捕获同步代码，不能捕获异步代码。但在async函数内，使用await可以捕获异步代码，这里实际上是异步代码变成了同步代码。**



**用promise存在的一个问题**

~~~js
let p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(3)
    }, 1000)
})
// 如果程序中的其他代码要在p可用时访问它，则需要写一个解决处理程序
p.then(x => console.log(p))
~~~



**async声明异步函数**

1. async函数返回值为promise对象
2. promise对象结果由async函数执行的返回值决定

~~~Js
// 返回一个不是Promise类型的对象 => 返回的是成功的Promise对象
async function fn() {
    return 1
}
// 等价于
function fn() {
    return Promise.resolve(1)
}
~~~

~~~js
// 抛出错误，返回的结果是一个失败的Promise
async function fn() {
    throw new Error('error')
}
// Promise {<rejected>: Error: error}
~~~

~~~js
// 返回一个Promise
async functuion fn() {
   return new Promise((resolve, reject) => {
    // resolve('成功的数据');
    reject('失败的数据');
  })
}
~~~

**await表达式**

异步函数主要针对不会马上完成的任务，所以自然需要一种暂停和恢复执行的能力，使用`await`关键字可以暂停异步函数代码的执行，等待期约解决

~~~js
const promise = new Promise((resolve, reject) => {
    reject(1)
})

async function main(){
  try {
    let result = await promise;
    console.log(result); // 成功的值
  } catch(e){
    console.log(e); // 失败的数据
  }
}
main() 
~~~

**async与await解决上面的*问题**

~~~js
async function foo() {
	let p = new Promise((resolve, reject) => setTimeout(resolve, 1000, 3));
	console.log(await p);
}
foo(); // 3
~~~



**async-await和promise的关系**

async-await 是建立在 promise机制之上的，并不能取代其地位。

1. 执行async函数，返回的是Promise对象
2. await相当于Promise的then，如果后面跟Promise，可以获取Promise成功的值
3. try-catch可以捕获异常，代替了Promise的catch
4. async await是异步编程的终极解决方案，用**同步的形式**书写异步代码

async函数代码执行是同步的，结果返回是异步的

async函数总会返回一个Promise实例，调用一个async函数，可以理解为里边的代码都是出于new Promise 中。所以是同步执行的，而最后返回的结果，相当于在Promise中调用resolve

---
#### 迭代器实现async

利用ES6新增`Generator`迭代器语法，理解迭代器：
+ 一个状态机，封装了多个内部状态
+ 执行generator函数会返回一个遍历器对象，可以依次遍历每个状态
+ 和普通函数相比多了`*`,内部有`yield`函数，可以终止状态向后执行
+ 通过`next`方法可以切换到下一个状态，返回一个对象
  + `value`：yield后面的值
  + `done`：迭代器函数是否已经走完，true/false

##### generator基本用法
~~~js
 function* gen() {
  yield 1
  yield 2
  yield 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: undefined, done: true }
~~~

##### next函数传参

next方法传参可以通过yield接受：
+ 第一次next传参没用
+ 当 next 传入参数在上一次暂停的 yield 接收，在遇到下一个 yield 时会将 yield 后的返回值作为暂停点的对象返回

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c49ec193e19249d2876fba7909f89acc~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp"/>

~~~js
function* gen() {
  const num1 = yield 1
  console.log(num1)
  const num2 = yield 2
  console.log(num2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next(11111))
// 11111
//  { value: 2, done: false }
console.log(g.next(22222)) 
// 22222
// { value: 3, done: true }
~~~

##### Promise + next传参

fn返回一个promise对象，使用promise.then，在then的回调函数里面调用next方法继续遍历状态，并将上一个promise对象的返回值作为下一个next的参数传递。

~~~js
function fn(nums) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2)
    }, 1000)
  })
}
function* gen() {
  const num1 = yield fn(1)
  const num2 = yield fn(num1)
  const num3 = yield fn(num2)
  return num3
}
const g = gen()
const next1 = g.next()
next1.value.then(res1 => {
  console.log(next1) // 1秒后同时输出 { value: Promise { 2 }, done: false }
  console.log(res1) // 1秒后同时输出 2

  const next2 = g.next(res1) // 传入上次的res1
  next2.value.then(res2 => {
    console.log(next2) // 2秒后同时输出 { value: Promise { 4 }, done: false }
    console.log(res2) // 2秒后同时输出 4

    const next3 = g.next(res2) // 传入上次的res2
    next3.value.then(res3 => {
      console.log(next3) // 3秒后同时输出 { value: Promise { 8 }, done: false }
      console.log(res3) // 3秒后同时输出 8

       // 传入上次的res3
      console.log(g.next(res3)) // 3秒后同时输出 { value: 8, done: true }
    })
  })
})

~~~

##### 实现async/await

上方的generator函数的Promise+next传参，就很像async/await了，区别在于

+ gen函数执行返回值不是Promise，asyncFn执行返回值是Promise
+ gen函数需要执行相应的操作，才能等同于asyncFn的排队效果
+ gen函数执行的操作是不完善的，因为并不确定有几个yield，不确定会嵌套几次

1. 需要封装一个高阶函数，接受一个generator
   ~~~js
  function generatorToAsync(generatorFn) {
    // 包裹promise
    return function() {
      return new Promise((resolve, reject) => {
        const g = generatorFn() // gen的实例对象
        const next1 = g.next()
        next1.value.then(res1 => {
          const next2 = g.next(res1) // res1赋给上一次yield暂停的地方（num1 = res1）
          next2.value.then(res2 => {
            const next3 = g.next(next) // res2赋给上一次yield暂停的地方（nun2 = res2）
            next3.value.then(res3 => {
              // g.next(res3) = { value: num3(res3), done: true }
              resolve(g.next(res3).value) // res3赋给上一次yield暂停的地方（nun3 = res3）
            }) 
          })
        })
      })
    }
  
    return '具有async函数功能的函数'
  }

  function fn() {
    return new Promise(resolve => {
      setTimeout(() => {
          resolve(nums * 2)
        }, 1000)
    })
  }

  function* gen() {
    const num1 = yield fn(1)
    const num2 = yield fn(num1)
    const num3 = yield fn(num2)
    return num3
  }
  const async = generatorToAsync(gen)
  ~~~

  在上述基础上完善代码，因为一个async函数可能有多个await。类比，generator函数有多个yield。
  ~~~js
  function generatorToAsync(generatorFn) {
    return function() {
      const gen = generatorFn.apply(this, arguments) // gen可能要接受参数

      return new Promise((resolve, reject) => {
        // go调用迭代器对象的next方法，key='next'，arg为next方法传递的参数
        function go(key, arg) {
          let res
          try { // 使用try catch因为可能有reject状态的promise
            res = gen[key](arg)
          } catch(error) {
            return reject(error)
          }

          // 解构next返回的状态对象
          const { value, done } = res
          if (done) {
            // 已经遍历完所有状态
            retrn resolve(res)
          } else {
            // value有可能是常量，需要包裹成promise
            return Promise.resolve(value).then(
              val => go('next', val),
              err => go('throw', err)
            )
          }
        }
        go('next') // 第一次执行
      })
    }
  }
  const asyncFn = generatorToAsync(gen)
  asyncFn().then(res => console.log(res))
  ~~~

  实例：
  ~~~js
  // async await
  async function asyncFn() {
    const num1 = await fn(1)
    console.log(num1) // 2
    const num2 = await fn(num1)
    console.log(num2) // 4
    const num3 = await fn(num2)
    console.log(num3) // 8
    return num3
  }
  const asyncRes = asyncFn()
  console.log(asyncRes) // Promise
  asyncRes.then(res => console.log(res)) // 8
  ~~~
  ~~~js
  // generatorToAsync
  function* gen() {
    const num1 = yield fn(1)
    console.log(num1) // 2
    const num2 = yield fn(num1)
    console.log(num2) // 4
    const num3 = yield fn(num2)
    console.log(num3) // 8
    return num3
  }
  const genToAsync = generatorToAsync(gen)
  const asyncRes = genToAsync()
  console.log(asyncRes) // Promise
  asyncRes.then(res => console.log(res)) // 8
  ~~~