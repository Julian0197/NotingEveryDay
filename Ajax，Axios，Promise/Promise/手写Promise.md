### Promise构造函数

+ 参数是excutor执行器
+ 返回一个promise

**思路**

1. 执行器函数是同步执行的。执行器函数接受连个参数：resolve和reject函数。这两个函数谁调用，由使用者传入的executor执行器函数决定的。
2. 构造函数包含属性保存当前状态，存储状态改变时的数据，存储指定的回调函数（回调函数可能由多个）

> 注意：
>
> 1. 执行器函数中是同步任务时，会先改变状态，同时执行数据。此时回调函数没有指定，需要先保存状态
> 2. 执行器函数中是异步任务时，会先指定回调函数，后改变状态和指定数据。此时不知道调用哪个回调函数，需要将回调函数保存
> 3. 当promise改变为对应状态时指定的多个回调函数都会调用

3. resolve函数(reject函数类似)

   1. 将当前pending状态改为resolved
   2. 保存resolve函数指定的数据
   3. 如果此时有待执行的回调函数（情况2），那么依次执行异步任务执行成功的回调函数。   – 这里应该放在微队列里，自定义的时候采用的放在宏队列里

   `回调函数存储的结构[{onResolved(){},onRejected(){}},{onResolved(){},onRejected(){}}]`

4. 如果excutor抛出异常，此时promise的状态应该是失败的，可以在捕获到异常之后，使用reject函数改变状态

### Promise.prototype.then / Promise.prototype.catch

+ 参数有两个，一个成功的回调函数onResolved和一个失败的回调函数onRejected
+ 返回一个新Promise对象，该Promise的状态由zhen的执行结果决定

**思路**

1. 如果当前promise的状态是pending。说明构造器函数中是异步任务，先指定回调函数，后改变状态，此时回调函数需要被存储

2. 如果当前promise的状态是resolved，说明构造器函数中是同步函数，状态发生改变，可以直接按照回调队列的顺序执行回调函数

3. promise.then()返回的新promise结果状态（如果新promise是pending状态，呢么就不支持链式调用了）

   **由then指定的回调函数执行的结果决定**

   1. 如果抛出异常，新promise变为rejected，reason为抛出的异常
   2. 如果返回的是非promise的任意值，新promise变为resolved，value为返回值
   3. 如果返回的是另一个新的promise，此promsie的结果由新promise的结果决定

4. 需要接收回调函数的结果，结果可能是非promise的任意值或者新promise，所以需要判断返回值类型。如果是新promise，由新promise的结果决定，promise的结果由then获取

5. 不管是先改变状态还是先指定回调函数，当最后回调触发时，都需要获取回调函数的结果，**因为需要根据回调函数的结果确定返回的promsie的状态**

6. then可以不传失败的回调，需要将异常传递下去。如果成功的回调不是函数，将value传递下去

### Promise.resolve()和Promise.reject()

#### Promise.resolve()

+ 参数可以是一般值，也可以是Promise对象
+ 返回的Promise状态由参数决定、
  + 如果参数是一般值，返回的promise成功，值为value
  + 如果参数是成功的promise，返回的promise成功，值为value
  + 如果参数是失败的promise，返回的promise失败，值为reason

#### Promise.reject()

参数为reason，不考虑promise对象的情况

### Promise.all()/Promise.race()的实现 ★ 面试常考

#### Promise.all()

+ 参数是一个数组
  + 数组中如果为值，说明该值为成功的value
+ 返回一个promise，只要数组中有一个失败，立即返回失败的promise
  + 如果都成功，值为一个成功值组成的数组
  + 如果有失败，值为第一个失败的promise值

**思路**

1. 返回一个promise，promsie结果由数组中的元素执行结果确定

2. 依次取出数组中元素的执行结构，用Promise.resolve()，执行promises中每个结果，再使用.then()处理成功或失败的值

   `Promise.resolve(元素)
   如果参数一般值，promise成功，值为参数值
   如果参数是成功的promise，返回的promise成功，值为value
   如果参数是失败的promise，返回的promise失败，值为reason
   所以不管对于promis还是值来说再套一层都没关系`

#### Promise.race()

+ 参数是数组
  + 数组的元素可以为值也可以为promise
  
+ 返回一个promise，结果由第一个完成的promise结果决定

  
  
  
  

