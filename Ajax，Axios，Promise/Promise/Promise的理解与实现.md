### 预备知识

#### 1.两种类型回调函数

**同步回调**

立即执行，完全执行完了才结束，不会放入回调队列中

~~~js
// 数组遍历相关的回调
const arr = [1, 3, 5];
arr.forEach(item => { // 遍历回调，同步回调，不会放入队列，一上来就要执行
  console.log(item);
})
~~~

**异步回调**

不会立即执行，会放入回调队列中将来执行

~~~js
// 定时器回调
setTimeout(() => { // 异步回调，会放入队列中将来执行
  console.log('timeout callback()')
}, 0)
console.log('setTimeout()之后')
// setTimeout()之后
// timeout callback()
~~~

~~~js
// Promise成功或失败的回调
new promise((resolve, reject) => {
    resolve(1)
}).then(
	value => {console.log('value', value)},
    reason => {console.log('reason', reason)}
)
console.log('----')
// ----
// value 1
~~~

js引擎先把初始化的同步代码都执行完成后，才执行回调队列中的代码

#### 2.js中的异常处理

**1.错误类型**

`Error`：所有错误的父类型

`RefreenceError`：引用的变量不存在

~~~js
console.log(a) // ReferenceError:a is not defined
~~~

`TypeError`：数据类型不正确

~~~js
let b
console.log(b.xxx)
// TypeError:Cannot read property 'xxx' of undefined

let c = {xxx: 1}
c.xxx()
// TypeError:c.xxx is not a function
~~~

`RangeError`：数据值不在所允许的范围内

~~~js
function fn() {
  fn()
}
fn()
// RangeError:Maximum call stack size exceeded
~~~

`SyntaxError`：语法错误

```javascript
const c = """"
// SyntaxError:Unexpected string
```

**2.错误处理（捕获与抛出）**

抛出错误：`throw error`

~~~js
function something() {
    if (Date.now()%2 === 1) {
        console.log('当前时间为奇数，可以执行任务')
    } else { //如果时间为偶数抛出异常，由调用来处理
        throw new Error('当前时间为偶数，无法执行任务')
    }
}
~~~

捕获错误：`try ... catch`

~~~js
// 捕获异常处理
try {
    something()
} catch (error) {
    alert(error.message)
}
~~~

**3.错误对象**

+ message属性：错误相关信息
+ stack属性：函数调用栈记录信息

~~~js
try {
  let d
  console.log(d.xxx)
} catch (error) {
  console.log(error.message)
  console.log(error.stack)
}
console.log('出错之后')
// Cannot read property 'xxx' of undefined
// TypeError:Cannot read property 'xxx' of undefined
// 出错之后
~~~

因为错误被捕获处理了，后面的代码才能运行下去，打印出‘出错之后

### Promise的理解和使用

#### 1.Promise是什么？

**1.理解Promise**

+ 抽象表达：Promise是JS中进行异步编程的新的解决方案（旧的解决方案是单纯使用回调函数）
+ 异步编程：fs文件操作 数据库操作 AjAX 定时器



+ 具体表达：**Promise是一个构造函数**，（自己身上有all、reject、resolve这几个方法，原型上有then、catch等方法）
+ 从功能上看：**promise对象用来封装一个异步操作并可以获取其成功或失败的结果值**



+ 其他解释：Promise是一个容器，里面保存着某个未来才会结束的事件的结果
+ 从语法上来说，Promise是一个对象，从他可以获取异步操作的消息
+ Promise提供统一的API，各种异步操作都可以用同样的方法进行处理

**2.Promise的状态**

实例对象promise中的一个属性PromiseState

1. pending（不确定）变为resolved/fulfilled（成功）
2. pending（不确定）变为rejected（失败）

注意：

+ 对象的状态不受外界影响
+ 只有上述两种，且一个promise对象只能改变一次
+ 一旦状态改变，就不会再变，任何时候可以得到这个结果
+ 无论成功或失败，都会有一个结果数据。成功的结果数据一般称为value，失败的结果一般称为reason

**3.Promise对象的值**

实例对象promise的另一个值PromiseResult

保存着 对象成功/失败的值（value/reason)

**4.Promise基本流程**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210210134357696.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDk3MjAwOA==,size_16,color_FFFFFF,t_70)

~~~js
const promise = new Promise(function(resolve, reject) {
  // ... some code
  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(reason);
  }
});
~~~

