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

