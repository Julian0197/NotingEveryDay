// class RefImpl {
//   constructor(value) {
//     this._value = value
//   }
//   get value() {
//     const cur = this._value
//     this._value++
//     return cur
//   }
// }

// let a = new RefImpl(1)

// function test(ref) {
//   if (ref.value == 1 && ref.value  == 2 && ref.value  == 3) {
//     console.log('success')
//   }
// }

// test(a)

// const mergeSort = (arr) => {
//   const len = arr.length;
//   if (len < 2) return arr;
//   let middle = Math.floor(len / 2);
//   let left = mergeSort(arr.slice(0, middle));
//   let right = mergeSort(arr.slice(middle, len));
//   return merge(left, right);
// };

// const merge = (left, right) => {
//   const res = [];
//   while (left.length && right.length) {
//     if (left[0] <= right[0]) {
//       res.push(left.shift());
//     } else {
//       res.push(right.shift());
//     }
//   }
//   while (left.length) res.push(left.shift());
//   while (right.length) res.push(right.shift());
//   return res;
// };

const quickSort = arr => {
  if (arr.length < 2) return arr
  let pivot = arr[0]
  const left = [], middle = [], right = []
  arr.forEach(el => {
    if (el < pivot) {
      left.push(el)
    } else if (el == pivot) {
      middle.push(el)
    } else {
      right.push(el)
    }
  });
  return quickSort(left).concat(middle.concat(quickSort(right)))
}

console.log(quickSort([9, 1, 5, 7, 2, 8, 4, 2]));