Promise构造函数接受一个函数（执行器函数）作为参数，该函数的两个参数分别是resolve和reject。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数value传递出去；
reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数error/reason传递出去。

`Promise`实例生成以后，可以用`then`方法分别指定`resolved`状态和`rejected`状态的回调函数。

~~~js
promise.then(function(value) {
  // success
}, function(reason) {
  // failure
});
~~~

then方法可以接受两个回调函数作为参数。
第一个回调函数onResolved()是Promise对象的状态变为resolved时调用
第二个回调函数onRejected()是Promise对象的状态变为rejected时调用
这两个函数都是可选的，不一定要提供。它们都接受Promise对象传出的值作为参数

~~~js
// 创建Promise的实例对象
const p = new Promise((resolve, reject) => { // 执行器函数	
    // 执行异步操作任务
    setTimeout(() => {
        const time = Date.now()
        // 如果当前时间是偶数代表成功，否则失败
        if (time % 2 === 0) {
            // 成功，调用resolve(value)
            resolve('成功的数据, time=' + time)
        } else {
            // 如果失败，调用reject(reason)
            reject('失败的数据, time=' + time)
        }
    }, 1000) 
})

p.then(
	value => {// 接收得到成功的value数据onResolved 
        console.log('成功的回调', value)
    },
    reason => {// 接收得到失败的reason数onRejected
        console.log('失败的回调', reason)
    }
)
~~~

.then() 和执行器(executor)同步执行，.then() 中的回调函数异步执行

#### 2.为什么使用Promise？

1. **指定回调函数的方式更加灵活**

纯回调函数：异步任务执行结束后就得不到状态了。必须先定义好成功和失败的回调函数，在异步操作之前将这两个函数传入，然后在异步函数内调用这两个回调函数

使用Promise可以在接受异步返回结果后，再通过then指定回调函数，异步任务执行的状态（PromiseState）和值（PromiseResult）一直在

~~~js
// 1. 纯回调的形式
// 成功的回调函数
function successCallback(result) {
  console.log("声音文件创建成功：" + result);
}
// 失败的回调函数
function failureCallback(error) {
  console.log("声音文件创建失败：" + error);
}
// 必须先指定回调函数，再执行异步任务
createAudioFileAsync(audioSettings, successCallback, failureCallback) // 回调函数在执行异步任务（函数）前就要指定
~~~

promise：启动异步任务 => 返回promise对象 => 给promise对象绑定回调函数(甚至可以在异步任务结束后指定)

~~~js
// 2. 使用Promise
const promise = createAudioFileAsync(audioSettings);  // 执行2秒
setTimeout(() => {
  promise.then(successCallback, failureCallback) // 也可以获取
}, 3000);
~~~

2. 支持链式调用，解决回调地狱问题

**回调地狱**：回调函数嵌套调用，外部回调函数异步执行的结果是内部嵌套的回调函数执行的条件

**缺点**：不便于阅读，异常处理麻烦

**解决方案**：promis链式调用解决回调地狱

~~~js
doSomething()
  .then(result => doSomethingElse(result))
  .then(newResult => doThirdThing(newResult))
  .then(finalResult => {console.log('Got the final result:' + finalResult)})
  .catch(failureCallback)
~~~

**终极解决方法**：async/await

async await进一步优化Promise的写法，async函数始终返回一个Promise，await可以实现一个 等待 的功能

async await被称为异步编程的终极解决方案，可以用同步的形式书写异步代码，并且能更优雅地实现异步代码顺序执行

**async function**

async是异步的简写

函数的返回值是Promise对象，Promise对象的结果由async函数执行的返回值决定

**await expression**

await相当于then的语法糖，直接拿到结果，会阻塞后面的代码

当await后面的表达式是Promise，得到Promise结果，否则得到的结果就是他本身

**注意**：

+ **await必须放在async函数里面**
+ **await只能得到成功的结果，失败的结果需要try-catch**
+ **try-catch只能捕获同步代码，不能捕获异步代码。但在async函数内，使用await可以捕获异步代码，这里实际上是异步代码变成了同步代码。**

~~~js
async function request() {
  try{
    const result = await doSomething()
    const newResult = await doSomethingElse(result)
    const finalResult = await doThirdThing(newResult)
    console.log('Got the final result:' + finalResult)
  } catch (error) {
    failureCallback(error)
  }
}
~~~

**async-await和promise的关系**

