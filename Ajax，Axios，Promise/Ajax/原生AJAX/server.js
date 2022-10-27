// 1.引入express
const express = require('express')

// 2.创建应用对象
const app = express()

// 3.创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装
app.get('/server', (request, response) => {
  // 设置响应头, 设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*');
  // 设置响应体
  setTimeout(() => {
    response.send('Hello AJAX')
  }, 3000)
})

// all表示可以接受任何类型的请求
app.post('/server', (request, response) => {
  // 设置响应头, 设置允许跨域
  response.setHeader('Access-Control-Allow-Origin','*');
  response.setHeader('Access-Control-Allow-Header','*');
  // 设置响应体
  response.send('Hello AJAX post')
})

app.all('/json-server', (request, response) => {
  // 设置响应头，允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应头，允许自定义头部信息
  response.setHeader('Access-Control-Allow-Headers', '*')
  const data = {
    name: 'Macro'
  }
  // 对对象进行字符串转化
  let str = JSON.stringify(data)
  response.send(str)
})

// axios 服务
app.all('/axios-server', (request, response) => {
  // 设置响应头，允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应头，允许自定义头部信息
  response.setHeader('Access-Control-Allow-Headers', '*')
  const data = {
    name: 'Macro'
  }
  // 对对象进行字符串转化
  let str = JSON.stringify(data)
  response.send(str)
})

// fetch 服务
app.all('/fetch-server', (request, response) => {
  // 设置响应头，允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应头，允许自定义头部信息
  response.setHeader('Access-Control-Allow-Headers', '*')
  const data = {
    name: 'Macro'
  }
  // 对对象进行字符串转化
  let str = JSON.stringify(data)
  response.send(str)
})

// jsonp 服务
app.all('/jsonp-server', (request, response) => {
  const data = {
    name: 'Haller'
  }
  let str = JSON.stringify(data)
  // 返回结果是一个函数调用，函数参数是想给客户端的结果数组 
  response.end(`handle(${str})`)
})

// jsonp 用户名监测是否存在
app.all('/check-username', (request, response) => {
  const data = {
    exist: 1,
    msg: 'username already exists'
  }
  // JSON.stringify() 方法将一个 JavaScript 对象或值转换为 JSON 字符串
  let str = JSON.stringify(data)
  // ES6新增字符串拼接方法 `handle(${str})` => handle(str所指的字符串)
  response.end(`handle(${str})`)
})

app.all('/cors-server', (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.send('hello CORS')
})

// 4.监听端口启动服务
app.listen(8000, () => {
  console.log('服务已经启动，8000端口监听中...');
})

