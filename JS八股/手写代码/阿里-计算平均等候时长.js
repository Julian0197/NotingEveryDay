// 用户平均排队时间的题

// 有家馆子只有一位厨师。有一个顾客数组 customers ，其中 customers[i] = [arrivali, timei] ：
// ● arrivali 是第 i 位顾客到达的时间，到达时间按 非递减 顺序排列。
// ● timei 是给第 i 位顾客做菜需要的时间。
// 当一位顾客到达时，将他的订单给厨师，厨师一旦空闲的时候就开始做这位顾客的菜。每位顾客会一直等待到厨师完成他的订单。厨师同时只能做一个人的订单。厨师会严格按照 订单给他的顺序 做菜。
// 请你返回所有顾客需要等待的 平均 时间。
 
// 示例 1：
// 输入：customers = [[1,2],[2,5],[4,3]]
// 输出：5.00000
// 解释：
// 1) 第一位顾客在时刻 1 到达，厨师拿到他的订单并在时刻 1 立马开始做菜，并在时刻 3 完成，第一位顾客等待时间为 3 - 1 = 2 。
// 2) 第二位顾客在时刻 2 到达，厨师在时刻 3 开始为他做菜，并在时刻 8 完成，第二位顾客等待时间为 8 - 2 = 6 。
// 3) 第三位顾客在时刻 4 到达，厨师在时刻 8 开始为他做菜，并在时刻 11 完成，第三位顾客等待时间为 11 - 4 = 7 。
// 平均等待时间为 (2 + 6 + 7) / 3 = 5 。
function foo(customers) {
  let totalW = 0 // 总等待
  let curT = 0 // 当前时间
  let avgT = 0
  customers.forEach((arrival, time) => {
    // 当前时间小于到达时间
    if (curT < arrival) {
      curT = arrival
    }
    totalW += curT - arrival + time
    curT += time
  })
  avgT = totalW / customers.length
  return avgT
}