async-await 是建立在 promise机制之上的，并不能取代其地位。

1. 执行async函数，返回的是Promise对象
2. await相当于Promise的then，如果后面跟Promise，可以获取Promise成功的值
3. try-catch可以捕获异常，代替了Promise的catch
4. async await是异步编程的终极解决方案，用**同步的形式**书写异步代码

async函数代码执行是同步的，结果返回是异步的

async函数总会返回一个Promise实例，调用一个async函数，可以理解为里边的代码都是出于new Promise 中。所以是同步执行的，而最后返回的结果，相当于在Promise中调用resolve

#### 3.如何使用Promise

1. **Promise构造函数：**

+ `executor` 函数：同步执行 `(resolve, reject) => {异步操作的代码}`
+ `resolve`函数：内部定义成功时我们调用的函数 传入的参数给value
+ `reject`函数：内部定义失败时我们调用的函数 传入的参数给reason

**说明**：executor是执行器，会在Promise中立即同步回调，异步操作resolve/reject 就在executor中执行

2. **Promise.prototype.then方法 `p.then(onResolved, onRejected)`**

- `onResolved` 函数：成功的回调函数 `(value) => {}`
- `onRejected` 函数：失败的回调函数 `(reason) => {}`

**说明**：指定用于得到成功 `value` 的成功回调和用于得到失败 `reason` 的失败回调，**返回一个新的 `promise` 对象**

3. **Promise.prototype.catch方法 p.catch(onRejected)**

**说明**：这是then的语法糖，相当于then(undefined, onRejected)，**返回一个新的`promise`对象**

~~~js
new Promise((resolve, reject) => { // excutor执行器函数
 setTimeout(() => {
   if(...) {
     resolve('成功的数据') // resolve()函数
   } else { 
     reject('失败的数据') //reject()函数
    }
 }, 1000)
}).then(
 value => { // onResolved()函数
  console.log(value) // 成功的数据
}
).catch(
 reason => { // onRejected()函数
  console.log(reason) // 失败的数据
}
)
~~~

 4. **Promise.resolve 方法：`Promise.resolve(value)`**

+ `value`：将被 `Promise` 对象解析的参数，也可以是一个成功或失败的 `Promise` 对象
+ 返回：返回一个带着给定值解析过的 Promise 对象，如果参数本身就是一个 Promise 对象，则直接返回这个 Promise 对象。

**当传入的参数为非Promise类型的对象，则返回的结果为成功Promise对象**

~~~js
let p1 = Promise.resolve(123)
console.log(p1) // Promise {<fulfilled>: 521}
~~~

**当传入的参数为Promise对象，则参数的结果决定了resolve的结果**

~~~js
let p2 = Promise.resolve(new Promise((resolve, reject) => {
    // resolve('succes') // 成功的Promise
    reject('fail')
}))
console.log(p2) // Promise {<rejected>: "fail"}
p2.catch(reason => {
    console.log(reason) // fail
})
~~~

5. **Promise.reject 方法：`Promise.resolve(reason)`**

+ reason: 失败的原因
+ 返回一个失败的Promise对象

~~~js
let p1 = Promise.reject(123)
let p2 = Promise.reject(new Promise((resolve, reject) => {
    resolve('ok')
}))
console.log(p1); // Promise{<rejected>: 123}
console.log(p2); // Promise{<rejected>: Promise}
~~~

+ Promise.resolve和Promise.reject方法是一个语法糖

+ 用来**快速得到Promise对象**

~~~js
//产生一个成功值为1的promise对象
new Promise((resolve, reject) => {
 resolve(1)
})
//相当于
const p1 = Promise.resolve(1)
const p2 = Promise.resolve(2)
const p3 = Promise.reject(3)

p1.then(value => {console.log(value)}) // 1
p2.then(value => {console.log(value)}) // 2
p3.catch(reason => {console.log(reason)}) // 3
~~~

6. **Promise.all 方法：`Promise.all(iterable)`**

+ `iterable`：包含n个promise的可迭代对象，如 `Array` 或 `String`

+ 说明：返回一个新的 `promise`，只有所有的 `promise` 都成功才成功，只要有一个失败了就直接失败

~~~js
const p1 = Promise.resolve(1)
const p2 = Promise.resolve(2)
const p3 = Promise.reject(3)

