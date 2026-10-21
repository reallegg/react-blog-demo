// 一. 数组去重
// 用 Set 数据结构，Set 的特性是同一个值只能存一份
export function OneArrayFilter(array: number[]): number[] {
  const set = new Set(array)
  return Array.from(set)

  // 2. 
  // return [...new Set(array)]

  // 3.
  // return array.filter((item, index) => array.indexOf(item) === index )
}

// 二. 数组扁平化
//只能处理一层的写法：for循环，一但判断到object就开始展开
export function FlatterArray(array: (number | number[])[]): number[] {
  const flattered: number[] = []
  for(const item of array){
    if(Array.isArray(item)){
      flattered.push(...item)
      continue
    }
    flattered.push(item)
  }
  return flattered
}

//迭代处理多层的写法
type NestedNumber = number | NestedNumber[]

export function FlatterIteration(array: NestedNumber[]): number[] {
  const falttered: number[] = []
  for(const item of array){
    if(Array.isArray(item)){
      falttered.push(...FlatterIteration(item))
      continue
    }
    falttered.push(item)
  }
  return falttered
}

// url参数解析
// parseQuery('https://a.com?id=1&name=tom')
// { id: '1', name: 'tom' }
export function UrlParamParsing(url: string): Record<string, string> {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return {}

  const query = url.slice(queryStart + 1).split('#', 1)[0]
  return Object.fromEntries(new URLSearchParams(query))
}
