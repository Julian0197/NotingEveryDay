/**
 * 自定义Promise函数模块：IIFE（立即调用函数表达式）
 */

(function (window) {

  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'

  class Promise {
    /**
     * Promise构造函数
     * @param {function} executor 执行器函数（同步执行）(resolve, reject) => {}
     */
    constructor(executor) {

      const self = this //保存当前实例对象
      self.status = PENDING
      self.data = null
      self.callbacks = []

      /**
       * executor内部成功时调用的函数
       * @param {*} value  
       */
      function resolve(value) {
        //当前状态不是pending，直接结束
        if (self.status !== PENDING) return
        self.status = RESOLVED
        self.data = value
        if (self.callbacks.length > 0) {
          // 当执行器函数中是异步任务，会先保存回调函数
          // 执行完毕后，调用回调函数，在这里面return 一个新的promise，并根据执行结果改变状态
          setTimeout(() => {
            self.callbacks.forEach(callbacksObj => {
              callbacksObj.onResolved(value)
            })
          })
        }
      }

      function reject(reason) {
        if (self.status !== PENDING) return
        self.status = REJECTED
        self.data = reason
        if (self.callbacks.length > 0) {
          setTimeout(() => {
            self.callbacks.forEach(callbacksObj => {
              callbacksObj.onRejected(reason)
            })
          })
        }
      }
      // 立即同步执行executor函数
      try {
        executor(resolve, reject)
      } catch (error) { // 执行器抛出异常，promsie状态为rejected
        reject(error)
      }
    }


    /**
     * Promise的原型对象的then方法
     * @param {function} onResolved 
     * @param {function} onRejected 
     */
    then (onResolved, onRejected) {
      // 指定默认的成功回调，如果不是函数，指定为一个return value的函数
      onResolved = typeof onResolved === 'function' ? onResolved : value => value 
      // 指定默认的失败回调，如果不是函数，指定为一个return {throw reason}的函数
      // then可以不传失败的回调函数，但需要把error传递下去
      onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}
      const self = this

      return new Promnise((resolve, reject) => {
        /**
         * 调用指定回调函数处理，根据执行结果，改变return的promise的状态
         * @param {function} callback 指定的成功或者失败的回调函数
         */
        function handle(callback) {
          try {
            const result = callback(self.data)
            if (result instanceof Promise) {
              result.then(resolve, reject)
            } else {
              resolve(result)
            }
          } catch (error) {
            reject(error)
          }
        }

        if (self.status === PENDING) { // pending状态，说明执行器函数中是异步任务，将回调函数保存
          self.callbacks.push({ // 等异步任务结束后，调回调函数，同时要改变return的promise的状态
            onResolved() {
              handle(onResolved)
            },
            onRejected() {
              handle(onRejected)
            }
          })      
        } else if (self.status === RESOLVED) { // 状态改变，直接异步执行对应的回调函数
          setTimeout(() => {
            handle(onResolved)
          });
        } else {
          setTimeout(() => {
            handle(onRejected)
          });
        }
      })
    }

    catch (onRejected) {
      return this.then(undefined, onRejected)
    }

    /**
     * Promise函数对象的resolve方法，类方法用static关键字
     * @param {*} value 
     */
    static resolve(value) {
      return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
          value.then(resolve, reject)
        } else {
          resolve(value)
        }
      })
    }
    
    static reject(reason) {
      return new Promise((resolve, reject) => {
        reject (reason)
      })
    }
  }

})(window)