const pAll = Promise.all([p1, p2, p3])
const pAll2 = Promise.all([p1, p2])
//因为其中p3是失败所以pAll失败
pAll.then(
value => {
   console.log('all onResolved()', value)
 },
reason => {
   console.log('all onRejected()', reason) 
 }
)
// all onRejected() 3
pAll2.then(
values => {
   console.log('all onResolved()', values)
 },
reason => {
   console.log('all onRejected()', reason) 
 }
)
// all onResolved() [1, 2]
~~~

7. **Promise.race方法：`Promise.race(iterable)`**

+ `iterable`：包含n个promise的可迭代对象，如 `Array` 或 `String`

+ 说明：返回一个新的 `promise`，
+ **第一个完成的 `promise` 的结果状态就是最终的结果状态**
  **谁先完成就输出谁(不管是成功还是失败)**

~~~js
const pRace = Promise.race([p1, p2, p3])
// 谁先完成就输出谁(不管是成功还是失败)
const p1 = new Promise((resolve, reject) => {
 setTimeout(() => {
   resolve(1)
 }, 1000)
})
const p2 = Promise.resolve(2)
const p3 = Promise.reject(3)

pRace.then(
value => {
   console.log('race onResolved()', value)
 },
reason => {
   console.log('race onRejected()', reason) 
 }
)
//race onResolved() 2
~~~

### 几个关键问题

#### 1.如何改变promise的状态？

(1)`resolve(value)`：如果当前是 `pending` 就会变为 `resolved`

(2)`reject(reason)`：如果当前是 `pending` 就会变为 `rejected`

(3)抛出异常：如果当前是 `pending` 就会变为 `rejected`

~~~js
const p = new Promise((resolve, reject) => {
  //resolve(1) // promise变为resolved成功状态
  //reject(2) // promise变为rejected失败状态
  throw new Error('出错了') // 抛出异常，promise变为rejected失败状态，reason为抛出的error
})
p.then(
  value => {},
  reason => {console.log('reason',reason)}
)
// reason Error:出错了
~~~

#### 2.一个 promise 指定多个成功/失败回调函数，都会调用吗？

当 `promise` **改变**为对应状态时**都会调用**

~~~js
const p = new Promise((resolve, reject) => {
  //resolve(1)
  reject(2)
})
p.then(
  value => {}
  reason => {console.log('reason',reason)}
)
p.then(
  value => {},
  reason => {console.log('reason2',reason)}
)
// reason 2
// reason2 2
~~~

#### 3.改变Promsie状态和指定回调函数谁先谁后？

都有可能，常规是先指定回调再改变状态，但也可以先改状态再指定回调

~~~js
// 先指定的回调函数，当状态发生改变时，回调函数就会调用得到的数据
new Promise((resolve, reject) => {
    setTimeout(() => { // 后改变的状态（同时指定数据），异步执行回调函数
        resolve(1)
    }, 1000)
}).then( // 先指定回调函数，保存当前指定的回调函数
	value => {},
    reason => {console.log('reason', reason)}
)
~~~

~~~js
// 先改变状态，那当指定回调时，回调函数就会调用得到的数据
let p = new Promise((resolve, reject) => {
      resolve('OK'); // 先改变状态（同时指定数据）
});

p.then(value => { // 后指定回调函数，异步执行回调函数
  console.log(value);
},reason=>{
  
})
~~~

#### 4.promise.then() 返回的新 promise 的结果状态由什么决定？

**由then()指定的回调函数执行的结果决定**

1. 如果抛出异常，新Promise变为rejected，reason为抛出的异常
2. 如果返回的是非Promise的任意值，新Promise变为resolved，value为返回值
3. 如果返回的是另一个新的Promise，此Promise的结果由新Promise的结果决定

~~~js
new Promise((resolve, reject) => {
  resolve(1)
}).then(
  value => {
    console.log('onResolved1', value);
    // return 2 // 新Promise变为resolved，value=2
    // return Promsie.resolve(3) // 新Promise变为resolved，value=3
    // return Promsie.reject(5) // 新Promise变为rejected，value=5
    throw 7
  },
  reason => {
    console.log('onRejcted1', reason)
  }
).then(
  value => {
    console.log('onResolved2', value);
  },
  reason => {
    console.log('onRejected2', reason);
  }
)
// onResolved1 1
// onRejected2 7
~~~

#### 5.promise 如何串联多个操作任务？

(1)`promise` 的 `then()` 返回一个新的 `promise`，可以并成 `then()` 的链式调用

