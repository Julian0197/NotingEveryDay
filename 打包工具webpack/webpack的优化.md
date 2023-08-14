## webpack性能优化

### webpack5 打包速度 优化

#### 持久化缓存

在Webpack 5中，通过使用持久化缓存（persistent cache）可以大幅提高构建速度。持久化缓存会将构建过程中生成的中间文件缓存起来，下次构建时可以直接使用缓存，避免重复的工作。

持久化缓存的原理：Webpack 会在构建过程中生成一个**缓存文件**，记录了每个模块的内容和相关依赖关系。下次重新构建时，Webpack 会检查这个缓存文件，并根据缓存文件中的记录判断哪些模块是没有变化的，可以直接使用缓存结果，从而加快构建速度。

需要安装 `cache-loader` 和 `@webpack-contrib/persistent-cache-plugin` 包，并进行相应配置。

#### 模块联邦

使用`Module Federation`：Webpack 5引入了Module Federation的特性，可以将应用程序拆分成更小的微前端模块，并且可以独立地进行构建和部署。这样可以避免整个应用程序的重新构建，只需要构建和部署变化的模块，大大提高了构建速度。

#### ESM的tree shaking

Webpack的Tree Shaking是通过ES Module的**静态解析**来实现的。它会分析模块的导入和导出关系，找出未使用的代码，并将其从最终的打包结果中删除。

Webpack 5对ES模块进行了改进，可以更准确地进行`Tree Shaking`，即移除未使用的代码。通过使用Tree Shaking，可以减少打包后的代码体积，从而提高构建速度。

在Webpack 5中，Tree Shaking的默认行为已经是开启的，无需额外配置。否则需要配置：
1. 设置`mode`为`production`，以启用代码压缩和优化。
2. 在`optimization`字段中，设置`usedExports`为`true`，以启用Tree Shaking。


#### 多线程、多进程

Webpack 5引入了持久化缓存后，可以更好地支持多线程/多进程构建。通过启用多线程/多进程构建，可以同时处理多个任务，加快构建速度。

可以使用 `thread-loader` 插件来启用多线程构建。`thread-loader` 会将耗时的 loader 操作放在一个单独的 worker 池中进行处理，以提高构建速度。

~~~js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              // 指定 worker 的数量，默认为 cpu 核心数减一
              workers: 2,
            },
          },
          'babel-loader',
        ],
      },
    ],
  },
};
~~~

#### 控制台输出分析

使用Webpack控制台输出分析：Webpack 5提供了控制台输出分析的功能，可以通过分析构建过程中的控制台输出信息，找出构建过程中的性能瓶颈，从而进行相应的优化。

配置`webpackChunkName`

#### splitChunks属性

webpack通过`splitChunks`插件可以将代码拆分成多个文件，从而实现按需加载。结合`http2`协议可以进一步提高打包速度。

分包的好处：拆分多个的好处 就是一旦文件变更，可以有效的利用浏览器缓存。

~~~js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      chunks: "initial",
      minSize: 20000, // 大小超过20kb的模块才会被提取
      maxAsyncRequests: 10, // 分割后，按需加载的代码块最多允许的并行请求数
      maxInitialRequests: 10, // 当按需加载 chunks 时，并行请求的最大数量小于或等于 10
      enforceSizeThreshold: 50000, // 强制执行拆分的体积阈值并忽略其他限制
      cacheGroups: {
        // 微前端框架相关
        mfe: {
          test: /[\\/]node_modules[\\/](qiankun|single-spa)[\\/]/,
          name: "mfe",
          priority: 10,
        },
        // vue 全家桶相关
        vueFamily: {
          test: /[\\/]node_modules[\\/](vue|vue-router|vue-i18n)[\\/]/,
          name: 'vue-family',
          priority: 10,
        },
        elementUi: {
          test: /[\\/]node_modules[\\/]element-ui[\\/]/,
          name: 'element-ui',
          priority: 10,
        },
      },
    },
  },
};
~~~

`splitChunks` 中的`chunk`属性指定哪些模块应该被拆分成单独的文件:
+ `"initial"`：入口代码块
+ `"all"`：全部 
+ `"async"`：按需加载的代码块

在服务器端启用http2协议。http2协议支持并发加载多个文件，可以减少网络请求的延迟时间。使用`splitChunks`将代码拆分成多个文件后，可以通过http2同时加载多个文件，从而加快打包速度。

