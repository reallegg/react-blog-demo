import { useEffect, useState } from 'react'

export default function CountDown() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = String(count)
  }, [count])

  return (
    <div>
      <h2>count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  )
}

// 点击按钮后，标题是否同步变化
// 会
// 没有依赖数组时会怎样
// 标题不会同步变化
// 写 [] 时为什么不对
// []的时候只会在组件重新挂载的时候才运行document.title，setCount不会引起该组件重新挂载
