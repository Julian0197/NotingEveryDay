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