import { mockUpload } from './mockUpload'
import type { UploadFailureReason } from '../types/upload'

export interface UploadTaskOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export interface UploadTaskResult {
  success: boolean
  url?: string
  error?: unknown
  duration: number
  failureReason?: UploadFailureReason
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function uploadTask(
  file: File,
  options: UploadTaskOptions = {}
): Promise<UploadTaskResult> {
  const start = performance.now()
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let didTimeout = false

  // 用内部 controller 统一承接外部取消和内部超时，底层上传只需要接收一个 signal。
  const abortFromSignal = () => {
    controller.abort(options.signal?.reason)
  }

  // 外部 signal 可能传入前已经取消，也可能在上传过程中取消，两种都要覆盖。
  if (options.signal?.aborted) {
    abortFromSignal()
  } else {
    options.signal?.addEventListener('abort', abortFromSignal, { once: true })
  }

  // 超时也通过 abort 结束底层请求，避免某个任务一直占住 worker。
  if (options.timeoutMs && options.timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      didTimeout = true
      controller.abort(new DOMException(`${file.name} 上传超时`, 'AbortError'))
    }, options.timeoutMs)
  }

  try {
    const result = await mockUpload(file, { signal: controller.signal })

    return {
      success: true,
      url: result.url,
      duration: performance.now() - start,
    }
  } catch (error) {
    return {
      success: false,
      error,
      duration: performance.now() - start,
      // AbortError 可能来自用户取消，也可能来自超时；didTimeout 优先判断。
      failureReason: didTimeout
        ? 'timeout'
        : isAbortError(error)
          ? 'canceled'
          : 'request-failed',
    }
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 请求结束后解除外部 signal 监听，避免重复触发和引用残留。
    options.signal?.removeEventListener('abort', abortFromSignal)
  }
}
