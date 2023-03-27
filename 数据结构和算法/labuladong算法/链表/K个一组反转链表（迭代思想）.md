### 1 K个一组反转链表
`reverseKGroup(head, 2)`为两个元素一组反转一个链表
+ 先实现迭代反转链表
+ 再实现迭代反转一个区间内的链表
+ 将head指针移动到后面这段链表的开始，然后继续递归调用`reverseKGroup(head, 2)`
+ `newHead.next = reverseKGroup(b, k)`
<img src="https://labuladong.github.io/algo/images/kgroup/2.jpg" alt="image-20220703161017387" style="zoom: 30%;" />

结合1.1和1.2
~~~js
var reverseKGroup = function(head, k) {
    if (head === null) return head
    let a = head, b = head
    // 如果当前剩余元素不满k个不用翻转
    for (let i = 0; i < k; i++) {
        if (b === null) return head
        b = b.next
    }
    let newHead = reverse(a, b)
    a.next = reverseKGroup(b, k)
    return newHead
};

// 反转区间[a, b）区间的链表节点，其中a是头结点
var reverse = function(a, b) {
    let cur = a, pre = null, nxt = a
    while (cur !== b) {
        nxt = cur.next
        cur.next = pre
        pre = cur
        cur = nxt
    }
    return pre
}
~~~
#### 1.1 反转链表（迭代）
先实现一个`reverse`能够反转一个区间之内的元素，给定链表头结点
~~~js
var reverseList = function(head) {
    let pre = null, cur = head, nxt = head
    while (cur !== null) {
        nxt = cur.next
        // 节点反转
        cur.next = pre
        // 更新指针
        pre = cur
        cur = nxt
    }
    return pre
};
~~~
### 1.2 反转[a, b)之间的链表（迭代,不管前后）
实际就是while循环的结束条件从null改成b
~~~js
var reverseList = function(head, a, b) {
    // 先遍历到a节点

    let pre = null, cur = a, nxt = a
    while (cur !== b) {
        nxt = cur.next
        // 节点反转
        cur.next = pre
        // 更新指针
        pre = cur
        cur = nxt
    }
    return pre
};
~~~
### 2 迭代反转前k个节点的链表
~~~js
var reverseBetween = function(head, left, right) {
    // 虚拟头结点处理边界情况
    let dummy = new ListNode(-1)
    dummy.next = head
    let p = dummy
    for (let i = 0; i < left - 1; i ++) {
        p = p.next
    }
    // 缓存这个前驱节点到leftHead
    let leftHead = p
    // start是反转区间的第一个节点
    let start = leftHead.next
    let prv = start, cur = start.next
    for (let i = left; i < right; i++) {
        let next = cur.next
        cur.next = prv
        prv = cur
        cur = next
    }
    leftHead.next = prv
    start.next = cur
    return dummy.next
};
~~~