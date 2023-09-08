async function func1(ctx, next) {
  console.log("第一个中间件 开始");
  await next();
  console.log("第一个中间件 结束");
}

async function func2(ctx, next) {
  console.log("第二个中间件 开始");
  await next();
  console.log("第二个中间件 结束");
}

async function func3(ctx, next) {
  console.log("第三个中间件 开始");
  ctx.body = "Hello World";
  console.log("第三个中间件 结束");
}

function compose() {
  let funcArray = arguments[0];
  let ctx = this;
  return function () {
    dispatch(0);
    function dispatch(i) {
      if (i == funcArray.length) return;
      funcArray[i](ctx, () => dispatch(i + 1));
    }
  };
}

compose([func1, func2, func3])();
// 第一个中间件 开始
// 第二个中间件 开始
// 第三个中间件 开始
// 第三个中间件 结束
// 第二个中间件 结束
// 第一个中间件 结束
