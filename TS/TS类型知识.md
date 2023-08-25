# TS类型知识

## 前置知识

### type和interface

`type`：类型别名，`interface`：接口（一般用于定义对象类型）

#### `type`可以但是`interface`不可以：

1. 定义基本类型的别名，`type myString = number`
2. 通过 `typeof` 操作符定义，`type myType = typeof someObj`
3. 可以声明联合类型，`type unionType = type1 | type2`
4. 可以声明元祖类型，`type tupleType = [type1, type2]`

#### `interface`可以但是`type`不可以：

1. 合并声明，如果是type就会报错

   ~~~ts
       interface test {
           name: string
       }
       interface test {
           age: number
       }
   
       /*
           test实际为 {
               name: string
               age: number
           }
       */
   ~~~

2. 和`implements`关键字连用，用于约束`class`

   ~~~ts
   interface MusicInterface {
       playMusic(): void
   }
   // 定义了约束后，class 必须要满足接口上的所有实例方法/属性。
   class Cellphone implements MusicInterface {
       playMusic() {}
   }
   ~~~

### 泛型

**泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，使用时再去指定类型的一种特性。**有关联的类型可以用`<T>`表示

在使用泛型的时候可以有两种方式指定类型。

- 使用的时候再指定类型
- TS 类型推断，自动推导出类型

~~~ts
// 有关联的地方都改成 <T>
function createArray<T>(length: number, value: T): Array<T> {
    let result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}

// 使用的时候再指定类型
let result = createArray<string>(3, 'x');

// 也可以不指定类型，TS 会自动类型推导
let result2 = createArray(3, 'x');
console.log(result);
~~~

`value: number`，`value<string>`和`value as string`这三者的区别在哪里？

+ `value: number` 表示 value 是一个类型为 number 的变量或参数
+ `value<string>` 表示 value 是一个泛型变量，但在该语句中指定为 string 类型。 
+  `value as string` 是一种类型断言，告诉编译器将 value 视为 string 类型，但**不进行实际的类型转换**。

### 条件类型

用 `extends` 关键字配合三元运算符来判断传入的泛型是否可分配给 `extends` 后面的类型。

~~~ts
type IsNumber<T> = T extends number ? 'yes' : 'no';

type A = IsNumber<2> // yes
type B = isNumber<'3'> // no
~~~

### 索引签名

可以通过类似 JavaScript 中的对象属性查找的语法来找出对应的类型。

~~~ts
type Test = {
  foo: number;
  bar: string
}

type N = Test['foo'] // number
~~~

