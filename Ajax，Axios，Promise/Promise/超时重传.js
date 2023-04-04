// 异步模拟tcp超时重传
// 假设最大请求次数是5次，每次最大请求延迟时间是5s。

// 第一次请求，延时6s,失败次数1
// 第二次请求，延时又6s,失败次数2
// 第三次请求，3s，成功。

// 上面是一个超时重传的例子，如果数据请求次数在5次包含5的次数内请求成功，则请求成功。否则一直请求，当请求次数大于5时，返回失败。

/**
 *
 * @param {*} times 一次请求的最大响应时间
 * @param {*} limit 最大超时请求次数
 * @param {*} fn 资源加载函数
 * @returns
 */
function load(times, limit, fn) {
  return new Promise((resolve, reject) => {
    let num = 0; //重传的次数
    let statue = false; //请求的状态
    let timer = null; //定时器

    //一次请求的统计
    function request() {
      let timers1 = Date.now();
      fn().then((res) => {
        let timers2 = Date.now();
        if (timers2 - timers1 < times) {
          statue = true;
          resolve(res);
        }
      });
    }

    //一开始就异步加载数据
    request();

    //定时器轮询模拟超时重传
    timer = setInterval(() => {
      //请求成功了
      if (statue) {
        clearInterval(timer);
        return;
      }

      //请求次数超过限制，错误
      if (num >= limit) {
        clearInterval(timer);
        reject("请求次数过多");
        return;
      }
      //继续请求
      console.log(`第${num + 1}次请求失败，重新请求中...`);
      request();
      num++;
    }, times);
  });
}

//模拟资源请求
function fn() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("ok");
    }, Math.random() * 10000);
  });
}

//主函数调用
load(1000, 3, fn)
  .then((msg) => {
    console.log(msg);
  })
  .catch((err) => {
    console.log(err);
  });

  // 1.定义一个request，立即执行，根据开始时间和结束时间判断是否超时
  // 2.定义status表示总的状态，count代表总的请求次数
  // 3.开启全局轮播器，每隔一段时间执行request
  // 如果当前成功请求了清除定时器，请求次数超过限制就报错并退出，否则继续轮播请求。
