export interface MockUploadResponse {
  url: string
}

export interface MockUploadOptions {
  signal?: AbortSignal
}

export function mockUpload(
  file: File,
  options: MockUploadOptions = {}
): Promise<MockUploadResponse> {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 1500 + 500

    // 调用方可能在任务真正开始前已经取消，直接返回 AbortError。
    if (options.signal?.aborted) {
      console.log(`[aborted] ${file.name}`)
      reject(new DOMException(`${file.name} 上传已取消`, 'AbortError'))
      return
    }

    console.log(`[start] ${file.name}`)

    const timer = setTimeout(() => {
      // mock 请求已结束，移除取消监听，避免后续误触发和 listener 残留。
      options.signal?.removeEventListener('abort', abortUpload)
      const isFailed = Math.random() < 0.3

      if (isFailed) {
        console.log(`[failed] ${file.name}`)

        reject(new Error(`${file.name} 上传失败`))
        return
      }

      console.log(`[success] ${file.name}`)

      resolve({
        url: `https://example.com/uploads/${encodeURIComponent(file.name)}`,
      })
    }, delay)

    // 模拟 fetch/axios 的取消行为：取消时清理定时器，并用 AbortError 结束请求。
    const abortUpload = () => {
      clearTimeout(timer)
      console.log(`[aborted] ${file.name}`)
      reject(new DOMException(`${file.name} 上传已取消`, 'AbortError'))
    }

    options.signal?.addEventListener('abort', abortUpload, { once: true })
  })
}
