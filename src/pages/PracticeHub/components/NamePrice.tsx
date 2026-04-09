import { useEffect, useMemo, useState } from 'react'

function Child({ options }) {
  useEffect(() => {
    console.log('Child effect run',options.sortBy)
  }, [options])

  return <div>child</div>
}

export default function MemoObjectPractice() {
  const [sortBy, setSortBy] = useState('name')
  const [count, setCount] = useState(0)

  // 先故意不用 useMemo
  const options = useMemo(() => {
    return {
      pageSize: 10,
      sortBy,
    }
  },[sortBy])

  // TODO:
  // 把上面改成 useMemo 版本，观察 Child effect 是否减少执行
  

  return (
    <div>
      <button onClick={() => setSortBy('price')}>sort by price</button>
      <button onClick={() => setSortBy('name')}>sort by name</button>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>

      <Child options={options} />
    </div>
  )
}