import { fork } from "child_process"
import path from "path"

// `__dirname`是Node.js中的一个全局变量，它表示当前模块的文件所在的目录的绝对路径。
// 它是由Node.js在运行时自动注入的，可以在任何模块中使用。
const forkPath = path.resolve(__dirname, 'test.js')

fork(forkPath)
