import { useEffect, useState } from 'react'

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
  const [list, setList] = useState<string[]>(products)

  const filteredList = (keyword: string) => {
    return products.filter((item) => item.includes(keyword))
  }

  useEffect(() => {
    setList(filteredList(keyword))
  }, [keyword])

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