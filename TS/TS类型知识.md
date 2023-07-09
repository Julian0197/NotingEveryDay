# TS类型知识

## 前置知识

### type和interface

`type`：类型别名，`interface`：接口（一般用于定义对象类型）

#### `type`可以但是`interface`不可以：

1. 定义基本类型，`type myString = number`
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

## Vue3中实现Ref类型

**背景：**假如 `ref` 函数中又接受了一个 `Ref` 类型的参数呢？Vue3 内部其实是会帮我们层层解包，只剩下最里层的那个 `Ref` 类型。

~~~ts
const count = ref(ref(ref(ref(2)))) // count类型为Ref<number>
~~~

这是一个好几层的嵌套，按理来说应该是 `count.value.value.value.value` 才会是 `number`，但是在 vscode 中，鼠标指向 `count.value` 这个变量后，提示出的类型就是 number，这是怎么做到的呢？

**目的：**让 `ref(ref(ref(2)))` 这种嵌套用法，也能顺利的提示出 number 类型。

#### ref

`ref` 这个函数就是把一个值包裹成 `{value: T}` 这样的结构

~~~ts
// 使用泛型的默认值语法
type Ref<T = any> = {
  value: T
}

function ref<T>(value: T): Ref<T>

const count = ref(2)
count.value // number

const countRef = ref(ref(2))

~~~

默认情况很简单，但如果传入给函数的 value 也是一个 `Ref` 类型 ，需要用到`extends`关键字

<img src="/Users/jandon.ma/Library/Application Support/typora-user-images/image-20230708161737079.png" alt="image-20230708161737079" style="zoom:50%;" />

~~~ts
function ref<T>(value: T): T extends Ref 
	? T
	: Ref<UnwrapRef<T>>
~~~

对于 `ref(ref(2))` 这种类型来说，内层的 `ref(2)` 返回的是 `Ref<number>` 类型

当读取到类型为 `Ref<number>`的value时，直接原封不动返回，形成了**解包**

关键点就在于后半段逻辑，`Ref<UnwrapRef<T>>` 是怎么实现的，用来确定下面三种情况的类型：

1. 嵌套对象只有一层，`ref(2)`应该返回`Ref<number>`

2. 嵌套对象中包含多个数据， `ref({ a: 1 })`应该返回 `Ref<{ a: number }>`

3. 嵌套对象中包含多个数据，其中有Ref类型的都要被解包

   ~~~ts
   const complex = ref({
     a: ref('1'),
     b: ref(ref(2)),
     c: {
       c1: ref(ref(3)) 
     }
   })
   
   // expect 
   // complex推断出：
   const complex: Ref<{
     a: string;
     b: Ref<number>;
     c: {
         c1: Ref<string>;
     };
   }>
   ~~~

下面将实现递归的`UnwrapRef`解决上面问题：

#### UnwrapRef

~~~ts
type UnwrapRef<T> = T extends Ref<infer R> ? R : T

UnwrapRef<Ref<number>> // number
~~~

上述代码只做到了单层解包，如果 `infer R` 中的 `R` 还是 `Ref` 类型呢？

递归声明这个`UnwrapRef`类型是不允许的：

~~~ts
// ❌ Type alias 'UnwrapRef' circularly references itself.ts(2456)
type UnwrapRef<T> = T extends Ref<infer R> 
    ? UnwrapRef<R> 
    : T
~~~

#### 索引签名，递归UnwrapRef

~~~ts
type UnwrapRef<T> = {
  ref: T extends Ref<infer R> ? R : T
  other: T
}[T extends Ref ? 'ref' : 'other']
~~~

 在`UnwrapRef`中，我们使用了**索引类型查询**和**条件类型**的组合来实现递归解开Ref类型。

1. 先定义了一个字面量类型 `{ ref, other}`：

   + ref属性的类型根据泛型T是否为Ref类型决定，是的话用infer解包出来，否则直接返回

   + other属性的类型就是泛型T本身

2. `[T extends Ref ? 'ref' : 'other']`索引这个字面量类
   + 如果T是`Ref`类型，我们就得到`ref`属性的类型；否则，我们得到`other`属性的类型。
   +  当我们将一个嵌套的`Ref`类型传递给`UnwrapRef`时，它会递归地解开嵌套的`Ref`类型，直到得到最内层的非`Ref`类型为止。

#### 对象解包类型

在刚刚需求的基础上，我们希望`complex.value.b` 推断的类型应该是 `number`

~~~ts
const complex = ref({
  a: ref('1'),
  b: ref(ref(2)),
  c: {
    c1: ref(ref(3)) 
  }
})

// expect
// complex的类型
const complex: Ref<{
  a: string;
  b: number;
  c: {
    c1: number;
  };
}>
~~~

利用**遍历索引** 和 `keyof`来实现：

~~~ts
type UnwrapRef<T> = {
  ref: T extends Ref<infer R> ? R : T;
  object: { [K in keyof T]: UnwrapRef<T[K]> };
  other: T;
}[T extends Ref
  ? 'ref'
	: T extends object
		? : 'object'
		: 'other']
~~~

这里在遍历 `K in keyof T` 的时候，只要对值类型 `T[K]` 再进行解包 `UnwarpRef<T[K]>` 即可，如果 `T[K]` 是个 `Ref` 类型，则会拿到 `Ref` 的 `value` 的原始类型。

