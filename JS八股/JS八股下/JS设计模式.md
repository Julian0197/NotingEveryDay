## JS设计模式

### 工厂模式

创建对象最常见的一种设计模式，不暴露创建对象的具体逻辑。将具体逻辑封装在一个函数中，这个函数被视为一个工厂。

#### 简单工厂模式

用于创建同一类的对象

~~~js
class Pet { // 小小的宠物店 
    constructor(type, name) {
    this.pet = ""
        switch (type) {
            case 'dog': this.pet = new Dog(name); break;
            case 'cat': this.pet = new Cat(name); break;
            case 'mouse': this.pet = new Mouse(name); break;
            default: this.pet = '你还没有小宠物，快去买一只吧';
        }
    }
}

// 购买新的小宠物
new Pet('dog', 'Spike')
new Pet('cat', 'Tom')
new Pet('mouse', 'Jerry')
~~~



用上述简单工厂模式对ajax发送请求的方法进行简单的封装。

~~~js
function getFunction(path, params) { // get请求  
    console.log(path, params)
}

function postFunction(path, params) { // post请求  
    console.log(path, params)
}

function putFunction(path, params) { // put请求  
    console.log(path, params)
}

function ajaxSend(type, path, params) { // ajax发送请求  
    switch (type) {
        case 'post': {
            postFunction(path, params)
            break;
        };
        case 'put': {
            putFunction(path, params)
            break;
        };
        default: 
     getFunction(path, params)
    }
}

ajaxSend('get', 'path', 'params')
~~~

如上就是我们日常对 ajax 发送请求方法的简单封装，根据传入的 type 类型来匹配不同的发送请求的通用方法，在同一种类型的方法各自实现自己的逻辑，比如 **get 请求参数放在 query 从 url 传递给后台**，而 **post 跟 put 的参数则是放在 body 里面**发送给后台。

#### 工厂方法模式

不同类型对象，提供不同的工厂。解决了简单工厂函数不方便添加新类的问题，因为如果要添加，需要修改唯一的工厂函数。

~~~js
const Pet = (() => { // 宠物店升级啦  
    const pets = {
        dog(name) { console.log(name) },
        cat(name) { console.log(name) },
        mouse(name) { console.log(name) },
        duck(name) { // 我是新来的宠物小鸭子      
            console.log(name)
        }
    }

    return class {
        constructor(type, name) {
            try { return pets[type](name) }
            catch (error) { console.log('你还没有小宠物，快去买一只吧') }
        }
    }
})()

// 重新购买小宠物
new Pet('dog', 'Spike')
new Pet('cat', 'Tom')
new Pet('duck', 'Duck')
~~~

添加新类（这里用duck举例）只需要在pet中新增一个方法



用工厂方法模式改造ajax的请求方法

~~~js
const ajaxType = {
    get(path, params) {
        console.log(path, params, 'query')
    },
    post(path, params) {
        console.log(path, params, 'body')
    },
    put(path, params) {
        console.log(path, params, 'body')
    }
}

function ajaxSend(way, path, params) { // ajax发送请求  
    try { ajaxType[way](path, params) }
    catch (error) { console.log('暂无匹配方法') }
}
ajaxSend('get', 'path', 'params')
~~~

#### 抽象工厂模式

抽象工厂模式是围绕一个超级工厂创建其他工厂，实际实现就是子类对这个超级工厂的继承。

headPet是宠物总店，normalPet类和fishPet类继承了headPet（超级工厂）

~~~js
class headPet { // 宠物总店
    sellpet(name) { // 出售宠物
        console.log('出售一只宠物', name)
    }
    desert(name) { // 遗弃宠物
        console.log('遗弃一只宠物', name)
    }
    operation(name, type) {
        switch (type) {
            case 'sell': {
                this.sellpet((name))
                break
            }
            default: {
                this.desert((name))
            }
        }
    }
}

class normalPet extends headPet { // 普通宠物分店
    constructor() {
        super()
    }
    dog(name, type) {
        this.operation(name, type)
    }
    cat(name, type) {
        this.operation(name, type)
    }
    mouse(name, type) {
        this.operation(name, type)
    }
}

class fishPet extends headPet { // 水族馆分店
    constructor() {
        super()
    }
    shark(name, type) {
        this.operation(name, type)
    }
    whale(name, type) {
        this.operation(name, type)
    }
}

function selectPet(shop) {
    switch (shop) {
        case 'normal': {
            return new normalPet()
        }
        case 'fish': {
            return new fishPet()
        }
        default: {
            console.log('暂无此分店哦！')
        }
    }
}

const normal = selectPet('normal')
normal.dog('Spike', 'sell') // 出售一只狗狗
normal.cat('Tom', 'desert') // 遗弃一只病猫
normal.mouse('Jerry', 'sell') // 出售一只小老鼠

const fish = selectPet('fish')
fish.shark('Shark', 'desert') // 遗弃一条死鱼
fish.whale('Whale', 'sell') // 出售一只鲸鱼
~~~



~~~js
function getFunction(path, params) { // get请求  
    console.log(path, params)
}

function postFunction(path, params) { // post请求  
    console.log(path, params)
}

function putFunction(path, params) { // put请求  
    console.log(path, params)
}

function ajaxInterface(type, path, params) { // ajax发送抽象
    switch (type) {
        case 'post': {
            return postFunction(path, params)
            break;
        };
        case 'put': {
            return putFunction(path, params)
            break;
        };
        default:
            return getFunction(path, params)
    }
}

function user() {
    const USER_URL_MAP = {
        getUser: 'getUserUrl',
        updateUser: 'updateUserUrl',
    }

    return {
        getUser(params) {
            return ajaxInterface('get', USER_URL_MAP['getUser'], params)
        },
        updateUser(params) {
            return ajaxInterface('post', USER_URL_MAP['getUser'], params)
        }
    }
}


function order() {
    const ORDER_URL_MAP = {
        getOrder: 'getOrderUrl',
        getOrderList: 'getOrderUrl',
        setOrder: 'setOrderUrl',
        delOrder: 'delOrderUrl',
        updateOrder: 'updateOrderUrl',
    }
    return {
        getOrder(params) {
            return ajaxInterface('get', ORDER_URL_MAP['getOrder'], params)
        },
        getOrderList(params) {
            return ajaxInterface('get', ORDER_URL_MAP['getOrderList'], params)
        },
        delOrder(params) {
            return ajaxInterface('post', ORDER_URL_MAP['delOrder'], params)
        }
    }
}

function senUrl(businessType) {
    switch (businessType) {
        case 'user': {
            return user
            break
        }
        case 'order': {
            return order
            break
        }
        default: {
            console.log('无此业务类型')
        }
    }
}

const userAction = senUrl('user')
userAction().getUser('用户信息哦')

const orderAction = senUrl('order')
orderAction().getOrder('订单信息哦')
~~~

上面用类似抽象工厂的方法实现了一个 ajax 请求方法的封装，将业务层报了一层，底层跟业务层剥离，可以针对各个业务自己实现部分的业务。