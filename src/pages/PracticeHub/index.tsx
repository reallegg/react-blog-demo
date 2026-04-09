import { useState } from 'react'
import CountDown from './components/CountDown.tsx'
import Interval from './components/Interval.tsx'
import SearchFunc from './components/SearchFunc.tsx'
import FullName from './components/CountFullName.tsx'
import FilterShop from './components/FilterShop.tsx'
import BigFilter from './components/BigFilter.tsx'
import NamePrice from './components/NamePrice.tsx'
type TabId = 'countdown' | 'interval' | 'search' | 'fullName' | 'filterShop' | 'bigFilter' | 'namePrice'

const tabs: { id: TabId; label: string }[] = [
  { id: 'countdown', label: 'CountDown（标题）' },
  { id: 'interval', label: 'Interval（定时器）' },
  { id: 'search', label: 'SearchFunc（搜索）' },
  { id: 'fullName', label: 'FullName（全名）' },
  { id: 'filterShop', label: 'FilterShop（过滤）' },
  { id: 'bigFilter', label: 'BigFilter（大过滤）' },
  { id: 'namePrice', label: 'NamePrice（名称价格）' },
]

export default function PracticeHub() {
  const [active, setActive] = useState<TabId>('countdown')

  return (
    <div style={{ width: 'min(100%, 420px)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          justifyContent: 'center',
        }}
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            style={{
              borderColor: active === id ? '#646cff' : undefined,
              opacity: active === id ? 1 : 0.85,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {active === 'countdown' && <CountDown />}
        {active === 'interval' && <Interval />}
        {active === 'search' && <SearchFunc />}
        {active === 'fullName' && <FullName />}
        {active === 'filterShop' && <FilterShop />}
        {active === 'bigFilter' && <BigFilter />}
        {active === 'namePrice' && <NamePrice />}
      </div>
    </div>
  )
}
