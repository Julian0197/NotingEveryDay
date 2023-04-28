BFS问题的本质：在一张图中找到从`start`到`target`的最近距离

#### 二叉树的最小深度

1.dfs递归
~~~js
var minDepth = function(root) {
    // 空节点，返回0
    if (!root) return 0
    // 叶子节点返回1
    if (root.left == null && root.right == null) return 1
    let left = minDepth(root.left)
    let right = minDepth(root.right)
    // 当前节点的左右孩子有一个为空，返回不为空的孩子节点的深度+1
    if (root.left == null || root.right == null) return left + right + 1
    // 两个节点都为空，比较返回最小深度的那个节点，再+1
    if (root.left !== null && root.right !== null) return Math.min(left, right) + 1
};
~~~

2.bfs：相比dfs时间复杂度低，可以在不遍历完整颗树的情况下算出结果

while循环控制一层一层往下走，for循环利用size控制从左到右的遍历
~~~js
var minDepth = function(root) {
    if (!root) return 0
    let queue = [root]
    let depth = 1
    while (queue.length) {
        let size = queue.length
        for (let i = 0; i < size; i++) {
            let cur = queue.shift()
            if (cur.left == null && cur.right == null) return depth
            cur.left && queue.push(cur.left)
            cur.right && queue.push(cur.right)
        }
        depth++
    }
};
~~~