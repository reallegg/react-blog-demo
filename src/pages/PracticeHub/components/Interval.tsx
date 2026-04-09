import { useEffect, useState } from 'react'

export default function Interval() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    // TODO:
    // 1. 如果 running 为 false，直接不启动定时器
    // 2. 如果 running 为 true，启动 setInterval，每秒 seconds + 1
    // 3. 在 cleanup 中清除定时器
    if (!running) return

    const timer = setInterval(() => {
      setSeconds((s) => s + 1) //函数式更新，避免读到旧的seconds
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [running])

  return (
    <div>
      <h2>seconds: {seconds}</h2>
      <button onClick={() => setRunning(true)}>开始</button>
      <button onClick={() => setRunning(false)}>暂停</button>
      <button
        onClick={() => {
          setRunning(false)
          setSeconds(0)
        }}
      >
        重置
      </button>
    </div>
  )
}

// 为什么这里建议用 setSeconds(prev => prev + 1)
// 不懂，不太熟箭头函数，只是习惯了要这样写
// 如果直接写 setSeconds(seconds + 1) 会不会有闭包问题
//// 不懂，不太熟箭头函数，只是习惯了要这样写。
// 切换开始暂停时是否会产生多个定时器
// 不会，因为每次running状态改变，都会触发一次cleanup函数，然后再settup一下useeffect
