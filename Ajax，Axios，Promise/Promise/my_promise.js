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
  /**
   *
   * @param {Array} arr
   * 传入数组，执行数组中的promise，只有个全部成功才返回成功的列表，否则返回失败的原因
   * @returns
   */
  static all(arr) {
    return new MyPromise((resolve, reject) => {
      const results = []; // 接受每个Promise返回的结果
      let count = 0; // Promise的总数
      arr.forEach((p, index) => {
        p.then((res) => {
          results[index] = res;
          count++;
          if (count === arr.length) {
            resolve(results);
          }
        }).catch((reason) => {
          reject(reason);
        });
      });
    });
  }

  finally() {
    
  }

  /**
   *
   * @param {Array} arr promsie列表
   * 和Promise.all不同，无论失败还是成功都会返回一个数组，数组中有状态和promise结果
   */
  static allSettled(arr) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;
      arr.forEach((p, index) => {
        p.then(
          (res) => {
            results[index] = { status: "resolved", value: res };
            count++;
            if (count === arr.length) {
              resolve(results);
            }
          },
          (reason) => {
            results[index] = { status: "rejected", value: reason };
            count++;
            if (count === arr.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }

  // 哪一个promise好了，就返回那个promise结果，终止其他的
  static race(arr) {
    return new MyPromise((resolve, reject) => {
      arr.forEach((p) => {
        p.then((value) => {
          resolve(value)
        }, (reason) => {
          reject(reason)
        });
      });
    });
  }
}

const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("11");
  }, 2000);
});
const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // reject("error");
    resolve("22");
  }, 1000);
});
// global.name = "node.js";
// console.log(this);

// const p = MyPromise.allSettled([p1, p2]);
// setTimeout(() => {
//   console.log(p.result);
// }, 3000);
// const p = MyPromise.allSettled([p1, p2]);
// setTimeout(() => {
//   console.log(p.result)
// }, 3000);

const pr = MyPromise.race([p1, p2]);
setTimeout(() => {
  console.log(pr.result);
},3000);