export function debounce<T extends (...args: any[]) => void> (
    func: T,
    delay: number,
    immediate = false
) {
    // 联合声明
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {

        // 如果timer是null，并且immediate为true，代表是第一次触发，立即执行函数
        if (!timer && immediate) {
            func(...args);
        }

        // 如果timer存在，那么需要清除旧的定时器
        if (timer) {
            clearTimeout(timer);
        } 

        // 清除后，重新设置定时器
        timer = setTimeout(() => {
            timer = null;
            // 头触发：如果immediate为false，那么需要等待delay后执行函数
            // 尾触发：如果immediate为true，则不在这里执行函数，因为已经在上面执行了
            if (!immediate) {
                func(...args);
            }
        }, delay);
    }
  }

export function throttle<T extends (...args: any[]) => void> (
    func: T,
    delay: number,
    immediate = false
) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    //一段时间内只执行一次


    return (...args: Parameters<T>) => {
        // 第一次触发立即执行，之后每隔delay秒执行一次
        if (!timer && immediate) {
            func(...args);
        }
        
        // 如果旧timer存在，那么需要等待旧定时器执行完毕后，才能执行新的定时器
        if (timer) {
            return;
        }

        timer = setTimeout(() => {
            timer = null;
            if (!immediate) {
                func(...args);
            }
        }, delay);
    }
}
