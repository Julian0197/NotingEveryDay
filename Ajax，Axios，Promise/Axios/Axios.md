### HTTP相关

#### HTTP请求交互的基本过程

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220703161017387.png" alt="image-20220703161017387" style="zoom: 33%;" />

**HTTP请求报文（浏览器发送给服务器）**

+ 请求行 method(get, post)、url
+ 多个请求头
  + Host：主机
  + Cookie：携带cookie数据
  + Content-Type 请求体的内容类型：`application/json`或者`application/x-www.form.urlencoded`
+ 请求体 get请求没有请求体， 通过Content-Type告诉请求体的数据类型`{“username”:”tom”,”pwd”:123}` 或者`username=tom&pwd=123` 顺序与Content-Type顺序对应

**HTTP响应报文**

+ 状态行：status status Text
+ 多个响应头
  + Content-Type响应体的内容类型：`text/html;charset=uft-8 Set-Cookie:BD_CK_SAM=1;path=/`
  + Set-Cookie响应头(服务器生成cookie返回交给浏览器)
+ 响应体：``html 文本/json 文本/js/css/图片…``

**post请求体参数格式**

+ Content-Type:`application/x-www.form.urlencoded`
  例如：username=tom&pwd=123
+ Content-Type:`application/json`
  例如：{“username”:”tom”,”pwd”:123}
+ Content-Type:`multipart/form-data`
  用于文件上传请求

**常用请求类型**

+ GET：从服务器端读取数据
+ POST：向服务器端添加新数据
+ PUT：更新服务器端已有数据
+ DELETE：删除服务器端数据



### 自己创建一个API

#### API的分类

1. REST API：restful (Representational State Transfer 表现层状态转化)
   1. 发送请求进行CRUD（增删改查），具体哪个操作由请求方式决定
   2. 同一个请求路径可以进行多个操作
   3. 请求方式会用到GET、POST、PUT、DELETE
2. 非REST API：restless
   1. 请求方式不决定请求的CRUD操作
   2. 一个请求路径只对应一个操作
   3. 一般只有GET、POST

注：

+ REST是一组架构规范，REST API是遵循REST架构规范的应用编程接口，支持与RESTful Web服务进行交互。
+ API的理解：客户端与Web服务之间的传递者。换言之，如果你想与计算机或系统交互以检索信息或者执行某项功能，API可以帮助你把需要的信息传递给该系统，使其能够理解并满足你的需求
+ 当客户端通过RESTful API提出请求时，它会将**资源状态表述**传递给请求者或终端

#### 使用json-server（快速搭建的工具包）搭建REST API

+ 在线文档:https://github.com/typicode/json-server
+ `npm install -g json-server`下载
+ 根目录下创建数据库json文件：db.json

~~~js
{
	"posts": [
		{ "id": 1, "title": "json-server", "author": "typicode" },
		{ "id": 2, "title": "json-server2", "author": "typicode" }
	],
	"comments": [
		{ "id": 1, "body": "some comment", "postId": 1 }
	],
	"profile": { "name": "typicode" }
}
~~~

+ 启动服务器命令：`json-server --watch db.json`

### XHR的理解和使用

XHLHeepRequest（XHR）对象可以与服务器交互，获取数据而**无需刷新整个页面**，不影响用户操作的情况下**更新页面的局部内容**（手动写DOM更新代码）

#### 区别ajax请求和一般的http请求

1. ajax请求是一种特别的http请求
2. 浏览器端发送请求：只有XHR或fetch发出的才是ajax请求
3. 浏览器接受响应：
   + 一般http请求：浏览器会直接显示响应体数据，也就是自动刷新/跳转页面
   + ajax请求：浏览器不会对界面进行任何更新操作，只是调用监视的回调函数并传入响应体数据，也就是可以获取新的数据，但需要手动操作数据

#### XHR的ajax封装（简单版axios）

