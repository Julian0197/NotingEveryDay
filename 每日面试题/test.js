class RefImpl {
  constructor(value) {
    this._value = value
  }
  get value() {
    const cur = this._value
    this._value++
    return cur
  }
}

let a = new RefImpl(1)

function test(ref) {
  if (ref.value == 1 && ref.value  == 2 && ref.value  == 3) {
    console.log('success')
  }
}

test(a)