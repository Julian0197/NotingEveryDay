// 将key转化为驼峰写法
const underlineToCamel = (key) => {
  return key.replace(/_(\w)/g, (match, letter) => {
    return letter.toUpperCase()
  })
}

// 深拷贝对象，并在过程中实现驼峰转化
function deepCloneAndToCamel(target, map = new WeakMap()) {
  // 先判断target是不是引用类型，是的话就循环遍历所有元素
  if (typeof target === "object") {
    // 已经克隆过直接返回
    if (map.has(target)) return map.get(target)
    // 深拷贝，并对对象的key转化驼峰
    let isArray = Array.isArray(target)
    const result = isArray ? [] : {}
    map.set(target, result)
    if (isArray) {
      // target是数组
      target.forEach((item, index) => {
        result[index] = deepCloneAndToCamel(item, map)
      });
    } else {
      // target是对象
      Object.keys(target).forEach((key, index) => {
        const newKey = key.indexOf('_') > 0 ? underlineToCamel(key) : key
        result[newKey] = deepCloneAndToCamel(target[key], map)
      })
    }
    return result
  } else {
    // 基础类型直接返回
    return target
  }
}

class modelBase {
  constructor(obj) {
    this._raw = obj
    this._value = this.toCaml(obj)
  }

  get value() {
    return this._value
  }

  toCaml() {
    return deepCloneAndToCamel(this._raw)
  }
  // static声明的静态方法，只能通过类类名访问
  revert() {
    return this._raw
  }
}

let formData = {
  app_id: 1,
  fields: { field_name: "shuai", field_lists: { total: 20, is_valid: true } },
  models: [{models_name: 'shuai'}]
};

let data = new modelBase(formData)
console.log(data.value)

let raw = data.revert()
console.log(raw)
