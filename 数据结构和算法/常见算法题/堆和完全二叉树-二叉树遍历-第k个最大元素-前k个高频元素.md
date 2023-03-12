### 为什么基本类型数据在栈中存放，引用类型数据在堆中存放?

**8种数据类型**

Boolean、Number、String、Undefined、Null、BigInt、Symbol、Object

JS是**动态语言**，声明变量之前不需要确认其数据类型，值才有数据类型。

+ 基本类型：保存在栈内存，因为这些类型在内存中分别占有**固定的大小**，通过按值来访问
+ 引用类型：保存在堆内存中，因为这种**值的大小不固定**，但是内存地址固定。因此，栈内存中存放该对象的访问地址，这个地址指向堆中的值
+ 注意：**闭包存放在堆内存中**

**栈空间：**

栈是内存中一块用于存储局部变量和函数参数的，栈用来**存储执行上下文**，如果栈空间太大，所有数据都存放在栈空间中，则会影响上下文切换效率，从而影响整个程序的执行效率

### JS堆

#### 完全二叉树性质

堆的本质是**完全二叉树**：满二叉树或者最后一层叶子节点没有满，而且最底层的节点都集中在该层左边的若干位置。

<img src="https://img-blog.csdnimg.cn/20200920221638903.png" alt="img" style="zoom: 45%;" />

**节点位置：**

+ 左侧子节点位置：`2 * index + 1`
+ 右侧子节点位置：`2 * index + 2`
+ 父节点位置：`（index-1）/2` 可以用位运算 `（i-1）>>1`

**堆的运用**

+ 快速找最大最小值，时间复杂度O(1)
+ 找第k个最大元素

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b052c9cbce1146afb2817af4a1e8fd5b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image" alt="最大最小元素 " style="zoom:33%;" />

#### 实现小顶堆

小顶堆：节点的键值是所有堆节点键值中最小者，且每个父节点的值都比子节点的值小

#### 数组中第k个最大元素

~~~js
var findKthLargest = function(nums, k) {
    const heap = new miniHeap();
    for (const item of nums) {
        heap.push(item)
        if (heap.size() > k) heap.pop()
    }
    return heap.pop();
};

// 构建小顶堆，控制小顶堆的元素个数为k个，那么堆顶的元素就是这K个元素中最小的元素，也就是整个数组中第K个大的元素
function miniHeap() {
    this.queue = [];
}

//compare方法
miniHeap.prototype.compare = function(left, right) {
    // 小顶堆每次都要选出小的元素比较，当下标undefined，应该选另外一个
    if (this.queue[left] === undefined) return 1
    if (this.queue[right] === undefined) return -1
    return this.queue[left] - this.queue[right]
}

// size
miniHeap.prototype.size = function() {
    return this.queue.length;
}

// change方法，交换顺序
miniHeap.prototype.change = function(left, right) {
    [this.queue[left], this.queue[right]] = [this.queue[right], this.queue[left]]
}

// push方法添加元素进入完全二叉树
miniHeap.prototype.push = function(item) {
    this.queue.push(item);
    // 当前元素的初试下标是堆的长度-1
    let index = this.size() - 1;
    // 父节点
    let parent = Math.floor((index - 1) / 2);
    while (parent >= 0 && this.compare(parent, index) > 0) {
        // 上浮
        this.change(parent, index);
        index = parent;
        parent = Math.floor((index - 1) / 2);
    }
}

// 获取miniHeap顶部元素，移除后保证miniHeap
miniHeap.prototype.pop = function() {
    // 保存一下堆顶元素
    const ret = this.queue[0];
    // 将最后一个元素移动到堆顶，再慢慢调整
    this.queue[0] = this.queue.pop();
    // 除了刚移动到堆顶的元素，其他元素都符合小顶堆性质，接下来一层层调整
    // 每次用当前索引 与 左孩子右孩子中较小的比较，若孩子更小，交换顺序
    let index = 0, left = 1, right = left + 1;
    let selectChild = this.compare(left, right) > 0 ? right : left;
    while (selectChild !== undefined && this.compare(selectChild, index) < 0) {
        this.change(selectChild, index);
        index = selectChild, left = 2 * index + 1, right = left + 1;
        selectChild = this.compare(left, right) > 0 ? right : left;
    }
    return ret;
}
~~~



#### 前k个高频元素

~~~js
var topKFrequent = function(nums, k) {
    // map记录所有元素出现的频率
    const map = new Map();
    nums.forEach(n => {
        map.set(n, (map.get(n) || 0) + 1);
    })

    const heap = new priorityQueue((a,b) => a[1] - b[1]);
    // map.entries() 返回一个新的包含[key, value]对的Iterator对象，返回的迭代器的迭代顺序与Map对象的插入顺序相同
    // 这里entries是一个长度为2的数组，0是key存储数字，1是频率存储元素出现的频率
    // 移除堆顶的小元素，剩下的k个都是高频元素
    for (const entry of map.entries()) {
        heap.push(entry);
        if (heap.size() > k) heap.pop()
    }
    // 这个时候，要返回小顶堆中所有元素（这里基本按照从大到小的顺序）
    const ret = [];
    for (let i = heap.size() - 1; i >= 0; i--) {
        // 把堆顶的最小元素放在最后
        ret[i] = heap.pop()[0];
    }
    return ret;
};

