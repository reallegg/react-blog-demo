import { useEffect, useState } from 'react'

function mockFetch(keyword: string): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        `${keyword}-结果1`,
        `${keyword}-结果2`,
        `${keyword}-结果3`,
      ])
    }, 800)
  })
}

export default function SearchFunc() {
  const [keyword, setKeyword] = useState('')
  const [list, setList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (keyword === '') return
    let canceled = false

    mockFetch(keyword).then((result) => {
      if (canceled) return
      setList(result)
      setLoading(false)
    })

    return () => {
      canceled = true
    }
  }, [keyword])

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(nextKeyword)
    setList([])
    setLoading(nextKeyword !== '')
  }

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => handleKeywordChange(e.target.value)}
        placeholder="请输入关键词"
      />
      {loading && <p>loading...</p>}
      <ul>
        {list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

// 为什么这题适合 useEffect
//  因为keyword一旦变化就要发送请求，而不是有一个集中的请求发送事件
// 为什么“根据 keyword 变化请求数据”属于副作用
// 同上
