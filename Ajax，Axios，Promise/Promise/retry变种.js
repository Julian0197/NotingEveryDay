/**
 * 
 * @param {*} url 请求地址
 * @param {*} maxCount 最大重试次数
 * @param {*} delay 时间间隔
 */
function request(url, maxCount = 5, delay) {
  return fetch(url).catch((err) => {
    if (maxCount <= 0) {
      Promise.reject(err)
    } else {
      setTimeout(() => {
        request(url, maxCount - 1, delay)
      }, delay)
    }
  })
}

request('www.baidu.com', 6)
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })