<img src="https://labuladong.github.io/algo/images/%e5%85%ac%e5%85%b1%e7%a5%96%e5%85%88/1.jpeg">

使用`git rebase master` 命令合并两个分支时。首先，找到这两条分支的最近公共祖先 `LCA`，然后从 `master` 节点开始，重演 `LCA` 到 `dev` 几个 `commit` 的修改，如果这些修改和 `LCA` 到 `master` 的 `commit` 有冲突，就会提示你手动解决冲突，最后的结果就是把 `dev` 的分支完全接到 `master` 上面。



leetcode原题：二叉树的最近公共祖先

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

分析：

+ 递归函数目的：找到p,q最近的root节点
+ 递归结束条件：root为空，说明到达终点，返回null。root为p或者q，返回那个节点，因为这个时候的最近公共祖先不可能在该节点的子树下。
+ 可以理解为二叉树的后序遍历，找到p或q节点后，再向上找第一个相交的点
+ 后续遍历的操作
  + 如果左右子树递归都有结果，说明pq分别在当前root的两侧，返回root
  + 如果左右子树递归没有结果，说明找不到当前节点不在root的子树下，返回null
  + 如果有一个子树有递归结果，返回这个子树的递归结果，说明pq在这个子树之下

~~~js
var lowestCommonAncestor = function(root, p, q) {
    if (root === null) return null
    if (root === p || root === q) return root
    const left = lowestCommonAncestor(root.left, p, q)
    const right = lowestCommonAncestor(root.right, p, q)
    if (left && right) return root
    if (!left && !right) return null
    return left === null ? right : left
};
~~~

