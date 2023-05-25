#### LRU算法

全称Least Recently Used，是一种缓存淘汰算法，根据访问的时序来淘汰。

请你设计并实现一个满足  LRU (最近最少使用) 缓存 约束的数据结构。
实现 LRUCache 类：
LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存
int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存中插入该组 key-value 。如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键字。
函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

**示例：**
LRUCache类有一个最大缓存数，put和get方法时间复杂度必须为O(1)
~~~js
var cache = new LRUCache(2);

	cache.put(1, 1);
	// cache = [(1, 1)]

	cache.put(2, 2);
	// cache = [(2, 2), (1, 1)]

	cache.get(1);  // 返回 1
	// cache = [(1, 1), (2, 2)]
	// 解释：因为最近访问了键 1，所以提前至队头
	// 返回键 1 对应的值 1

	cache.put(3, 3);
	// cache = [(3, 3), (1, 1)]
	// 解释：缓存容量已满，需要删除内容空出位置
	// 优先删除久未使用的数据，也就是队尾的数据
	// 然后把新的数据插入队头

	cache.get(2);  // 返回 -1 (未找到)
	// cache = [(3, 3), (1, 1)]
	// 解释：cache 中不存在键为 2 的数据

	cache.put(1, 4);    
	// cache = [(1, 4), (3, 3)]
	// 解释：键 1 已存在，把原始值 1 覆盖为 4
	// 不要忘了也要将键值对提前到队头
~~~

**设计：**
+ 读取数据：刷新位置，浮到顶部
+ 写入数据：
  + 之前存在：更新value，浮到顶部
  + 之前不存在：有位置直接写入，浮到顶部；没位置，删掉最久没使用的，写入浮到顶部
+ 选择哈希表，查找复杂度为O(1)，但是哈希表是无序的，无法记录元素的访问时序
+ 快速删除得依靠双向链表（这里的删除指的是删除对应指针的节点，不是删除对应某个val的节点）：
  + 数组的移动和删除复杂度都是O(n)
  + 单向链表删除节点要找到前驱节点，只能花O(n)从前序遍历查找
  + 双向链表复杂度为O(1)
+ **如何结合双向链表和哈希表**
  + 双链表节点：存key和对应的val
  + 哈希表：快速访问双链表节点，key是双链表中的key，value为链表节点的指针引用

~~~js
// 定义双链表数据结构
class ListNode {
  constructor(key, value) {
    this.key = key
    this.value = value
    this.next = null
    this.prev = null
  }
}

// 定义LRUCache，利用哈希表
// 设计头尾虚拟节点的意义：方便快速取到真实头尾节点
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity // 容量
    this.hash = {} // 哈希表
    this.count = 0 // 缓当前缓存数
    this.dumyHead = new ListNode // 虚拟头结点
    this.dumytail = new ListNode // 虚拟尾结点
    this.dummyHead.next = this.dummyTail
    this.dummyTail.prev = this.dummyHead.next // 还未添加真实节点，虚拟头尾相连
  }
  // get取值：找不到返回-1。被读取节点也要刷新位置，移动到链表头结点
  get(key) {
    let node = this.hash[key] // 从哈希表中找到对应双链表的节点
    if (node === null) return -1 // 没找到
    this.moveToHead(node) // 移到链表头
    return node.value // 返回val
  }

  moveToHead(node) {
    this.removeFromList(node) // 先走链表中删除
    this.addToHead(node) // 再加到链表头部
  }

  removeFromList(node) {
    // 存储被删除节点的前驱和后续节点
    let temp1 = node.prev
    let temp2 = node.next
    // 更换next和prev的指向
    temp1.next = temp2
    temp2.prev = temp1
  }

  addToHead(node) {
    // 插入节点位于虚拟头结点和真实头节点之间
    node.prev = this.dummyHead
    node.next = this.dummyHead.next
    // 更改原来真实头节点的prev和虚拟头结点的next，都指向node
    this.dummyHead.next.prev = node
    this.dummyHead.next = node
  }

  // put方法：写入新数据，要先检查容量，容量满了，删除尾结点，再创建新节点，添加到链表头，并更新哈希表；写入的是已有数据，更新val，并刷新节点位置到链表头。
  put(key, value) {
    let node = this.hash[key] // 从hash表获取链表中的node
    if (node === null) { // 不存在要新增
      if (this.count === this.capacity) { // 容量已满
        this.removeLRUItem() // 删除链表尾元素
      }
      let newNode = new ListNode(key, value) // 生成新节点
      this.hash[key] = newNode // hash表也添加
      this.count++ // 缓存数+1
      this.addToHead(newNode)
    } else { // 已经存在的元素
      node.value = value // 更新val
      this.moveToHead(node) // 移动到表头
    }
  }

  removeLRUItem() {
    let tail = this.popTail() // 删除链表尾部元素
    delete this.hash[tail.key] // 哈希表中也删除
    this.count-- // 缓存数-1
  }

  popTail() {
    let tail = this.dummyTail.prev // 获取真实链表尾部元素
    this.removeFromList(tail) // 删除真实尾部元素
    return tail // 返回被删除的元素，要在hash表中再删除
  }
}
~~~