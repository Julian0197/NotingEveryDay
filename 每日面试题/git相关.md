### git fetch 与 git pull
git pull 后，代码会自动合并到本地分支。而git fetch会忽略掉这个merge操作。
git pull = git fetch + git merge
### git pull 和 git pull --rebase
git pull包含一个--merge参数，两者的区别在于merge和rebase

+ merge会创建一个新的commit，如果合并后有冲突需要解决冲突后重新commit
+ rebase

### 冲突
+ 我在没有git pull --rebase到最新代码的时候，还进行了开发，并且git push了当前修改，别人在pull会产生冲突。我来解决的话是不是：1.git pull --rebase拉取最新代码，此时有冲突，分支会从dev->空分支。 2.每处理完一次本地commit冲突，用git add标记冲突已处理完，用git rebase --continue继续处理下一个本地commit，也可以先用git rebase -i将本地的commit合并为一个commit，这样git pull --rebase就能一次处理所有的冲突
+ 刚刚是这样：我在git commit后git pull，shuai同意了这次合并，本地commit已经合并到远程。但是我又修改了代码，提交的时候没有创建新的commit，而是使用git commit --amend，想要追加修改。会产生冲突。              解决方法：1.git reset --soft <上上一次的commit log>，这时候你本地的第一次commit和第二次commit --amend会复原 2.git stash 3.git pull --rebase 拉取远程最新代码，git stash pop这时候不会有冲突 4. git add git commit git push正常提交

### 合并分支
当前处于feat分支，先要合并feat分支到远程的dev，做法：
+ 将本地feat分支push到远程
+ 本地切换到dev分支 git checkout dev，
+ 拉取最新代码git pull --rebase，
+ 将本地feat分支合并到本地dev git merge feat --no--ff 
  
  
**详解git merge feat 和 git merge feat --no--ff的区别**

假设我们有如下的提交历史，其中 feat 分支和 master 分支分别指向不同的提交：
~~~css
          A---B---C feat
         /         
    D---E---F---G---H master

~~~
使用 git merge feat 命令合并 feat 分支后，由于 master 分支可以直接“快进”（fast-forward）到 feat 分支的最新提交 C，因此 Git 不会创建新的合并提交对象，而是直接将 master 分支指向 C。此时，提交历史变成了：
~~~css
          A---B---C feat
                     \
    D---E---F---G---H---C' (master)

~~~
这里的 C' 是由 git merge 创建的一个新提交对象，它包含了 feat 分支和 master 分支的提交内容。

使用 git merge feat --no-ff 命令合并 feat 分支后，Git 会创建一个新的合并提交对象，它包含了 feat 分支和 master 分支的所有提交内容。此时，提交历史变成了：
~~~css
          A---B---C feat
         /         \   \
    D---E---F---G---H---I (master)

~~~

总结：两者区别在于，普通的merge，很难区分哪些提交来自 master 分支，哪些来自 feat 分支。因此，在需要保留分支历史的情况下，使用 --no-ff 选项合并分支会更加有用。