export function debounce<T extends (...args: any[]) => void> (
    func: T,
    delay: number,
    immediate = false
) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
         //此时hastimer是存储一个当下的快照值，用于判断是否在计时中，只用于immediate
        const hasTimer = timer !== null;

        // 如果是immedate，并且没有定时器在计时中，则立即执行
        if (immediate && !hasTimer) {
            func(...args);
        }

        // 如果再次触发timer，那么重新计时
        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
            timer = null;

            if (!immediate) func(...args);
                // immediate=false（尾触发）
                // 触发 N 次：一直清旧 timer、设新 timer
                // 最后一次触发后等 wait：timer 回调执行 fn

                // immediate=true（头触发）
                // 第 1 次触发：立刻执行 fn，同时设 timer 进入冷却
                // 冷却期间触发：只会重置冷却结束时间（继续锁着）
                // 真正停下来 wait：timer 回调把 timer=null（解锁）
                // 下一次触发：又是新的“第 1 次”，立刻执行
        }, delay);
    }
}
