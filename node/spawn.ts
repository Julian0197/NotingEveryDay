import { spawn } from "child_process";

const lsSpawn = spawn("ls");

// 返回值 ChildProcessWithoutNullStreams
// lsSpawn.stdout是一个输出流，负责向终端输出内容
// 继承了node.js的可读性，因此我们可以通过监听data这个事件，获取到流输出的内容
lsSpawn.stdout.on("data", (data) => {
  console.log("获取到流数据：", data.toString());
});

lsSpawn.stderr.on("error", (error) => {
  console.log("error:", error);
});

// 除了stdout输出流

const lsSpawn2 = spawn("ls", {
  cwd: process.cwd(),
  // stdio: 默认是pipe，管道流
  stdio: "inherit", // 子进程的输入输出直接和父进程绑定
});

// (parameter) data: number | null spawn的返回值不再是流的子类
lsSpawn2.on('close', (data) => {
  if (data) {
    console.log(data.toString())
  }
})