axios库暴露出去的axios是一个函数，函数的参数是配置对象optionA。配置对象的属性名和作用都是固定的

**特点**

1. 函数返回值为promise，成功的结果为response，失败的结果为error
2. 能处理多种类型请求：get，post，put，delete
3. 参数为配置对象

~~~js
{
    url:"",//请求地址
    method:"",//请求方式
    params:{},//GRT/DELETE请求的query参数
    data:{},//POST或DELETE请求的请求体参数
}
~~~

`axios里面的params参数配置是GET/DELETE请求的query参数`

`axios里面的data配置是POST或PUT请求的请求体参数`

`data有两种格式，对象为json格式，字符串为urlencoded格式`

4. 响应json数据自动解析为js的数组或对象
5. response只实现了data，status，statusText
6. put请求提交的是请求体参数，delete提交query参数

**实现步骤**

1. 先处理参数，有默认值的设置默认参数

2. 执行ajax异步请求，请求成功调用resolve，失败调用reject

   2.1 创建xhr对象，new XMLHttpResponse()

   2.2 初始化请求 xhr.open()

   2.3 发送请求 xhr.send() 参数为字符串，可以为json对象字符串，也可以为urlencoded格式字符串

### axios的理解和使用

#### axios是什么？

+ 基于promise的异步ajax请求库

+ react/vue都推荐使用axios发ajax请求

#### axios特点

1. 支持**请求/响应拦截器**
2. 浏览器端/ node端都可以使用
3. 支持请求取消
4. 批量发送多个数据 （promsie.all也可以）
5. 请求/响应数据转换 （使用时写的是对象，axios自动转化为json接受时axios也自动将json转换为对象）

`axios的post请求头默认是application/x-www-form-urlencoded
如果data（传入的响应体数据）是对象,默认转化Json。`



### axios.create(config)

**指定默认配置**

~~~js
// 方法1
axios.default.baseURL = 'http://localhost:3000'
// 方法2，后续用requestAxios当作原来的axios使用，都是axios的实例
const request axios = axios.create({
    baseURL: 'http://localhost:3000'
})
~~~

1. axios.create(config)是axios的**二次封装**，每个新的axios都有自己的配置

2. 新的axios**没有取消请求和批量发送请求**的方法，其他所有语法都是一致的

3. 为什么设计这个语法？

​		（1）需求：项目中部分接口需要的配置与另一部分接口需要的配置不大一样

​		（2）解决：创建两个axios，每个都有自己的配置，分别应用到不同要求的接口请求中

~~~js
axios.default.baseURL = "http://localhost:4000"
axios({
   url:"/posts" //请求的端口4000
})
const instance = axios.create({
    baseURL:"http://localhost:3000"
})
//使用instance发请求
instance({
    url:"/posts" //请求端口3000
})
~~~

#### axios.interceptors拦截器

+ 请求拦截器 axios.interceptors.request.use(callback)
+ 响应拦截器 axios.interceptors.response.use(callback)

~~~js
axios.interceptors.request.use(config=>{
    console.log("request interceptor1 ");
    //拦截请求，处理请求之后，必须要返回该配置，若不返回相当于axios请求没有添加配置
    return config
    },error=>{//不常用
        console.log("request interceptor1 err");
        return Promise.reject(error); //将错误传递下去
    })
axios.interceptors.request.use(config=>{
        console.log("request interceptor2 ");
        return config
    },error=>{
        console.log("request interceptor2 err");
        return Promise.reject(error)
    })
 axios.interceptors.response.use(response=>{
        console.log("response interceptor1 ");
        return response
    },error=>{
        console.log("response interceptor1 err");
        return Promise.reject(error)
    })
axios.interceptors.response.use(response=>{
        console.log("response interceptor2 ");
        //拦截response结果处理之后，要返回结果
        return response
    },error=>{
        console.log("response interceptor2 err");
        return Promise.reject(error)
    })

 axios.get("http://localhost:3000/posts").then(response =>{
     console.log("response data");
 }).catch(error=>{
     console.log("response error");
 })
 /*
 输出
request interceptor2
request interceptor1
response interceptor1
response interceptor2
date ....
 */
