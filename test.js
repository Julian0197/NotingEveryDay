const arr = [3,8,9,1,12,2,4,1,7,5]
const arrSort = quickSort(arr)
console.log(arrSort)

function quickSort(arr, left, right) {
  let len = arr.length;
  if (len < 2) return arr;
  if (len == 2) return arr[0] <= arr[1] ? arr : swap(arr, 0, 1)
  left = typeof left !== 'number' ? 0 : left
  right = typeof right !== 'number' ? len-1 : right
  
  if (left < right) {
    // paritition将nums划分为左边都比nums[index]小，右边都比nums[index]大
    let index = partition(arr, left, right)
    quickSort(arr, left, index-1)
    quickSort(arr, index+1, right)
  }
  return arr
}

function partition(nums, left, right) {
  let randomIndex = left + Math.floor(Math.random() * (right-left))
  // 交换left和randomIndex的位置
  swap(nums, randomIndex, left)
  let pivot = nums[left]
  // 此时基准值在第一个元素
  while (left < right) {
    // 从右边开始找比基准值小的元素，放在基准值位置（一开始是最左边）
    while (left < right && nums[right] >= pivot) right--
    nums[left] = nums[right] 
    // 从左边找比基准值大的元素，放在刚刚的right位置，right位置的数据已经移动到左边了
    while (left < right && nums[left] < pivot) left++
    nums[right] = nums[left]
  }
  // 最后left=right，这个位置放pivot
  nums[left] = pivot
  return left
}

function swap(arr, left, right) {
  [arr[left], arr[right]] = [arr[right], arr[left]]
  return arr
}

