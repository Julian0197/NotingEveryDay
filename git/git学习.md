# Git学习笔记

### Git简介

#### Git是分布式版本控制系统

**版本控制**：记录文件内容变化，查阅特定版本修订情况的系统

功能：

+ 记录文件修改的历史记录
+ 查看历史版本
+ 方便版本切换

**分布式：**

本地上有仓库，保存了整个项目的完整记录（包括历史），本地可以进行版本控制。

远程库可以进行所有的版本控制

远程库挂掉后，还可以在本地进行版本控制，只是不能向远程库提交

#### Git工作机制

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220726195905645.png" alt="image-20220726195905645" style="zoom:33%;" />

#### Git和代码托管中心

代码托管中心（Github）：基于网络服务器的远程代码仓库，帮忙维护远程库

+ 局域网
  + GitLab
+ 互联网
  + GitHub
  + Gitee

#### 本地库和远程库

**团队内部协作**

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220726200832022.png" alt="image-20220726200832022" style="zoom:33%;" />

**跨团队协作**

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220726200941226.png" alt="image-20220726200941226" style="zoom:33%;" />

### Git常用命令

#### 本地库初始化

~~~bash
git init
~~~

会在当前目录下创建了一个.git文件

.git目录中存放的是本地库相关的子目录和文件，不能随意删除

#### 设置签名

**作用：**区分不同开发人员身份

**辨析：**这里设置的签名和代码托管中心的账号密码没有关系



**项目级别/仓库级别**：仅在当前本地库范围内有效

~~~bash
git config user.name 用户名
git config user.email 邮箱号
~~~

信息保存在 `./.git/config`

**系统用户级别（一般用这个）：**登录当前操作系统的用户范围

~~~bash
git config --global user.name MSK
git config --global user.email msk123@foxmail.com
~~~

**级别优先级**

- 就近原则：项目级别优先于系统用户级别，二者都有时采用项目级别的签名
- 如果只有系统用户级别的签名，就以系统用户级别的签名为准
- 二者都没有不允许

#### 添加到暂存区 git add

添加文件到暂存区：`git add 文件名`

添加所有文件到暂存区：`git add .`

添加变化的文件到暂存区：`git add -A`

删除暂存区的文件：`git rm --cached 文件名`

#### 将暂存区的文件提交到本地库 git commit

作用：提交到本地库的文件，形成了历史版本

提交文件：`git commit -m "版本日志信息" 文件名`

提交所有文件：`git commit -m "版本日志信息"`

#### 查看历史版本 git log / git reflog

**查看完整历史版本**：`git log`

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220726204120079.png" alt="image-20220726204120079" style="zoom: 50%;" />

**查看精简历史版本**：`git reflog`

HEAD@{移动到当前版本需要多少步}

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220726204142731.png" alt="image-20220726204142731" style="zoom:50%;" />

#### **版本穿梭：git reset**

 本质:操作HEAD的指针，HEAD指针默认是指向最近的版本。

==基于索引操作（推荐）==

`git reset --hard 局部hash`

+ 先使用git reflog查看本地库的版本情况以及对应的局部版本号（hash）
+ 再使用git reset回到想去的版本

<img src="C:\Users\MSK\AppData\Roaming\Typora\typora-user-images\image-20220726204516040.png" alt="image-20220726204516040" style="zoom:67%;" />

**使用^：只能后退**

`git reset --hard HEAD^`

一个^表示后退一步，n 个表示后退n 步

**使用~：只能后退**

`git reset --hard HEAD~n`

表示后退n步

**reset命令的三个参数对比**

`--soft`：在本地库移动head指针

`--mixed`：在本地库移动head指针，重置暂存区

`--soft`：在本地库移动head指针，重置暂存区，重置工作区

#### 删除文件并找回

- 前提：删除前，文件存在时的状态提交到了本地库。
- 操作：`git reset --hard [指针位置]`
- 删除操作已经提交到本地库：指针位置指向历史记录
- 删除操作尚未提交到本地库：指针位置使用HEAD

#### 比较文件差异

- `git diff [文件名]`
  将工作区中的文件和暂存区进行比较
- `git diff [本地库中历史版本] [文件名]`
  将工作区中的文件和本地库历史记录比较
- 不带文件名比较多个文件

### Git的分支

有两个指针，head指针指向哪个分支，分支指针指向哪个版本

程序员将自己的工作从开发主线上分离开来，开发自己的分支不会影响主线分支的运行。

**优势：**

+ 同时并行推送多个功能开发，提高开发效率
+ 各个分支在开发过程中，如果某一个分支开发失败，不会对其他分支有任何影响。失败的分支删除即可。

#### 分支命令

| 命令名称            | 作用                             |
| ------------------- | -------------------------------- |
| git branch 分支名   | 创建分支                         |
| git branch -v       | 查看分支                         |
| git checkout 分支名 | 切换分支                         |
| git merge 分支名    | **把指定的分支合并到当前分支上** |

~~~bash
# 创建分支
NINGMEI@DESKTOP-IK6KIFG MINGW64 /d/ranan/git_test (master)
$ git branch hot-fix

# 查看分支
NINGMEI@DESKTOP-IK6KIFG MINGW64 /d/ranan/git_test (master)
$ git branch -v
  hot-fix 62d4fbc 3
* master  62d4fbc 3

# 切换分支
NINGMEI@DESKTOP-IK6KIFG MINGW64 /d/ranan/git_test (master)
$ git checkout hot-fix
NINGMEI@DESKTOP-IK6KIFG MINGW64 /d/ranan/git_test (hot-fix)

# 修改测试文件然后提交到本地库
# .... 

# 切换到master分支
NINGMEI@DESKTOP-IK6KIFG MINGW64 /d/ranan/git_test (hot-fix)
$ git checkout master

# hot-fix 合并到master上
NINGMEI@DESKTOP-IK6KIFG MINGW64 /d/ranan/git_test (master)
$ git merge hot-fix
Updating 62d4fbc..8bf846e
Fast-forward
 test | 1 +
 1 file changed, 1 insertion(+)
~~~

**合并分支**时，两个分支在**同一个文件的同一位置**有两套完全不同的修改时会产生代码冲突(以哪个分支的代码为主？)
此时需要人为决定
