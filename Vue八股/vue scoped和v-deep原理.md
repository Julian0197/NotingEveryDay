### Scoped CSS的原理

~~~css
<div class="login">登录</div>
<style scoped>
.login {
    width: 100px;
    height: 100px
}
</style>
~~~

+ 设置scoped的css属性，经过打包之后：多了一个`data-v-hash`属性，PostCSS给一个组件中的所有DOM加上了独一无二的动态属性（子组件标签对应的Dom元素是该组件的根元素）。
+ 又给每一个css选择器中最后一个选择器单元额外添加了对应的**属性选择器**，`原选择器[data-v-实例标识]`

作用：当一个vue文件，写了一个scoped style时，使得css样式只能作用于当前组件元素（当前组件的data-v-hash一样），做到了样式隔离。

注意：
+ 标识符`data-v-hash`是针对于每一个组件的实例，不是针对组件的类（hash是vue-loader生成的）
+ 子组件只包含根标签，不能渗透到子组件内部，属性选择器只作用于当前template

~~~css
<div data-v-257dda99b class="login">登录</div>
<style scoped>
.login[data-v-257dda99b] {
    width: 100px;
    height: 100px
}
</style>
~~~

###  >>>、/deep/、::v-deep深度选择器的原理

应用场景：想要修改当前子组件的样式，但是又不影响该子组件在其他页面的样式时候，使用深度选择器修改样式。

原理：vue不会给深度选择器后面的选择器单元添加 属性选择器`[data-v-实例标识]`，下面例子中的`.van-popup__close-icon`，而是给深度选择器前面的选择器单元增加属性选择器。因此后面的选择器样式能够选择到子组件中的元素。

~~~css
.pop-up_content {
  ::v-deep .van-popup__close-icon {
    margin-right: 12px;
  }
}
~~~
