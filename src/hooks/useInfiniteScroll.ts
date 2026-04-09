import { RefObject, useEffect, useMemo, useRef } from "react";
import { debounce } from "../utils";

type InfiniteScrollOptions = {
    /** 传 ref 则监听该容器滚动；不传则监听 window 滚动 */
    containerRef?: RefObject<HTMLElement | null>;
    /** 距离底部多少 px 触发 */
    threshold?: number;
    /** 防抖/冷却时间 */
    wait?: number;
    /** 防抖是否立即执行 */
    immediate?: boolean;

    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => Promise<void> | void;
};

function getScrollMetrics(container?: HTMLElement | null) {
    // 容器滚动
    if (container) {
        return {
            //元素内容从顶部边缘滚动的像素
            scrollTop: container.scrollTop,
            //元素内容的高度，包括超出视口的部分
            scrollHeight: container.scrollHeight,
            //元素视口高度
            clientHeight: container.clientHeight,
        }
    }
    // 整页滚动
    const doc = document.documentElement;
    const body = document.body;

    const scrollTop = doc.scrollTop || body.scrollTop;
    const scrollHeight = doc.scrollHeight || body.scrollHeight;
    // 不使用：doc.clientHeight，是因为它是由html/body在滚动时才会动态改变，不如window.innerHeight准确
    // 老写法：const clientHeight = doc.clientHeight || window.innerHeight;
    const clientHeight = window.innerHeight; 

    return {
        scrollTop,
        scrollHeight,
        clientHeight,
    }
}

export function useInfiniteScroll({
    containerRef,
    threshold = 120,
    wait = 800,
    immediate = true,
    hasMore,
    isLoading,
    onLoadMore,
}: InfiniteScrollOptions) {
    // 使用 ref 存储状态, 避免闭包拿旧值到值重复请求/不请求
    // ref 可以指向任何值，包括 DOM 元素、组件实例、甚至是函数
    // state 每次更新都会重新渲染组件， ref 不会重新渲染组件
    // ref 不会在组件重新渲染时被重置，所以可以用来存储一些不需要重新渲染的值

    // 使用 ref 存储一个会变的东西
    const stateRef = useRef({ hasMore, isLoading, onLoadMore });
    stateRef.current = { hasMore, isLoading, onLoadMore};

    // 闭包过期本质：旧函数还在用，还在使用旧render创建出来的函数
    const debouncedLoadMore = useMemo(() => {
        return debounce(async () => {
            const { hasMore, isLoading, onLoadMore } = stateRef.current;
            if (!hasMore || isLoading) return;
            await onLoadMore?.();
        }, wait, immediate);
    }, [wait, immediate]);

    useEffect(() => {
        const containerEl = containerRef?.current ?? null;

        const check = () => {
            const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics(containerEl);
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
            if (isNearBottom) {

            }
        };

        if (containerEl) {
            containerEl.addEventListener('scroll', check, { passive: true});
        } else {
            window.addEventListener('scroll', check, { passive: true});
        }

        check();

        return () => {
            if (containerEl) {
                containerEl.removeEventListener('scroll', check);
            } else {
                window.removeEventListener('scroll', check);
            }
        };
    }, [containerRef, debouncedLoadMore, threshold]);

}   