// 创建小顶堆（实现优先级队列），小顶堆父亲节点的值小于左右孩子
function priorityQueue(compareFn) {
    this.compareFn = compareFn;
    this.queue = [];
}

// push方法添加元素
priorityQueue.prototype.push = function(item) {
    this.queue.push(item)
    // 获取新加元素的索引，一开始是最后一个元素
    let index = this.queue.length - 1;
    // 堆中（完全二叉树），父节点index = i，两个孩子节点是2*index+1 和 2*index+2
    let parent = Math.floor((index - 1) / 2);
    // 上浮，比较传入节点和各个父节点的大小
    while (parent >= 0 && this.compare(parent, index) > 0) {
        // parent的值大于当前index的值，交换顺序
        [this.queue[parent], this.queue[index]] = [this.queue[index], this.queue[parent]]
        index = parent;
        parent = Math.floor((index-1) / 2);
    }
};

// 获取小顶堆的顶部元素（最小值）并移除
priorityQueue.prototype.pop = function() {
    const ret = this.queue[0];
    // 把最后一个元素移动到堆顶，最后一个元素一定大于左右孩子
    this.queue[0] = this.queue.pop();
    let index = 0, left = 1, right = 2;
    // 选择左右孩子中较小的元素
    let selectChild = this.compare(left, right) > 0 ? right : left;
    // 下沉
    while (selectChild !== undefined && this.compare(index, selectChild) > 0) {
        [this.queue[selectChild], this.queue[index]] = [this.queue[index], this.queue[selectChild]];
        index = selectChild, left = 2 * index + 1, right = left + 1;
        selectChild = this.compare(left, right) > 0 ? right : left;
    }
    return ret;
};

// 使用传入的compareFn函数 比较两个位置元素的大小
priorityQueue.prototype.compare = function(index1, index2) {
    // 处理下标越界
    // compare目的是选出频率更小的元素，所以如果index1 undefined的话，要选index2，所以应该返回正数
    if (this.queue[index1] === undefined) return 1;
    if (this.queue[index2] === undefined) return -1;
    return this.compareFn(this.queue[index1], this.queue[index2]);
};

priorityQueue.prototype.size = function() {
    return this.queue.length;
}
~~~



### 二叉树的遍历

这三种都是深度优先遍历

层次遍历是广度优先排序

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220317154705667.png" alt="image-20220317154705667" style="zoom:33%;" />

#### 前序

中左右

~~~js
// 1.迭代 入栈：中右左中 出栈：中左右
const preorderTraversal = root => {
    if (!root) return [];
    const stack = [root];
    let cur = null;
    const res = [];
    while (stack.length) {
        cur = stack.pop();
        res.push(cur.val);
        cur.right && stack.push(cur.right);
        cur.left && stack.push(cur.left);
    }
    return res;
}
~~~

~~~js
// 递归
const preorderTraversal = root => {
    const res = [];
    function dfs(curNode) {
        if (!curNode) return;
        res.push(curNode.val);
        dfs(curNode.left);
        dfs(curNode.right);
    }
    dfs(root);
    return res;
}
~~~

#### 中序

左中右

~~~js
// 递归
var inorderTraversal = function(root) {
    // 左中右
    const res = [];
    function dfs(curNode) {
        if (!curNode) return;
        dfs(curNode.left);
        res.push(curNode.val);
        dfs(curNode.right)
    }
    dfs(root);
    return res;
};
~~~

#### 后序

左右中

~~~js
// 迭代 出栈 中右左 入栈 中左右中 ，最后翻转一下res
var postorderTraversal = function(root) {
    const stack = [root];
    let cur = null;
    const res = [];
    while (stack.length) {
        cur = stack.pop();
        res.push(cur.val)
        cur.left && stack.push(cur.left);
        cur.right && stack.push(cur.right);
    }
    return res.reverse()
}
~~~

~~~js
var postorderTraversal = function(root) {
    const res = [];
    function dfs(curNode) {
        if (!curNode) return;
        dfs(curNode.left);
        dfs(curNode.right);
        res.push(curNode.val);
    }
    dfs(root);
    return res;
};
~~~

#### 层序遍历

~~~js
var levelOrder = function(root) {
    if (!root) return [];
    const queue = [root];
    const res = [];
    while (queue.length) {
        let len = queue.length;
        const curLevel = [];
        for (let i = 0; i < len; i++) {
            let node = queue.shift();
            curLevel.push(node.val);
            node.left && queue.push(node.left);
            node.right && queue.push(node.right)
        }
        res.push(curLevel)
    }
    return res;
};
~~~

