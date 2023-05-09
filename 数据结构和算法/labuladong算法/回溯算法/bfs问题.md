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

#### 解开密码锁的最少次数

+ 抽象成图，每个节点周围有8个相邻节点（4个密码，向上拨向下拨）
+ 队列存储节点，遍历队列将队列中所有节点向外扩散
+ 避免死循环：从0000到1000时，1000还会回拨到0000
+ 遇到deadends需要跳过，达到target返回次数，没找到返回-1

~~~js
var openLock = function(deadends, target) {
    // 防止死循环，记录已经走过的
    let visited = new Set('0000')
    // 障碍，遇到要跳过
    let dead = new Set(deadends)
    let q = ['0000']
    let step = 0
    // 广度优先搜索
    while (q.length > 0) {
        let sz = q.length
        // bfs遍历当前队列节点，再向外扩散
        for (let i = 0; i < sz; i++) {
            let cur = q.shift()
            if (dead.has(cur)) continue
            if (cur == target) return step
            for (let i = 0; i < 4; i++) {
                let up = plusOne(cur, i)
                if (!visited.has(up)) {
                    visited.add(up)
                    q.push(up)
                }
                let down = minusOne(cur, i)
                if (!visited.has(down)) {
                    visited.add(down)
                    q.push(down)
                }
            }
        }
        step++
    }
    return -1
};

// 向上拨动
function plusOne(s, j) {
    let arr = s.split("")
    if (arr[j] == '9') {
        arr[j] = '0'
    } else {
        arr[j] = (parseInt(arr[j]) + 1).toString()
    }
    return arr.join('')
}

// 向下拨动
function minusOne(s, j) {
    let arr = s.split("")
    if (arr[j] == '0') {
        arr[j] = '9'
    } else {
        arr[j] = (parseInt(arr[j]) - 1).toString()
    }
    return arr.join('')
}
~~~

#### 单词接龙

解法同上，bfs广度优先遍历

~~~js
var ladderLength = function(beginWord, endWord, wordList) {
    // 转化为Set效率更高
    let wordSet = new Set(wordList)
    // 不满足下面条件，永远无法达到endWord
    if (wordSet.size === 0 || !wordSet.has(endWord)) return 0
    let visited = new Set()
    visited.add(beginWord)
    let q = [beginWord]
    let step = 1
    while (q.length > 0) {
        let sz = q.length
        for (let i = 0; i < sz; i++) {
            let cur = q.shift()
            if (cur == endWord) return step 
            // 对单词的每个字母遍历处理
            for (let j = 0; j < cur.length; j++) {
                // 97-122对应a-z的ascii码
                for (let c = 97; c <= 122; c++) {
                    let newWord = cur.slice(0, j) + String.fromCharCode(c) + cur.slice(j+1)
                    if (!wordSet.has(newWord) || visited.has(newWord)) continue
                    visited.add(newWord)
                    q.push(newWord)
                }
            }
        }
        step++
    }
    return 0
};
~~~

#### 华为笔试-猴子下树

给定一棵树，这个树有n个节点，节点编号从0开始依次递增，0固定为根节点。在这棵树上有一个小猴子，初始时该猴子位于根节点(0号) 上，小猴子一次可以沿着树上的边从一个节点挪到另一个节点，但这棵树上有一些节点设置有障碍物，如果某个节点上设置了障碍物，小猴子就不能通过连接该节点的边挪动到该节点上。问小猴子是否能跑到树的叶子节点(叶子节点定义为只有一条边连接的节点)，如果可以，请输出小猴子跑到叶子节点的最短路径(通过的边最少)，否则输出字符串NULL。

输入

第一行给出数字n，表示这个树有n个节点，节点编号从0开始依次递增，0固定为根节点，1<=n<10000

第二行给出数字edge，表示接下来有edge行，每行是一条边

接下来的edge行是边: x y，表示x和y节点有一条边连接

边信息结束后接下来的一行给出数字block，表示接下来有block行，每行是个障碍物

