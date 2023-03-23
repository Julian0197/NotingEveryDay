const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";
class MyPromise {
  /**
   *
   * @param {function} executor 执行器函数（同步执行）(resolve, reject) => {}
   */
  constructor(executor) {
    // 初始化值
    this.initValue();
    // 初始化this指向
    this.initBind();
    // 立即同步执行executor函数
    executor(this.resolve, this.reject);
  }

  initValue() {
    this.status = PENDING;
    this.result = null;
    this.callbacks = [];
  }

  // resolve和reject的this永远指向当前MyPromise的实例
  initBind() {
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }

  /**
   * executor内部成功时调用的函数
   * @param {*} value
   */
  resolve(value) {
    // 当前状态不是pending，直接结束
    if (this.status !== PENDING) return;
    this.status = RESOLVED;
    this.result = value;
    // resolve在异步任务中，执行then时还处于pending状态，此时要保存回调函数
    if (this.callbacks.length > 0) {
      // 一旦resolve执行，调用所有成功的回调函数
      // then中是微任务
      setTimeout(() => {
        this.callbacks.forEach((callbacksObj) => {
          callbacksObj.onResolved(value);
        });
      });
    }
  }

  /**
   * executor内部失败时调用的函数
   *  @param {*} reason
   */
  reject(reason) {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.result = reason;
    if (this.callbacks.length > 0) {
      // 一旦resolve执行，调用所有成功的回调函数
      setTimeout(() => {
        this.callbacks.forEach((callbacksObj) => {
          callbacksObj.onRejected(reason);
        });
      });
    }
  }

  /**
   *
   * @param {function} onResolved
   * @param {function} onRejected
   */
  then(onResolved, onRejected) {
    onResolved =
      typeof onResolved === "function" ? onResolved : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    return new MyPromise((resolve, reject) => {
      /**
       * 处理then传入的回调函数
       * then返回一个新的Promise对象
       * Promise的状态由回调函数的执行结果确定
       * @param {*} callback
       */
      function handle(callback) {
        // console.log("aaaa");
        // console.log(this);
        try {
          const result = callback(this.result);
          if (result instanceof MyPromise) {
            // 如果返回一个Promise，由新Promise的状态决定
            result.then(resolve, reject);
          } else {
            // 返回值，就返回一个成功状态的Promise
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }
      if (this.status === PENDING) {
        // pending状态说明，执行器函数是异步任务，要保存回调函数
        this.callbacks.push({
          onResolved: () => handle.call(this, onResolved),
          onRejected: () => handle.call(this, onRejected),
        });
      } else if (this.status === RESOLVED) {
        // then是微任务，用settimeout包裹
        setTimeout(() => {
          // console.log("-----");
          // console.log(this);
          // 直接调用handle，this为undefined
          handle.call(this, onResolved);
        });
      } else {
        setTimeout(() => {
          handle.call(this, onRejected);
        });
      }
    });
  }

  // catch直接执行reject
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  // Promise.all
  all(arr) {
    return new Promise((resolve, reject) => {
      try {
        const results = [] // 接受每个Promise返回的结果
        let count = 0 // Promise的总数
        let resolvedCount = 0 // 记录已完成的数量
        for (const p of arr) {
          // 要保证数组有序存放Promise的值
        }
      }
    })
  }
}

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject("error");
  }, 1000);
})
// global.name = "node.js";
// console.log(this);
