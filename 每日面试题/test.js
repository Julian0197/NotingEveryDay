// 模拟请求，无需修改
const now = Date.now();
function fetch(index, type) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        `[${index}] fetchOnly${type} end at: ${(Date.now() - now) / 1000}s`
      );
      resolve(index);
    }, (4 - index) * 1000);
  });
}
// fetch(1, "one");
// fetch(2, "one");
// fetch(3, "one");
// 场景一：同时只有一个在进行中的请求，一个结束后再进行下一个
// 是否有正在进行的请求
let isRequesting = false;
// 队列按顺序保存请求返回的Promise对象
const queue = [];

function fetchOnlyOne(index) {
  let requestPromise = fetch(index, "one")
  queue.push(requestPromise);
  // 没有其他请求执行
  if (!isRequesting) {
    request();
  }
}
function request() {
  if (queue.length > 0) {
    let curRequest = queue[0];
    curRequest.then(() => {
      isRequesting = true;
      queue.shift();
      request();
    });
  } else {
    isRequesting = false;
  }
}
fetchOnlyOne(1);
fetchOnlyOne(2);
fetchOnlyOne(3);
fetchOnlyOne(4);

// 场景二：假设同时可以有两个请求，要求在尽可能短的时间内完成所有请求该怎么办？
// function fetchOnlyTwo(index) {
//     fetch(index, 'two')
// }
// fetchOnlyTwo(1)
// fetchOnlyTwo(2)
// fetchOnlyTwo(3)
