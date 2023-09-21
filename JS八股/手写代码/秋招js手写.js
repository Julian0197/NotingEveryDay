// 手写call
Function.prototype.myCall = function (context, ...args) {
  // if (typeof this !== "function") {
  //   throw new TypeError("must be function");
  // }

  context = context || window;
  let fn = Symbol("key");
  context[fn] = this;
  const res = context[fn](...args);
  delete context[fn];
  return res;
};

// 手写apply
Function.prototype.myApply = function (context, args) {
  // if (typeof this !== function) {
  //   throw new TypeError('must be function')
  // }
  // if (args && Array.isArray(args)) {
  //   throw new TypeError('must be array')
  // }
  context = context || window;
  let fn = Symbol("key");
  context[fn] = this;
  const res = context[fn](...args);
  delete context[fn];
  return res;
};

// 手写bind
Function.prototype.myBind = function (context, ...args) {
  if (typeof this !== "function") {
    throw new TypeError("must be function");
  }
  const _this = this;
  return function fn(...innerArgs) {
    // 判断返回去的函数有没有被new
    if (this instanceof fn) {
      return new _this(...args, ...innerArgs);
    }
    return _this.apply(context, args.concat(innerArgs));
  };
};

// class 转化 function
// class Example {
//   constructor(name) {
//     this.name = name;
//   }
//   func() {
//     console.log(this.name);
//   }
// }

// 等于下面
// ("use strict");
function Example() {
  // 验证this指向
  if (!(this instanceof Example)) {
    throw new TypeError("only new");
  }
  this.name = name;
}
// 方法成员不可枚举
Object.defineProperties(Example.prototype, {
  func: {
    value: function () {
      if (!(this instanceof Example)) {
        throw new TypeError("only new");
      }
      console.log(this.name);
    },
    enumerable: false,
  },
});

// 但是原型属性可以被枚举;
// Example.prototype.func = function () {
//   console.log(this.name);
// };

// 手写数组的reduce
Array.prototype.myReduce = function (fn, init) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  let res = init;
  let index = 0;
  if (init === undefined) {
    res = this[0];
    index = 1;
  }
  /**
   * fn(prev,cur,index,arr)
   * prev: 上一次调用回调返回的值，或者是提供的初始值（init）
   * cur : 数组中当前被处理的元素
   * index: 当前元素在数组中的索引
   * arr: 调用reduce的数组
   */
  for (let len = this.length; index < len; index++) {
    res = fn(res, this[index], index, this);
  }
  return res;
};

// 手写数组的forEach
Array.prototype.myForEach = function (fn) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  for (let i = 0; i < this.length; i++) {
    fn(this[i], i, this);
  }
};

// 手写filter
Array.prototype.myFilter = function (fn) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  let res = [];
  for (let i = 0; i < this.length; i++) {
    if (fn.call(this, this[i], i, this)) {
      res.push(this[i]);
    }
  }
  return res;
};

// 手写some
// some() 方法测试是否至少有一个元素通过由提供的函数实现的测试。
Array.prototype.mySome = function (fn) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  for (let i = 0; i < this.length; i++) {
    if (fn.call(this, this[i], i, this)) {
      return true;
    }
  }
  return false;
};

// 手写every
// every() 方法测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。
Array.prototype.myEvery = function (fn) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  for (let i = 0; i < this.length; i++) {
    if (!fn.call(this, this[i], i, this)) {
      return false;
    }
  }
  return true;
};

// 手写map
// map() 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
Array.prototype.myMap = function (fn) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  let res = [];
  for (let i = 0; i < this.length; i++) {
    res.push(fn.call(this, this[i], i, this));
  }
  return res;
};

// 手写new
function myNew(fn, ...args) {
  if (typeof fn !== "function") {
    throw new TypeError("must be function");
  }
  const newObj = Object.create(fn.prototype);
  const res = fn.apply(newObj, args);
  return typeof res === "object" ? res : newObj;
}

// 手写Object.create
Object.prototype.myCreate = function (obj) {
  function F() {}
  F.prototype = obj;
  return new F();
};

// 手写instanceOf
function my_instanceOf(A, B) {
  const constructor = B.prototype;
  while (A !== null) {
    if (A.__proto__ === constructor) {
      return true;
    } else {
      A = A.__proto__;
    }
  }
}

// 手写typeof
function myTypeof(obj) {
  return Object.prototype.toString
    .call(obj)
    .match(/^\[object (\w+)\]$/)[1]
    .toLowerCase();
}

// 手写组合继承
function SuperType(name, info) {
  // 实例属性（基本类型）
  this.name = name || 'Super'
  // 实例属性（引用类型）
  this.info = info || ['Super']
  // 实例方法
  this.getName = function() { return this.name }
}
// 原型方法
SuperType.prototype.getInfo = function() { return this.info } 

// 组合继承调用了两次父类方法，一次是在创建子类原型时，一次是在创建子类实例时
function ChildType1(name, info, age) {
  SuperType.call(this, name, info)
}
ChildType1.prototype = new SuperType() // 缺点在于修改子类原型时，会修改父类的原型
ChildType1.prototype.constructor = ChildType1

// 手写寄生组合继承
function ChildType2(name, age) {
  SupSuperTypeer.call(this, name); // 继承父类实例属性和方法
  this.age = age + 1;
}

function inheritPrototype(subType, superType) {
  // 不用调用两次
  const prototype = Object.create(superType.prototype); // 创建父类原型的副本
  prototype.constructor = subType
  subType.prototype = prototype
}
