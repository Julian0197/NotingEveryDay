const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  /**
   * 
   * @param {function} executor 执行器函数（同步执行）(resolve, reject) => {}
   */
  constructor(executor) {
    // 初始化值
    this.initValue()
    // 初始化this指向
    this.initBind()
    // 立即同步执行executor函数
    executor(this.resolve, this.reject)
  }

  initValue() {
    this.status = PENDING
    this.result = null
  }

  // resolve和reject的this永远指向当前MyPromise的实例
  initBind() {
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)
  }

  /**
   * executor内部成功时调用的函数
   * @param {*} value 
   */
  resolve(value) {
    // 当前状态不是pending，直接结束
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.result = value
  }

  /**
   * executor内部失败时调用的函数
   *  @param {*} reason
   */
  reject(reason) {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.result = reason
  }
}

const test1 = new MyPromise((resolve, reject) => {
  resolve('success')
})
console.log(test1)