~~~

**说明**

1. 调用axios()不是立即发送ajax请求，要经历一个流程
2. 流程: 请求拦截器2 => 请求拦截器1 => 发ajax 请求 => 响应拦截器1 => 响应拦截器2 => 请求的回调
3. 请求拦截器后添加的先执行，响应拦截器后添加的后执行
4. 拦截请求，处理请求之后，必须返回cofig，若不返回相当于axios请求没有添加该配置
5. 拦截响应，处理响应之后，也要返回结果



#### 取消请求

1. executor函数中同步执行，参数是用于取消当前请求的函数
2. 当取消当前请求的函数被调用时，该请求会进入失败的流程，请求失败的error是Cancel对象类型，Cancel里面有message属性

~~~js
let cancel //保存用于取消请求的函数
axios.get("/user",{
     cancelToken:new axios.CancelToken(function excutor(c){
	 	cancel = c; //准备发请求时先把函数取消当前请求的函数存储起来
	}).then(response =>{
        cancel = null; //如果请求完成就不要取消请求了
    },error =>{
		cancel = null; 
	})
})
~~~



应用场景:如果发送请求2的时候，发现请求1还没有完成则取消请求1

~~~js
let cancel //保存用于取消请求的函数
function getProducts1(){
    if (typeof cancel === "function"){
        cancel("这里可以传消息提示")
    }
    axios.get("/user",{
        cancelToken:new axios.CancelToken(
            //执行器回调，同步进行
            c => {//c是用于取消当前请求的函数
                cancel = c
            }
        )
    }).then(response =>{
        cancel = null
    },error =>{ //为什么要区分，因为这里是异步执行的，如果此时cancel是等于请求2的取消函数，不分区执行的时候cancel会被置空，cancel为null不是为请求2的取消函数，这样会出问题
        if (axios.isCancel(error)){ // 取消请求
         	//cancel = null 这个必须要区分！！！ 
            console.log("请求1被取消了",error.message);
        }
        else{  //请求本身出错
          cancel = null
          console.log(error);
        }
    })
}
function getProducts2(){
    if (typeof cancel === "function"){ //在准备发请求前，取消未完成的请求
 		 cancel("这里可以传消息提示")
    }
    axios.get("/user/1",{
        cancelToken:new axios.CancelToken(
            c => {cancel = c}
        )
    }).then(response =>{
        cancel = null
    },error =>{
        if (axios.isCancel(error)){
            console.log("请求2被取消了",error.message);
        }
        else{
            cancel = null
            console.log(error);
        }
    })
}
~~~

通过拦截器将代码进行改进

~~~js
//添加请求拦截器
axios.interceptors.request.use(config=>{
   if (typeof cancel === "function"){
       cancel("这里可以传消息提示")
   }
   //添加一个cancelToken的配置
	config.cancelToken =new axios.CancelToken(
    c => {
      cancel = c
    })
     return config
 })
 
 //添加响应拦截器
axios.interceptors.response.use(
    respose=>{
        cancel = null
        return respose
    },
    error =>{
    	if (axios.isCancel(error)){
          console.log("请求取消了",error.message);
          //中断promise链接，目的是:当请求失败时，请求函数本身只处理请求失败的情况，不处理请求取消的情况
          return new Promise(()=>{})
        }
        else{
           cancel = null
           //将错误继续向下传递
           // throw error
            return Promise.reject(error)
   }
})
let cancel
function getProducts1(){
    axios.get("/user").then(response =>{
         //其他数据响应
    },error =>{
       //只需要处理请求失败
    })
}
function getProducts2(){
    axios.get("/user/1").then(response =>{
        //其他数据响应
    },error =>{
        //只需要处理请求失败
    })
}
~~~

