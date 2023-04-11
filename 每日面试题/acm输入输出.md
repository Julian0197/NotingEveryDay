#### 前置知识

#### 单行输入单行输出
~~~js
const readline = require('readline');
//实例化
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//开启事件监听
rl.on('line', function (line) {
//只有一行，以 空格 分隔，存入tokens数组中
    const tokens = line.split(' ');
    console.log(parseInt(tokens[0]) + parseInt(tokens[1]));
});
~~~