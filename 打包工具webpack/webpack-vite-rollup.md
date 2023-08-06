### 前提知识-webpack热更新
无需刷新整个页面，就可以更新模块

页面刷新：
+ 不保留页面状态，页面刷新，`window.location.reload`
+ 模块热替换：局部刷新页面发生变化的模块，同时保留当前页面状态

### tree-shaking
移除JS上下文中未引用的代码。
依赖于ESM，import和export在编译的时候静态解析，确定哪些导出值未被模块使用， 并将其删除实现对打包产物的优化

### javascript语言
虽然是是解释型语言：可以被浏览器或node逐行解释执行。

但其实在执行之前会进行“即时编译”，编译时候会对代码进行分析，转化为优化的代码。会将代码解析成**AST和一些中间代码**，再将其转化为机器语言。这个过程包含了一些优化操作，如内联缓存、函数内联、去除无用代码等。

### vite和webpack区别
1. vite直接启动开发服务器，请求哪一个模块再对该模块实时编译。依赖浏览器，现代浏览器支持ES Module，会自动向依赖的Module发送请求。而webpack需要把所有文件打包到bundle.js，再启动开发服务器。
   + ESM中，模块加载是异步的。ESM的import是静态解析的，在编译期间就确定了模块的依赖关系，可以更好的实现按需加载。正因为ESM在编译阶段静态解析的特性，import不能放在函数内部，需要放在最开头，如果放在函数内部，执行顺序是动态的，编译器无法再不运行代码的情况下确定模块结构。
   + CJS中，模块加载是同步的，require在模块加载时立即执行，所以需要把模块全部打包成单独文件，才能在浏览器中执行。同执行会阻塞，而且CJS中require是运行时加载，编译期间无法确定模块依赖关系。
3. vite基于vite是基于esbulid预构建依赖（go编写），webpack基于node。go，webpack基于javascript。go是编译语言，编译阶段就将源码转化为机器码。javascript需要解释器调度执行。go是多线程，js单线程。
4. webpack处理代码：字符串形式读入源码 => 借助babel-loader转化为AST => babel再解析成低版本AST => 低版本AST生成低版本源码（字符串形式）=> 打包成为最终产物。在ast和string之间来回转化，效率低。而Esbuild 重写包括 js、ts、jsx、css 等语言在内的转译工具，所以它更能保证源代码在编译步骤之间的结构一致性，在多个编译阶段共用相似的AST，节省内存。

### webpack作用

模块化：过去使用script标签引入多个js文件，容易造成变量污染和命名冲突。模块化将代码分隔，每个模块都有自己的作用域和命名空间

打包：将各个模块的代码合并成一个文件，让页面加载速度更快，减少http请求。

### webpack plugin的原理

核心机制：基于 `tapable` 产生的**发布订阅者模式**，在不同的周期触发不同的 `Hook` 从而影响最终的打包结果。

tapable是一个基于发布订阅模式的插件架构库，它提供了一套用于创建和处理钩子的API。通过使用tapable，开发者可以定义自己的钩子（Hook），并在不同的生命周期阶段触发这些钩子，实现自定义的插件功能。

在Webpack中，有许多常用的插件可用于扩展或修改Webpack的打包行为，一些常见的插件包括：

1. HtmlWebpackPlugin：用于生成HTML文件，并自动将打包后的脚本文件引入HTML中。
2. CleanWebpackPlugin：用于在每次构建前清理输出目录。
3. MiniCssExtractPlugin：用于将CSS从打包的JavaScript文件中提取出来，生成单独的CSS文件。
4. DefinePlugin：用于定义全局常量，可以在代码中直接使用这些常量。
5. CopyWebpackPlugin：用于将文件或文件夹复制到构建目录中。
6. UglifyJsPlugin：用于压缩和混淆JavaScript代码。
7. HotModuleReplacementPlugin：用于在开发环境中实现热模块替换，允许在运行时更新模块，而无需完全刷新页面。

比如：HotModuleReplacementPlugin在Webpack的构建过程中的`compilation`阶段进行操作。在这个阶段，它会监听文件的变化，并在文件发生变化时触发热更新。

当文件发生变化时，HotModuleReplacementPlugin会通过WebSocket与Webpack Dev Server建立连接，将变化的模块信息发送给Webpack Dev Server。Webpack Dev Server会根据这些信息，通过热替换的方式，将变化的模块替换到运行中的应用程序中，而不需要完全刷新页面。

又比如：在`emit`阶段，HtmlWebpackPlugin会监听Webpack的构建结果，获取打包后的文件信息。然后，它会根据配置的模板文件和打包后的文件信息，生成一个新的HTML文件，并将打包后的脚本文件引入到HTML中。



