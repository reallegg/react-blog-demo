import { useMemo, useState } from 'react'

const bigList = Array.from({ length: 5000 }, (_, index) => ({
  id: index,
  name: `商品-${index}`,
}))

export default function UseMemoPractice() {
  const [keyword, setKeyword] = useState('')
  const [count, setCount] = useState(0)

  const filteredList = useMemo(() => {
    console.log('filter 执行了',keyword)
    // TODO: 根据 keyword 过滤 bigList
    return bigList.filter((item) => item.name.includes(keyword))
  }, [keyword])

  return (
    <div>
      
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索"
      />

      <button onClick={() => setCount(count + 1)}>
        unrelated count: {count}
      </button>

      <ul>
        {filteredList.slice(0, 20).map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

    </div>
  )
}