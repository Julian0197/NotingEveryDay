## WebComponent

### 背景

`Web Components`是原生的组件封装方案，与基于框架（Vue，React）相比，优势在于：
+ 无需编译，可以直接在浏览器运行
+ 利于SEO，语义更好，例如：人员卡片组件，渲染结果是 `<people-card/>` 而不是 `<div>`
+ 与技术栈无关，可以在任意前端框架使用，适合跨框架的组件库

案例：
1. `github`大量使用
2. `飞书云文档`组件也使用，因为接入方存在各种框架的可能

### 三大技术

#### 自定义元素

`window.customElements.define` 注册自定义元素，三个参数：
+ 自定义元素名称，必须带上`-`，防止和原生DOM元素重名
+ 类，继承自 `HTMLElment`，包含自定义元素的实现
+ 扩展参数（可选），指定元素继承于哪一个内置元素，如：`{ extends: 'p' }`

~~~js
class PeopleCard extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <style>
        .wrap {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }
      </style>
      <div class="wrap">
        <div>${this.getAttribute('name')}</div>
        <button>Follow</button>
      </div>
      `;
    }
  }
window.customElements.define('people-card', PeopleCard);
~~~

#### HTML模板

一直使用`innerHTML`或者`document.createElement`很不方便。可以采用`template`模板的形式。

~~~html
<body>
  <!-- <div class="wrap"></div> -->
  <people-card name="Zhang.san"></people-card>
  <template id="card-template">
    <style>
      .wrap {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
      }
    </style>
    <div class="wrap">
      <div class="name"></div>
      <button>Follow</button>
    </div>
  </template>
  <script>
    class PeopleCard extends HTMLElement {
      constructor() {
        super();
        const templateEl = document.getElementById('card-template');
        // 克隆模板元素中的所有子节点，并且设置为true表示深度克隆
        const content = templateEl.content.cloneNode(true);
        content.querySelector('.name').textContent = this.getAttribute('name');
        this.appendChild(content);
      }
    }
    window.customElements.define('people-card', PeopleCard);
  </script>
</body>
~~~

#### Shadow DOM

如果直接在html中定义样式，会污染全局。`Shadow DOM`支持在大部分元素上附加一个影子DOM，影子DOM内部的结构，样式和行为与外部隔离。

某些基础元素`<video />`其实就包含了shadow dom，这就是为什么能看到播放，音量调节等功能，但是检查元素时默认是隐藏的，需要在开发者工具的`Preference`中勾选`Show user agent shadow dom`。

通过 `el.attachShadow({ mode: 'open' | 'closed' })`，给el附加一个shadow dom。mode参数表示shadow dom内部的节点是否能被外部访问到。

### 插槽、事件及响应式

#### 插槽

仅在启用`shadow dom`时才会生效，包括默认插槽和命名插槽，和vue插槽语法一致。

~~~html
<!-- 模板中的slot -->
<slot name="desc" />

<!-- 使用 -->
<people-card name="Zhang.san">
  <div slot="desc">show description</div>
</people-card>
~~~

#### 事件

+ 组件内部通过`CustomEvent`自定义事件，并在需要时触发。
+ 组件外通过`addEventListener`监听

~~~js
// 组件内部
const myEvent = new CustomEvent('myEvent', {
  detail: 'xxx'
})
// 触发事件
this.disPatchEvent(myEvent)

// 组件外部监听
peopleCardEl.addEventListener('myEvent', (e) => {
  console.log(e.detail)
})
~~~

#### 响应式

当传入的name发生改变，web components没办法自动更新视图，需要手动实现。

~~~js
class PeopleCard extends HTMLELment {
  constructor {
    super()
    // ...
  }

  // 监听name属性变化
  static get observedAttributes() {
    return ['name']
  }

  // 接受属性变化的回调
  attributeChangedCallback()
}
~~~

**完整实例**

1. `peopleCard.js`

~~~js
class PeopleCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const templateEl = document.getElementById('card-template');
    const content = templateEl.content.cloneNode(true);
    const name = this.getAttribute('name');
    const nameEl = content.querySelector('.name');
    this.$nameEl = nameEl;
    nameEl.textContent = name;
    const btnEl = content.querySelector('button');
    const followMeEvent = new CustomEvent('followMe', {
      detail: 'xxx',
    });
    btnEl.addEventListener('click', () => {
      this.dispatchEvent(followMeEvent);
    });
    shadow.appendChild(content);
  }
  // 监听元素上name属性值的变化
  static get observedAttributes() {
    return ['name'];
  }
  // 接收属性变化的回调
  attributeChangedCallback() {
    const name = this.getAttribute('name');
    this.$nameEl.textContent = name;
  }
}
window.customElements.define('people-card', PeopleCard);
~~~

2. `index.html`

~~~html
<body>
    <people-card name="Zhang.san">
      <div slot="desc">Some description...</div>
    </people-card>
    <button onclick="changeName()">更改name</button>
    <template id="card-template">
      <style>
        /* host 伪类表示 shadow DOM 附加的那个元素 */
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }
      </style>
      <div class="wrap">
        <div class="name"></div>
        <slot name="desc"></slot>
        <button>Follow</button>
      </div>
    </template>
    <script src="peopleCard.js"></script>
    <script>
      const peopleCardEl = document.querySelector('people-card');
      peopleCardEl.addEventListener('followMe', (e) => {
        console.log('trigger followMe:', e.detail);
      });
      const changeName = () => {
        const peopleCardEl = document.querySelector('people-card');
        peopleCardEl.setAttribute('name', 'Li.si');
      };
    </script>
  </body>
~~~

### vue3

vue3.2已经实现了自定义web component的api。