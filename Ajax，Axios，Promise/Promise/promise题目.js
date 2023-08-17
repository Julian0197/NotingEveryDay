// new Promise((resolve, reject) => {
//   console.log(1);
//   resolve();
// })
//   .then((a) => {
//     console.log(2);
//     new Promise((resolve, reject) => {
//       console.log(3);
//       setTimeout(() => {
//         resolve();
//       }, 1000);
//     })
//       .then((c) => {
//         console.log(4);
//         setTimeout(() => {
//           console.log(10);
//         });
//       })
//       .then((d) => {
//         console.log(6);
//       })
//       .then((e) => {
//         console.log(7);
//       });
//   })
//   .then((f) => {
//     console.log(5);
//   })
//   .then((g) => {
//     console.log(8);
//   });

// + 打印1，prmise状态为resloved，将a放入微队列
// + a返回一个promise，状态为pending，将f放入这个promise的回调队列，等a执行完，再把f放入微队列
// + f返回一个promise，状态为pending，将g放入这个promise的回调队列，等f执行完，再把g放入微队列

// + 同步任务执行完毕，执行微队列中的a
// + 打印2，创建一个新的Promise，打印3，settimeout中的回调添加到宏队列，这个Promise的状态是pending，将c放入这个promise的回调队列中
// + c返回一个promise，将d放入c的回调队列
// + d返回一个promise，将e放入d的回调队列
// + 执行完a，a没有返回值，a返回的promise变为成功状态
// + 将a回调队列中的f拿出来，放到微队列中

// + 执行微队列中的任务f，打印5，f返回的promise变为成功状态，将回调队列中的g拿出来放入微队列

// + 执行微队列中的任务g，打印8

// + 执行宏队列中的settimeout，new出来的Promise状态变为成功，将回调队列中的c拿出来放入微队列

// + 执行微队列中的c，打印4，将c中的settimeout放到宏队列
// + c没有return，他的promise变为成功，将d从回调队列拿出，放入微队列

// + 执行微队列任务d，打印6，Prmise成功，将e放入微队列
// + 执行微队列任务e，打印7

// + 执行宏队列中的settimeout，打印10

// 1,2,3,5,8,4,6,7,10

async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("script start");
async1();
console.log("script end");

// script start
// async1 start
// async2
// script end
// async1 end
