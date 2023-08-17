1. CSS 动画，鼠标放在按钮上按钮变大，并有过渡效果

1. 利用transform，注意只有行内块或块级才可以
2. transition属性 设置过渡

```html
<button class="button">button</button>

<style>
  .button {
    display: inline-block;
    height: 40px;
    background-color: aqua;
    transition: transform 0.3s ease;
  }

  .button:hover {
    transform: scale(1.5);
  }
</style>
```

2. 使用 CSS 创建一个动画效果，使得一个正方形在页面上沿着水平和垂直方向循环移动。正方形应从页面左上角开始，顺时针依次经过右上角、右下角、左下角，最后回到左上角。

+ 利用css3 的animation：moveSquare持续4s，线性动画，无限循环
+ @keyframes规则 后接上动画名字，定义了关键帧动画
+ 在关键帧中，我们通过设置不同的 transform 值来控制正方形的位置。
+ 通过 translate 函数，我们可以将正方形在水平和垂直方向上进行移动。


~~~html
<style>
  .square {
    width: 100px;
    height: 100px;
    background-color: red;
    position: absolute;
    top: 0;
    left: 0;
    animation: moveSquare 4s linear infinite; /* 应用动画 */
  }

  @keyframes moveSquare {
    0% {
      transform: translate(0, 0); /* 起始位置 */
    }
    25% {
      transform: translate(100%, 0); /* 右上角 */
    }
    50% {
      transform: translate(100%, 100%); /* 右下角 */
    }
    75% {
      transform: translate(0, 100%); /* 左下角 */
    }
    100% {
      transform: translate(0, 0); /* 回到起始位置 */
    }
  }
</style>

<div class="square"></div>
~~~
