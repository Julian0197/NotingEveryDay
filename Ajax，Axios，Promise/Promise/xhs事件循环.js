// 宏任务1
setTimeout(function () {
  // 宏任务3
  setTimeout(function () {
    console.log(1);
  }, 100);

  new Promise((resolve) => {
    console.log(2);
    // 宏任务4
    setTimeout(function () {
      console.log(4);
    }, 2);

    resolve(3);
  }).then((number) => {
    // 微任务1
    // 宏任务5
    setTimeout(function () {
      console.log(5);
    }, 1);

    console.log(number);
  });

  console.log(6);
}, 0);

// 宏任务2
setTimeout(function () {
  console.log(7);
}, 100);

console.log(8);

// + 同步执行打印8，宏任务1,2放入队列
// + 执行宏任务1，将宏任务3放入任务队列
// + 同步执行promise中的executor，打印2，将宏任务4放到队列，promise状态变为成功，then中回调函数放入微队列
// + 打印6
// + 执行微任务1，将宏任务5放入宏任务队列，打印3
// + 此时宏任务队列里有 2 3 4 5
// + 5的时间最短，先被执行，打印5
// + 接着是4执行，打印4
// + 然后是宏任务2，最后宏任务1，打印7 1


// 8 2 6 3 5 4 7 1