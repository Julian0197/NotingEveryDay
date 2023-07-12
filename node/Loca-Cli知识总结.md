# Loca-Cli知识总结

## node子进程

需求：cli工具在完成对项目模板的拷贝后，能够自动去执行包管理命令去安装项目依赖，并启动项目。以yarn为例，一般我们都需要手动在终端输入：

~~~bash
yarn
yarn serve
~~~

+ 执行脚手架命令时，会先开启一个主进程，通常是Node.js的进程。这个主进程会加载脚手架的代码，并执行一些初始化操作。
+ 当执行yarn命令时，主进程会再次开启一个子进程，这个子进程也是Node.js的进程。子进程会负责执行yarn相关的操作，例如安装依赖、构建项目等。
+ 子进程和主进程之间通过进程间通信（IPC）进行通信。主进程可以向子进程发送指令，子进程执行完毕后，会将结果发送给主进程。

> 为什么要开启一个子进程？

执行yarn命令可能会耗费较长时间，如果在主进程中执行，会阻塞主进程的执行，导致脚手架无法响应其他操作。

### node子进程原理

node子进程所有能力都在`child_process`库，提供了三种创建子进程的方法。

#### Fork开启子进程

在`fock.ts`文件中，利用`fock`，只需要传入被执行文件的绝对路径

~~~ts
import { fork } from "child_process"
import path from "path"

// `__dirname`是Node.js中的一个全局变量，它表示当前模块的文件所在的目录的绝对路径。
// 它是由Node.js在运行时自动注入的，可以在任何模块中使用。
const forkPath = path.resolve(__dirname, 'test.js')

fork(forkPath)
~~~

在利用 `npx ts-node fock.ts`执行fock.ts，npx会将临时安装的包(`ts-node`)存储在一个缓存目录中，而不是安装到项目的node_modules目录中，安装完后执行命令。

本质：fork是利用ts-node或者node去执行命令的。fork方法创建的子进程可以通过IPC（进程间通信）通道进行通信。

#### spawn -- node创建子进程能力的基类

node.js中所有开启子进程的方法都继承于`spawn`。spawn本质是向操作系统申请进程资源去执行执行进程，使用spawn方法创建的子进程可以执行任何可执行文件，而fork方法创建的子进程只能执行Node.js模块。

spawn默认是以**可读流**的方式去获取进程的执行结果。

~~~ts
import { spawn } from 'child_process'

const lsSpawn = spawn('ls')

lsSpawn.stdout.on('data', (data) => {
  console.log('获取到流数据：', data.toString());
})

lsSpawn.stderr.on('error', (error) => {
  console.log('error:', error)
})
~~~

除了stdout输出流，spawn还提供了一种更方便的方式
~~~ts

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
~~~

pipe管道流：管道流是一种在操作系统中用于将一个进程的输出连接到另一个进程的输入的机制。它允许进程之间通过管道进行通信和数据传输，其中一个进程的输出会直接作为另一个进程的输入。

在Node.js中，child_process模块的spawn方法可以创建一个子进程，并通过管道流与父进程进行通信。子进程的输出可以通过管道流传递给父进程，父进程可以读取子进程的输出并进行处理。这种方式可以实现进程间的通信和数据传输，达到IPC的效果。

#### exec：利用shell环境进行进程操作

> shell是什么?

shell是命令行解释器，它提供了与操作系统内核进行交互的接口，常见的shell有`bash`，`zsh`等。

`exec`也是`spwan`的子类，继承了spawn的能力，并派生出三个独有的特点：
1. 在执行子进程命令时，利用spawn打开一个shell环境
2. 在开启的shell环境下执行指定命令
3. 输出的不是流，而是先将内容缓存到缓冲区，进程共享缓冲区内容

~~~ts
import { exec } from 'child_process'

const execCwd = exec('ls', (err, stdout, stderr) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('stdout', stdout)
})
~~~

### IPC（进程间通信）方式

实现IPC（进程间通信）的方式有很多，其中包括管道通信、流、缓冲区等。

1. 管道通信：管道是一种半双工的通信方式，包括有名管道和无名管道。有名管道允许无亲缘关系进程进行通信，而无名管道只能在具有亲缘关系的进程之间进行通信。管道通信适用于在父进程与子进程之间进行通信。

2. 流：流是一种基于文件描述符的通信方式，包括标准输入输出流（stdin、stdout）和标准错误流（stderr）。这种通信方式适用于进程间进行简单的数据交换。

3. 缓冲区：缓冲区是一种内存区域，用于存储数据。进程可以通过共享内存、消息队列、信号量等方式进行缓冲区通信。共享内存适用于大量数据的高效传输，消息队列适用于进程间异步通信，信号量适用于进程间同步操作。

除了上述方式，还有其他一些实现IPC的方式，如信号、套接字、远程过程调用（RPC）等。选择哪种方式取决于通信的需求和场景。

