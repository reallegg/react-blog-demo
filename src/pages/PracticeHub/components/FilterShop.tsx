import { useMemo, useState } from 'react'

const products = [
  'iPhone',
  'iPad',
  'MacBook',
  'AirPods',
  'Apple Watch',
  'Magic Mouse',
]

export default function FilterPractice() {
  const [keyword, setKeyword] = useState('')
  const list = useMemo(
    () => products.filter((item) => item.includes(keyword)),
    [keyword],
  )

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索商品"
      />
      <ul>
      {
        list.map((product) => {
          return <li key={product}>{product}</li>
        })
      }
      </ul>
    </div>
  )
}
