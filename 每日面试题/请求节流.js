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

// 场景一：同时只有一个在进行中的请求，一个结束后再进行下一个
const queue1 = [];
function fetchOnlyOne(index) {
  if (queue1.length > 0) {
    const request = queue1.pop();
    queue1.push(request.then(() => fetch(index, "one")));
  } else {
    queue1.push(fetch(index, "one"));
  }
}
// fetchOnlyOne(1);
// fetchOnlyOne(2);
// fetchOnlyOne(3);
// fetchOnlyOne(4);

// 场景二：假设同时可以有两个请求，要求在尽可能短的时间内完成所有请求该怎么办？
// const callbackQueue = []
// const requestQueue = []
// function fetchOnlyTwo(index) {
//   if (callbackQueue.length < 2) {
//     callbackQueue.push(fetch(index, 'two'))
//   }
// }
// fetchOnlyTwo(1);
// fetchOnlyTwo(2);
// fetchOnlyTwo(3);

Promise.race([fetch(1, 'two'), fetch(2, 'two')]).then(() => Promise.race([fetch(3, 'two'), fetch(4, 'two')]))