(2)通过 `then` 的链式调用串联多个同步/异步任务

**异步任务需要包装再Promise中，因为Promise可以先指定回调函数，后改变状态**

~~~js
new Promise((resolve,reject)=>{
	setTimeout(() => {
        console.log("执行任务1(异步)");
        resolve(1);
    }, 1000);
}).then(
    value =>{
        console.log("任务1的结果",value);
        console.log("执行任务2(同步)");
        return 2;
    }
).then(
    value =>{
        console.log('任务2的结果()',value);
        setTimeout(() => {
           console.log('执行任务3(异步)');
            return 3; // 异步任务没有包装再Promise中
        }, 1000);
    }
).then(
    //打印的时候异步3还没有执行完毕value=undefined; 
    value =>{
        console.log("任务3的结果",value);
    }
)
/*
执行任务1(异步)
time.html:20 任务1的结果 1
time.html:21 执行任务2(同步)
time.html:26 任务2的结果() 2
time.html:35 任务3的结果 undefined
time.html:28 执行任务3(异步)
*/

//异步任务3需要修改成
return new Promise((resolve,reject)=>{
    setTimeout(() => {
        console.log('执行任务3(异步)');
        resolve(3);
     }, 1000);}
)
~~~

#### 6.Promise异常穿透

当使用Promise的then链式调用时，可以在最后指定失败的回调

前面的任何操作**除了异常**，都会传到最后失败的回调中

~~~js
new Promise((resolve, reject) => {
   //resolve(1)
   reject(1)
}).then(
  value => {
    console.log('onResolved1()', value)
    return 2
  }
).then(
  value => {
    console.log('onResolved2()', value)
    return 3
  }
).then(
  value => {
    console.log('onResolved3()', value)
  }
).catch(
  reason => {
    console.log('onRejected1()', reason)
  }
)
// onRejected1() 1
~~~

相当于这种写法：多写了很多`reason => {throw reason}`

~~~js
new Promise((resolve, reject) => {
   //resolve(1)
   reject(1)
}).then(
  value => {
    console.log('onResolved1()', value)
    return 2
  },
  reason => {throw reason} // 抛出失败的结果reason
).then(
  value => {
    console.log('onResolved2()', value)
    return 3
  },
  reason => {throw reason} // 抛出失败的结果reason
).then(
  value => {
    console.log('onResolved3()', value)
  },
  reason => {throw reason} // 抛出失败的结果reason
).catch(
  reason => {
    console.log('onRejected1()', reason)
  }
)
// onRejected1() 1
~~~

失败是一层一层传递的，最后传递到catch中

或者，将 `reason => {throw reason}` 替换为 `reason => Promise.reject(reason)` 也是一样的

#### 7.中断Promise链

当使用 `promise` 的 `then` 链式调用时，在中间中断，不再调用后面的回调函数

办法：在回调函数中返回一个 `pending` 状态的 `promise` 对象

~~~js
new Promise((resolve, reject) => {
   //resolve(1)
   reject(1)
}).then(
  value => {
    console.log('onResolved1()', value)
    return 2
  }
).then(
  value => {
    console.log('onResolved2()', value)
    return 3
  }
).then(
  value => {
    console.log('onResolved3()', value)
  }
).catch(
  reason => {
    console.log('onRejected1()', reason)
  }
).then(
  value => {
    console.log('onResolved4()', value)
  },
  reason => {
    console.log('onRejected2()', reason)
  }
)
// onRejected1() 1
// onResolved4() undefined
~~~

为了在 `catch` 中就中断执行，可以这样写：

~~~js
new Promise((resolve, reject) => {
   //resolve(1)
   reject(1)
}).then(
  value => {
    console.log('onResolved1()', value)
    return 2
  }
).then(
  value => {
    console.log('onResolved2()', value)
    return 3
  }
).then(
  value => {
    console.log('onResolved3()', value)
  }
).catch(
  reason => {
    console.log('onRejected1()', reason)
    return new Promise(() => {}) // 返回一个pending的promise
  }
).then(
  value => {
    console.log('onResolved4()', value)
  },
  reason => {
    console.log('onRejected2()', reason)
  }
)
// onRejected1() 1
~~~

在 `catch` 中返回一个处于`pending`状态的 `promise`

由于，返回的新的 `promise` 结果决定了后面 `then` 中的结果，所以后面的 `then` 中也没有结果。

这就实现了中断 `promise链`的效果。