`[K in keyof T]: UnwarpRef<T[K]>` 表示对类型 `T` 的每个属性进行遍历，并将每个属性的属性名 `K` 与对应属性值 `T[K]` 的 `UnwarpRef` 类型进行映射。这样就得到了一个具有相同属性结构，但属性值为 `UnwarpRef<T[K]>` 的对象类型。

#### 完整代码实现

~~~ts
type Ref<T = any> = {
  value: T
}

type UnwarpRef<T> = {
  ref: T extends Ref<infer R> ? R : T
  object: { [K in keyof T]: UnwarpRef<T[K]> }
  other: T
}[T extends Ref 
  ? 'ref' 
  : T extends object 
    ? 'object' 
    : 'other']

function ref<T>(value: T): T extends Ref ? T : Ref<UnwarpRef<T>>

~~~

## 类型体操实战

### 实现 If

实现一个 `IF` 类型，它接收一个条件类型 `C` ，一个判断为真时的返回类型 `T` ，以及一个判断为假时的返回类型 `F`。 `C` 只能是 `true` 或者 `false`， `T` 和 `F` 可以是任意类型。

+ 如何约束泛型为boolean类型？
  + C extends boolean
+ 如何判断当前泛型为true？
  + C extends true

~~~ts
type If<C extends boolean, T, F> = C extends true ? T : F

type A = If<true, 'a', 'b'>  // expected to be 'a'
type B = If<false, 'a', 'b'> // expected to be 'b'
~~~

### 实现 Pick

`Pick<T, K>` ==> 从类型 `T` 中选出属性 `K`，构造成一个新的类型。

复习一下前面知识：

+ ##### `keyof`: 取interface的键后保存为联合类型

+ ###### `in`: 取联合类型的值，主要用于数组和对象的构建

~~~ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
} 

// test
// 从 Todo 中挑出 title和completed
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>
~~~

### 实现 Exclude

`Exclude<T, K>` => 从类型 `T` 中排除掉指定的类型 `K`

extends 前面的类型如果是联合类型，会进行遍历。

~~~Ts
type Exclude<T, K> = T extends K ? never : T;

// test
// 从B中排除类型A
type A = "a" | "b" | "c" | "d";
type B = "b" | "d" | "e" | "f";
type C = Exclude<A, B>; // "a" | "c"
~~~

### 实现 Partial

将某个类型中每个属性设置为可选属性，这表示这些属性的值可以是 `undefined` 或者省略。

~~~ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// test
interface Person {
  name: string;
  age: number;
}

type PartialPerson = Partial<Person>;

let person1: PartialPerson = { name: "Alice" }; // age 是可选属性，值默认为 undefined
let person2: PartialPerson = { }; // name 和 age 都是可选属性，值默认为 undefined
let person3: Partial<Person> = { name: "Bob", age: 20 }; // 和 Person 一样，都是必选属性
~~~

### 实现 Omit

从类型 `T` 中删去指定的属性 `K`

注意：使用`as`可以将一个值断言为特定的类型，类型断言并不会对值进行任何运行时的检查或转换，它只是在编译时告诉编译器如何理解代码。

~~~ts
type Omit<T, K> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

// test
interface Person {
  name: string;
  age: number;
  address: {
    city: string;
    street: string;
  };
}

type PersonNameAndAge = Omit<Person, "address">;
~~~

### 实现 Readonly

用于将某个类型中每个属性设置为只读属性，这表示这些属性的值不能被修改。

使用了 `readonly` 关键字将属性设置为只读属性

~~~ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
} 

// test
interface Person {
  name: string;
  age: number;
}

type ReadonlyPerson = Readonly<Person>;

let person: ReadonlyPerson = { name: "Alice", age: 30 };
person.name = "Bob"; // 报错，因为 name 是只读属性
person.age = 40; // 报错，因为 age 是只读属性
person = { name: "Carol", age: 50 }; // 可以修改整体属性值
~~~

> 如果要实现一个`Deep ReadOnly`呢？

~~~ts
// keyof T转化为联合类型，联合类型配合extends会有类似乘法分配律的效果
type DeepReadonly<T> = keyof T extends never
	? T
	: { readonly [K in keyof T]: DeepReadonly<T[K]>}
~~~

### 实现 Required

用于将某个类型的所有可选属性都转换为必选属性。

在属性名前使用 `-?` 符号来将所有属性设置为必选属性。

~~~ts
type Required<T> = {
  [P in keyof T]-?: T[P] 
}

// test
interface Person {
  name?: string;
  age?: number;
}

type RequiredPerson = Required<Person>;

let person: RequiredPerson = { name: "Alice", age: 30 };
person.name = "Carol"; // 正常
person.age = 50; // 正常
person = { }; // 报错，因为 name 和 age 是必选属性
~~~

### 实现数组转对象

将一个元组类型转换为对象类型，这个对象类型的键/值和元组中的元素对应。

+ const说明不能被修改，要用只读修饰符
+ 约束元素里的类型仅能为 string symbol number这三个可以为对象键的类型
+ `[K in T[number]]` 对数组里每个index进行循环将index转换成key

~~~ts
type TupleToObject<T extends readonly (string | symbol | number)[]> = {
  [P in T[number]]: P
}

// test
 const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

const result: TupleToObject<typeof tuple> 
// expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}

~~~

