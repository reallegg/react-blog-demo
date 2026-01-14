import React, { useCallback, useRef, useState } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

export default function PageContainerScroll() {
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<number[]>(() => Array.from({ length: 20 }, (_, i) => i + 1));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setItems((prev) => [...prev, ...Array.from({ length: 10 }, (_, i) => prev.length + i + 1)]);
      setHasMore((_) => items.length + 10 < 80);
    } finally {
      setIsLoading(false);
    }
  }, [items.length]);

  useInfiniteScroll({
    containerRef: boxRef,
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 120,
    wait: 800,
    immediate: true,
  });

  return (
    <div style={{ padding: 16 }}>
      <h2>容器滚动：上拉加载更多</h2>

      <div
        ref={boxRef}
        style={{
          height: 420,
          overflow: "auto",
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
        }}
      >
        {items.map((n) => (
          <div key={n} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
            Item #{n}
          </div>
        ))}
        <div style={{ padding: 12, textAlign: "center", color: "#666" }}>
          {isLoading ? "加载中..." : hasMore ? "继续上拉" : "没有更多了"}
        </div>
      </div>
    </div>
  );
}
