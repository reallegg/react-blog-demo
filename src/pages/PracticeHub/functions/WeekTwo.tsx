//deepClone 基础版
// obj = {
//   user: 'viki',
//   info: {
//     age: 22,
//     position: 'teacher'
//   }
// }

// TODO: 待完善，暂时保留为注释，避免阻塞编译。
/*
function deepClone(obj) {
  //1. 判断是否是object
  //2. 判断是object还是array
  //3. 复制
}
*/

//deepClone 处理循环引用
//对象数组转树
//树转列表
//EventBus


//防抖：当函数执行后，必须要间隔固定的时间才能再次执行，期间如果被触发，则会让间隔再次计时
// TODO: 待完善，暂时保留为注释，避免阻塞编译。
/*
function denounce(func :any, delay : Number) {
  let timer = null

  return func(() => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }, timer)
}
*/