[更具体的介绍见TS中文文档](https://jkchao.github.io/typescript-book-chinese/typings/indexSignatures.html#typescript-%E7%B4%A2%E5%BC%95%E7%AD%BE%E5%90%8D)

### extends

#### 类型组合

与`interface`连用，`interface A extends B {}`

#### 继承

在`TS`中，`class `变量既是**值**，又是**类型**。

1. `classA extends classB` 类的继承
2. `interfaceA extends interfaceB` 类型的继承
3. `interfaceA extends classB` 继承class的类型，抛弃class的实现
4. `classA extends interfaceA` class继承interface的类型

#### 泛型类型约束

- 当 `extends` 紧跟在泛型形参后面时，它是在表达「类型约束」的语义；
- 在 `AType extends BType` 中，只有 `AType` 是 `BType` 的子类型，ts 通过类型约束的检验；
- 面对两个 typeScript 类型，要「ts 类型层级关系图」来判断。

#### 条件类型

TS的条件类型，是js中的三元表达式，`AType extends BType ?  CType :  DType`。

1. extends 与 {}

   ~~~TS
   type Test = 1 extends {} ? true : false // 请问 `Test` 类型的值是什么？ // TRUE
   ~~~

   `{}`在 typeScript 中，是一切有值类型的基类。

2. extends 与 any

   关于 extends 与 any 的运算结果，共两种情况：

   - `any extends SomeType(非 any 类型) ? AType : BType` 的结果是联合类型 `AType | BType`
   - `SomeType（可以包含 any 类型） extends any ? AType : BType` 的结果是 `AType`

3. extends 与 never

   `never`是ts类型中最底层，也就是说，除了它自己，没有任何类型是它的子类型。

4. extends 与 联合类型

   在 typeScript 三元表达中，当 `extends` 前面的类型是联合类型的时候，ts 就会产生类似于「乘法分配律」行为表现。

   ~~~ts
   type Test = (AType | BType) extends SomeType ? 'yes' : 'no'
             =  (AType extends SomeType ? 'yes' : 'no') | (BType extends SomeType ? 'yes' : 'no')
   ~~~

   **当联合类型的泛型形参的出现在三元表达式中的真值或者假值分支语句中，它指代的是正在遍历的联合类型的成员元素**。

   ~~~ts
   type  MyExclude<T,U>= T extends U ？ never :  T; // 第二个条件分支语句中， T 指代的是正在遍历的成员元素
   type Test = MyExclude<'a'|'b'|'c', 'a'> // 'b'|'c'
   ~~~

### infer关键字

#### 推断返回值

`infer`可以在`extends`的条件语句中推断待推断的类型。

`infer R`代表待推断的返回值类型，如果T是一个函数，则返回函数的返回值，否则返回`any`

~~~ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any

type func = () => number
type variable = string

type funcReturnType = ReturnType<func>; // funcReturnType 类型为 number
type varReturnType = ReturnType<variable>; // varReturnType 类型为 any
~~~

#### 解包

除了推断返回值，`infer`最常用于解包。

在没有`infer`之前，想要获取数组里的元素类型需要：

~~~ts
type Ids = number[];
type Names = string[];

type Unpacked<T> = T extends Names ? string : T extends Ids ? number : T;

type idType = Unpacked<Ids>; // idType 类型为 number
type nameType = Unpacked<Names>; // nameType 类型为string
~~~

使用`infer`：

~~~Ts
type Unpacked<T> = T extends (infer R)[] ? R : T

type idType = Unpacked<Ids>; // idType 类型为 number
type nameType = Unpacked<Names>; // nameType 类型为string
~~~

再比如，想要获取一个`Promise<xxx>`类型中的`xxx`类型，在不使用`infer`的情况下很难解包。

~~~ts
type Response = Promise<number[]>
type Unpacked<T> = T extends Promise<infer R> ? R : T

type resType = Unpacked<Response> // resType 类型为number[]
~~~

#### 推断联合类型

不使用`infer`

~~~ts
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;

type T10 = Foo<{ a: string; b: string }>; // T10类型为 string
type T11 = Foo<{ a: string; b: number }>; // T11类型为 string | number
~~~

**同一个类型变量在推断的值有多种情况的时候会推断为联合类型**，针对这个特性，很方便的可以将元组转为联合类型

~~~Ts
type ElementOf<T> = T extends (infer R)[] ? R : never

type TTuple = [string, number]
type Union = ElementOf<TTuple> // Union 类型为 string | number
~~~

### keyof关键字

`keyof` 操作符是 TS 中用来获取对象的 key 值集合的，最后转化为联合类型，比如：

~~~ts
type Obj = {
  foo: number;
  bar: string;
}

type Keys = keyof Obj // "foo" | "bar"
~~~

#### extends keyof

`extends keyof` 用于限制泛型类型参数的取值范围，使其只能是目标类型的公共属性名。

~~~ts
interface Person {
  age: number;
  name: string;
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person: Person = {
  age: 22,
  name: "Tobias",
};

// name is a property of person
// --> no error
const name = getProperty(person, "name");

// gender is not a property of person
// --> error
const gender = getProperty(person, "gender");
~~~

#### in keyof

 `in keyof` 用于定义一个类型，该类型是由字符串、数字或符号字面量联合类型构成的，可以与 `keyof` 结合使用创建映射类型。

~~~ts
interface Person {
  age: number;
  name: string;
}

type Optional<T> = { 
  [K in keyof T]?: T[K] 
};

const person: Optional<Person> = {
  name: "Tobias"
  // notice how I do not have to specify an age, 
  // since age's type is now mapped from 'number' to 'number?' 
  // and therefore becomes optional
};
~~~


