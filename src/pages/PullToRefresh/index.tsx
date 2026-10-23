import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { version } from '../../../package.json'
import { env } from '../../env'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import './index.css'

export default function PageContainerScroll() {
  const boxRef = useRef<HTMLDivElement | null>(null)

  const [items, setItems] = useState<number[]>(() =>
    Array.from({ length: 20 }, (_, i) => i + 1),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 700))
      setItems((previousItems) => [
        ...previousItems,
        ...Array.from(
          { length: 10 },
          (_, index) => previousItems.length + index + 1,
        ),
      ])
      setHasMore(items.length + 10 < 80)
    } finally {
      setIsLoading(false)
    }
  }, [items.length])

  useInfiniteScroll({
    containerRef: boxRef,
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 120,
    wait: 800,
    immediate: true,
  })

  return (
    <main className="release-home">
      <section className="release-hero">
        <div className="release-hero__eyebrow">
          <span className="release-pulse" aria-hidden="true" />
          Deployment online
        </div>
        <div className="release-hero__content">
          <div>
            <p className="release-kicker">React deployment lab</p>
            <h1>Build once. Ship with confidence.</h1>
            <p className="release-intro">
              这是用于验证 staging、production 和版本回滚流程的发布实验台。
            </p>
          </div>
          <div className="release-version" aria-label={`Release version ${version}`}>
            <span>Current release</span>
            <strong>v{version}</strong>
          </div>
        </div>

        <div className="release-meta">
          <div>
            <span>Environment</span>
            <strong className={`environment-badge environment-badge--${env.appEnvironment}`}>
              {env.appEnvironment}
            </strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>GitHub Actions → S3 → CloudFront</strong>
          </div>
          <div>
            <span>API endpoint</span>
            <strong>{env.apiBaseUrl}</strong>
          </div>
        </div>
      </section>

      <section className="release-grid" aria-label="Project navigation">
        <Link className="release-card" to="/practice">
          <span className="release-card__number">01</span>
          <div>
            <h2>React 练习</h2>
            <p>Hooks、状态派生与组件行为实验。</p>
          </div>
          <span className="release-card__arrow" aria-hidden="true">→</span>
        </Link>
        <Link className="release-card" to="/uploadimage">
          <span className="release-card__number">02</span>
          <div>
            <h2>并发上传</h2>
            <p>重试、失败恢复与任务状态管理。</p>
          </div>
          <span className="release-card__arrow" aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="scroll-lab">
        <div className="scroll-lab__header">
          <div>
            <p className="release-kicker">Live component</p>
            <h2>容器滚动 · 上拉加载更多</h2>
          </div>
          <span>{items.length} / 80 items</span>
        </div>

        <div ref={boxRef} className="scroll-list">
          {items.map((item) => (
            <div className="scroll-list__item" key={item}>
              <span>{String(item).padStart(2, '0')}</span>
              <p>Deployment test item</p>
              <small>ready</small>
            </div>
          ))}
          <div className="scroll-list__status">
            {isLoading ? '正在加载…' : hasMore ? '继续向下滚动' : '全部加载完成'}
          </div>
        </div>
      </section>
    </main>
  )
}
