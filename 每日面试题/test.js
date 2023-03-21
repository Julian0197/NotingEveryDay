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
function fetchOnlyOne(index) {
  
}
fetch(1, "one").then(fetch(2, "one")).then(fetch(3, "one"));
// fetchOnlyOne(1);
// fetchOnlyOne(2);
// fetchOnlyOne(3);
// fetchOnlyOne(4);

// 场景二：假设同时可以有两个请求，要求在尽可能短的时间内完成所有请求该怎么办？
// function fetchOnlyTwo(index) {
//     fetch(index, 'two')
// }
// fetchOnlyTwo(1)
// fetchOnlyTwo(2)
// fetchOnlyTwo(3)
