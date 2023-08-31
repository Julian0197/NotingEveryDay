### CDN加速-手动引入cdn，webpack配置externals

+ 分析：通过把类似 echart、element-ui、lodash 等第三方依赖库单独提取出，从而减小打包的体积大小，关键属性 externals 配置后的依赖插件不会被打包进 chunk 。而使用 CDN 加速、缓存也能加快访问速度。
+ 操作：这里我们主要通过 chainWebpack 中配置 externals 进行处理。
+ 再使用CDN引入所需自选

```js
// vue.config.json
const IS_PRO = process.env.NODE_ENV === 'production';
module.exports={
  //... 其他基本配置
  chainWebpack: (config) => {
    if (IS_PRO) {
      config.externals({
          echarts: 'echarts'
      });
    }
  }
}
```

```html
// index.html
<div id="app"></div>
  <!-- 推荐放在 <div id="app"></div> 后面 -->
  <script src="https://cdn.jsdelivr.net/npm/echarts@4.8.0/dist/echarts.min.js"></script>
```

### html-webpack-plugin 将cdn注入到 index.html

#### html-webpack-plugin
html-webpack-plugin 会在打包结束后，创建一个 html 文件，并把打包后的静态资源自动插入到这个 html 文件中。默认会在 output.path 的路径下创建 index.html 文件，也可以通过 filename 指定输出的文件名；并在这个文件插入一个 script 标签，标签的 src 为 output.filename，来引用打包后的 JS 文件。

wepack构建流程：
1. 根据配置文件和shell命令，初始化参数，得到最终的配置对象
2. 根据配置对象，初始化compiler对象
3. 注册所有配置的插件，new Plugin()，并调用apply方法，传入compiler
4. 执行对象的run方法开始执行编译
5. 根据entry找出入口文件，
6. 从入口文件出发，调用所有配置的loader对模块进行编译，再找出该模块依赖的模块，递归直到所有模块被加载到内存中
7. 根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk
8. 再把每个chunk转换成一个单独的文件加入到输出列表
9. 在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

在上述webpack构建的声明周期中，会暴露出来不同阶段的事件，plugin就是通过监听这些事件，来执行不同的任务，从而实现不同的功能。比如html-webpack-plugin：
+ 触发make钩子，通过SingleEntryPlugin向entry添加了html入口
+ 利用emit钩子生命周期函数通过compilation.getAssets()得到所有静态资源内容，根据outputName和资源内容即可写入文件。

配置CDN
```js
const cdn={
  css:[],
  js:['https://cdn.jsdelivr.net/npm/echarts@4.8.0/dist/echarts.min.js']
}
// 通过 html-webpack-plugin 将 cdn 注入到 index.html 之中
config.plugin('html').tap(args=>{
  args[0].cdn=cdn
  return args
})
``