### HashMap数据结构

简单来说：hashmap是用来存储key-value键值对的集合，每一个键值对叫做entry，被分散存储在数组中。hashmap数组的初始值都是null，最常用的两个方法get和put：
+ put：插入键值对，利用哈希函数，根据插入的key计算出插入数据的index，`index = Hash(key1)`。数组中的值是链表，链表的值是键值对，当数据太多时采用红黑树。存在计算出来的index值相同的情况，当新数据的index出现冲突，会使用头插法插入到冲突index的前面，这里认为后插入的节点更可能用到。hashmap数组中的节点不光是一个键值对，相当于链表的节点，具有next指针指向下一个节点。
+ get：获取键值，同样利用哈希函数，能快速计算出index。如果当前index对应的键不符合要求，就一个个往后查找，

### 为什么js中的Object不符合HashMap的使用情况

#### 键名局限性

对象的key只允许是字符串或者symbol类型，任何其他类型都会通过`toString`进行隐式地转化为字符串。

~~~js
const foo = []
const bar = {}
const obj = {[foo]: 'foo', [bar]: 'bar'}

console.log(obj) // {"": 'foo', [object Object]: 'bar'}
~~~

#### 不必要的继承

如果单单使用`const hashMap = {}`，会自动继承Object原型链上的属性。这就是为什么可以在hashMap上调用`constructor`,`toString`,`hasOwnproperty`等方法。

原型继承可能会导致属性混淆，这个时候，我们需要`hasOwnproperty`确保当前属性是自身拥有的，而不是继承的。

当然创建对象时候，可以使用`Object.create(null)`，可以生成一个不继承`Object.prototype`的对象。

#### size属性

Object没有提供API来计算`size`。

+ 如果只关心字符串形式的可枚举的key，使用`Object.keys()`，将这些键转化为数组，并获得length
+ 如果想要所有key（包含弥补科枚举属性，不包括继承属性）,可以使用`Object.getOwnPropertyNames()`，并获得length
+ 如果只对symbol键感兴趣，使用`Object.getOwnPropertySymbols()`。或者使用`Reflect。ownKeys()`一次性获取字符串键和symbol键（包含可枚举和不可枚举，不包含继承）

上述方法的时间复杂度都是O(n)，因为都必须构建一个键的数组，才能获取数组的长度。

#### iterate迭代器

可以使用`for ... in`遍历对象，但是会读取到继承的可枚举属性。

不能对对象使用`for ... of`，因为默认情况下，对象没有定义`Symbol.iterator`方法，不可迭代。

可以使用`Object.keys`,`Object.entries`,`Object.values`。

另外，插入键的顺序不是按照先后顺序来的，大多数浏览器中整数键按照升序来，并优于字符串。

#### clear清除键

必须使用`delete`一个个删除

#### 检查某个属性名是否存在

我们不能依靠点/括号符号来检查一个属性的存在，因为值本身可能被设置为 undefined。相反，得使用 Object.prototype.hasOwnProperty 或 Object.hasOwn。
~~~js
const obj = {a: undefined}

Object.hasOwn(obj, 'a') // true
~~~

### ES6 Map

+ 支持任何数据类型的key
+ 可迭代，可使用for of遍历，并且可以结构map的项
+ API更友好：
  + `has`检查给定的项是否存在
  + `size`返回map项个数
  + `clear`删除所有项

### 使用Object、Map处理大量DOM节点的应用

需求：假设有一个10,000行组成的table，其中有一条可以使`active`，为了管理不同行被选中的状态，一个对象被用于存储active状态。

下面是使用object存储的案例
~~~js
import { ref, watchEffect } from 'vue'

let rowState = {}
let activeRow

document.querySelectAll('tr').forEach((row) => {
  // 因为object的key只能为symbol或者字符串，需要有个id来表示每一行
  rowStates[row.id] = ref(false)

  row.addEventListener('click', () => {
    if (activeRow) rowStates[activeRow].value = false
    activeRow = row.id
    rowStates[row.id].value = true
  })

  watchEffect(() => {
    if (rowStates[row.id].value) {
      row.classList.add('active')
    } else {
      row.classList.remove('active')
    }
  })
})
~~~

使用Map，不需要id值，html节点就是key
~~~js
import { ref, watchEffect } from 'vue';

let rowStates = new Map();
let activeRow;

document.querySelectorAll('tr').forEach((row) => {
  rowStates.set(row, ref(false));

    row.addEventListener('click', () => {
      if (activeRow) rowStates.get(activeRow).value = false;

        activeRow = row;

      rowStates.get(activeRow).value = true;
    });

    watchEffect(() => {
      if (rowStates.get(row).value) {
            row.classList.add('active');
        } else {
            row.classList.remove('active');
        }
    });
});
~~~

另外，map的读写性能更佳，Map必须使用哈希表或其他机制来实现，平均来说，这些机制提供的访问时间是集合中元素数量的亚线性。

"亚线性"只是意味着性能不会以与Map大小成比例的速度下降。因此，即使是大的Map也应该保持相当快的速度。

Map是个纯哈希结构，而Object有自己的内部实现。对于大量增删场景，Map更合适。