接下来的block行是障碍物: X，表示节点x上存在障碍物

输出

如果小猴子能跑到树的叶子节点，请输出小猴子跑到叶子节点的最短路径(通过的边最少)，比如小猴子从0经过1到达2 (叶子节点) ，那么输出“0->1->2”，否则输出“NULL”。注意如果存在多条最短路径，请按照节点序号排序输出，比如0->1和0->3两条路径，第一个节点0一样，则比较第二个节点1和3，1比3小，因此输出0->1这条路径。再如 0->5->2->3 和0->5->1->4，则输出 0->5-31->4

样例2

~~~css
输入: 7
          6
          0 1
          0 3
          1 2
          3 4
          1 5
          5 6
          1
输出: 0->1->2
解释: 节点4上有障碍物，因此0-3-4这条路不通，节点2和节点6都是叶子节点，但0->1->2比0->1->5->6路径短(通过的边最少) ，因此输出为0->1->2
~~~

解法：
+ nxs存储临近节点，如果只有一个节点，表明是叶子结点
+ 如果不是叶子结点，遍历他的临近节点，并添加到路径中
+ 注意：如果临近节点已被访问（父亲节点）或者在障碍节点中，就不加入队列
+ 以’->‘输出路径，如果所有节点访问完没找到叶子节点，输出'Null'

~~~js
// ACM输入输出模式
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let n = 0 // 节点个数
let nxs = {} // 临近节点列表
let edge = 0 // 边个数
let blocks = new Set() // 存储障碍节点
let block = 0 // 障碍节点的个数

rl.on('line', function(line) {
  if (n === 0) {
    n = parseInt(line.trim())
  } else if (edge === 0) {
    edge = parseInt(line.trim())
  } else if (edge > 0) {
    const [u, v] = line.trim().split(" ").map(x => parseInt(x))
    if (!(u in nxs)) nxs[u] = []
    if (!(v in nxs)) nxs[v] = []
    nxs[u].push(v)
    nxs[v].push(u)
    edge--
  } else if (block === 0) {
    block = parseInt(line.trim())
  } else if (block > 0) {
    const b = parseInt(line.trim())
    blocks.add(b)
    block--
  }
}).on('close', function() {
  // 队列是对象数组：当前节点，已遍历路径
  const q = [] 
  if (!block.has(0)) q.push([0, [0]])
  const visited = new Set() // 已经遍历过的节点
  visited.add(0)
  while (q.length > 0) {
    const [cur, path] = q.shift
    // 叶子节点
    if (node !== 0 && nxs[node].length === 1) {
      console.log(path.join('->'))
      return
    }
    // 不是叶子节点，遍历临近节点，并添加到队列
    for (const nx of nxs[node]) {
      // 跳过已经访问过的和障碍节点
      if (visited.has(nx) || blocks.has(nx)) continue
      visited.add(nx)
      q.push([nx, [...path, nx]])
    }
  }
  console.log('Null')
})
~~~

#### 钥匙和房间

解法1：dfs，深度优先

~~~js
var canVisitAllRooms = function(rooms) {
    const dfs = (key, rooms, visited) => {
        if (visited[key]) return
        visited[key] = true
        for (const k of rooms[key]) {
            dfs(k, rooms, visited)
        }
    }
    const visited = new Array(rooms.length).fill(false)
    dfs(0, rooms, visited)
    console.log(visited)
    for (let i of visited) {
        if (!i) {
            return false
        }
    }
    return true
};
~~~

解法2：BFS，有向图

~~~js
var canVisitAllRooms = function(rooms) {
    const bfs = rooms => {
        const visited = new Array(rooms.length).fill(0)
        visited[0] = 1
        let queue = []
        queue.push(0)
        while (queue.length > 0) {
            let key = queue.shift()
            for (let k of rooms[key]) {
                if (!visited[k]) {
                    queue.push(k)
                    visited[k] = 1
                }
            }
        }
        for (let i of visited) {
            if (i === 0) return false
        }
        return true
    }
    return bfs(rooms)
};
~~~