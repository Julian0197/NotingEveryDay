/*
自定义Promise模块:IIFE 立即调用函数表达式 
*/

// 不能用ES6的 CommonJS模块语法，要先编译成ES5
// 因为浏览器无法识别ES6语法

(function (window) {

  const PENDING = 'pending' 
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'

  /*
  Promise构造函数
  excutor：执行器函数(同步执行)
  */
  function Promise(excutor) {
    const self = this // 把当前promise对象保存起来
    self.status = PENDING // status属性默认PENDING
    self.data = undefined // data用于存储结果数据 
    self.callbacks = [] // 存储结构：[{onResolved(){},onRejected(){}},{onResolved(){},onRejected(){}}]

    function resolve(value) {
      if(self.status !== PENDING) return;	
      // 将状态改为resolved
      self.status = RESOLVED
      // 保存value数据
      self.data = value
      // 如果有待执行的callback函数，立即异步执行回调函数onResolved
      if (self.callbacks.length > 0) {
        setTimeout(() => { // 放入队列中执行所有成功的回调
         self.callbacks.forEach(callbacksObj => {
          callbacksObj.onResolved(value)
         }); 
        });
      }
    }

    function reject(reason) {
      if(self.status !== PENDING) return;	
      // reject和resolve直接调用，所以this指向window不指向promise对象
      self.status = REJECTED
      self.data = reason
      if (self.callbacks.length > 0) {
        setTimeout(() => {
          self.callbacks.forEach(callbacksObj => {
            callbacksObj.onRejected(reason)
          })
        });

      }
    }

    // 立即同步执行excutor
    try {
      excutor(resolve, )
    } catch (error) { // 执行器抛出异常，promise对象变为rejected状态
      reject(error)
    }
    
  }

  /* 
  Promise原型对象的then()
  指定成功或失败的回调函数
  返回一个新的promsie对象,结果由回调函数执行结果确定
  */
  Promise.prototype.then = function(onResolved, onRejected) {
    const self = this
    // 如果没有传回调函数，直接把值传递下去
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    // 实现异常穿透，指定失败的回调
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}
     
    // 返回一个新的Promsie对象
    return new Promise((resolve, reject) => {

      /**
       * 调用指定回调函数处理(onResolved/onRejected)，根据执行结果，改变return的promise的状态
       * 
       */
      function handle(callback) {
          /**
          * 1.抛出异常，新promise失败，reason为error
          * 2.回调函数返回的不是promise，新promise成功，value就是返回的值
          * 3.回调函数返回的是promise，return的promsie结果就是这个promise的结果
          */
          try {
            const result = callback(self.data) 
            if (result instanceof Promise) {
            //   result.then(
            //     value => { // 回调函数中promise成功的值
            //       resolve(value) // 让return的promise成功
            //     },
            //     reason => reject(reason) // result失败，让return的promsie也失败
            //   )
            // } else {
            //   resolve(result)
              result.then(resolve, reject)
            } else { 
              resolve(result)
            }
          } catch (error) {
            reject(error)
          }
      }


      if (self.status === PENDING) {
        // 假设当前状态还是pending，要保存回调函数
        // 回调函数执行完毕后，还需要修改return的promise的状态
        // 这里没有设置异步执行的原因是：回调函数的执行是在构造函数中，在构造函数中已经指定了是异步的
        // 
        self.callbacks.push({
          onResolved() {
            handle(onResolved)
          },
          onRejected() {
            handle(onRejected)
          }
        })
      } else if (self.status === RESOLVED) {
        // 如果当前状态是resolved，异步执行onResolved并改变return的promise状态
        setTimeout(() => {
          handle(onResolved)
        });
      } else { // rejected
          // 如果当前状态是rejected，异步执行onRejected并改变return的promise状态
          setTimeout(() => {
            handle(onRejected)
          });
      }
    })
  
  }

  /* 
  Promise原型对象的catch()
  指定失败的回调函数
  返回一个新的promise对象
  */  
  Promise.prototype.catch = function(onRejected) {

  }

  /* 
  Promise函数对象resolve方法
  返回一个指定结果的成功的promise
  */  
  Promise.resolve = function(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resolve, reject)
      } else {
        resolve(value)
      }
    })
  }

  /* 
  Promise函数对象reject方法
  返回一个指定结果的失败的promise
  */  
  Promise.reject = function(reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }  

  /* 
  Promise函数对象all方法
  返回一个promise，只有当所有promise都成功时才成功，否则失败
  */  
  Promise.all = function(promises) {
    let count = 0 // 用来表示成功promsie的数量
    const values = new Array(promsies.length) // 用来保存所有成功value的数组
    return new Promise((resolve, reject) => {
      promises.forEach((p, index) => { //获取promises数组中每一个元素的结果
        Promise.resolve(p).then(
          value => {
            ++count
            values[index] = value //异步任务完成时间不一样，需要按照promises数组的顺序放
            if (count === promises.length) { //所有成功再执行resolve
              resolve(values)
            }
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  } 

  /* 
  Promise函数对象race方法
  返回一个promise，其结果由第一个完成的promise决定  
  */  
  Promise.race = function(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((p, index) => {
        Promise.resolve(p).then(
          value => {
            resolve(value)
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  } 

  /**
   * 自定义方法：延迟返回一个成功或失败的promise
   */
  Promise.resolveDelay = function(value, timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value instanceof Promise) {
          value.then(resolve, reject)
        } else {
          resolve(value)
        }
      }, timeout);
    })
  }

  // 自定义方法延迟返回一个失败的promise
  Promise.rejectDelay = function(reason, timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(reason)
      }, timeout);
    })
  }

  // 向外暴露Promise函数 
  window.Promise = Promise
})(window)