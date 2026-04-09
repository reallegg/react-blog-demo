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
    // TODO:
    // 1. keyword 为空时，不请求，list 清空
    // 2. keyword 有值时，设置 loading = true
    // 3. 调用 mockFetch(keyword)
    // 4. 请求结束后设置 list 和 loading
    if (keyword === '') {
      setList([])
      setLoading(false)
      return
    }

    setLoading(true)

    mockFetch(keyword).then((result) => {
      setList(result)
      setLoading(false)
    })

    return () => {
      setList([])
      setLoading(false)
    }
  }, [keyword])

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
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
