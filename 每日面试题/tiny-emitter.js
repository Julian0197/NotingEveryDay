// 定义构造函数E
function E() {} // 函数E的原型对象
E.prototype = {
  // on方法：接受订阅名，订阅函数，上下文对象
  on: function (name, callback, context) {
    // 初始化e仓库
    var e = this.e || (this.e = {}); // 收集订阅函数 // 包装为对象，收集订阅函数与上下文对象
    (e[name] || (e[name] = [])).push({
      fn: callback,
      context,
    }); // 返回实例对象
    return this;
  }, // once函数：接收订阅名，订阅函数，上下文对象 // 与on的区别是：once函数收集只执行一遍的订阅函数
  once: function (name, callback, context) {
    let self = this; // 包装对象，用于自定义执行逻辑（删除操作）
    function listener() {
      self.off(name, listener);
      callback.apply(context, arguments);
    } // 保存原始函数
    listener._ = callback; // 使用on收集自定义后的函数 // 执行on方法会返回this，所以once函数内不需要返回this
    return this.on(name, listener, context);
  }, // emit方法用于触发订阅函数：接收订阅名称
  emit: function (name) {
    // 收集参数
    let args = [].slice.call(arguments, 1); // 收集订阅函数数组
    let events = ((this.e || (this.e = {}))[name] || []).slice();
    let i = 0;
    let len = events.length; // 循环执行订阅函数
    for (; i < len; i++) {
      // 使用apply调用函数并绑定this
      events[i].fn.apply(events[i].context, args);
    } // 返回this实例
    return this;
  }, // off用于删除订阅函数：接收订阅名和订阅函数
  off: function (name, callback) {
    let e = this.e || (this.e = {}); // 获取订阅名称对应的数组
    let events = e[name];
    let liveEvents = []; // 处理函数数组&传入的订阅函数是否都存在？
    if (events && callback) {
      // 循环遍历，过滤操作
      for (let i = 0, len = events.length; i < len; i++) {
        // 判断数组中的订阅函数是否与传入的订阅函数相等？
        // 使用once创建的函数取_属性中的原始函数进行对比
        if (events[i].fn !== callback && events[i].fn._ !== callback) {
          liveEvents.push(events[i]);
        }
      }
    } // 重置订阅名结果数组
    liveEvents.length ? (e[name] = liveEvents) : delete e[name]; // 返回实例this
    return this;
  },
};
