/**
 * 
 * @param {number} poolLimit 最大并发数
 * @param {Array} array 请求数组
 * @param {function} iteratorFn 每个 promise 中执行的异步操作。
 * @returns 
 */
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = []; // 用于存放所有的promise实例
  const executing = []; // 用于存放目前正在执行的promise
  for (const item of array) {
    const p = Promise.resolve(iteratorFn(item)); // 防止回调函数返回的不是promise，使用Promise.resolve进行包裹
    ret.push(p);
    if (poolLimit <= array.length) {
      // then回调中，当这个promise状态变为fulfilled后，将其从正在执行的promise列表executing中删除
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        // 一旦正在执行的promise列表数量等于限制数，就使用Promise.race等待某一个promise状态发生变更，
        // 状态变更后，就会执行上面then的回调，将该promise从executing中删除，
        // 然后再进入到下一次for循环，生成新的promise进行补充
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

// test
// 可以理解为发请求的通用函数，接受url
const curl = (i) => {
  console.log('开始' + i);
  return new Promise((resolve) => setTimeout(() => {
    resolve(i);
    console.log('结束' + i);
  }, 1000 + Math.random() * 1000));
};

/*
const curl = (i) => { 
  console.log('开始' + i);
  return i;
};
*/
let urls = Array(10).fill(0).map((v,i) => i);
(async () => {
    const res = await asyncPool(3, urls, curl);
    console.log(res);
 })();