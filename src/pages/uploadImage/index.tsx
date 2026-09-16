import { useEffect, useRef, useState } from 'react'
import { uploadTask } from '../../services/uploadTask'
import { runWithConcurrency } from '../../utils/runWithConcurrency'
import type {
  UploadItem,
  UploadMetrics,
} from '../../types/upload.ts'

const CONCURRENCY_LIMIT = 3
const UPLOAD_TIMEOUT_MS = 10000

export default function ImageUploader() {
  const [items, setItems] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const runningRef = useRef(false)
  const mountedRef = useRef(true)
  const cancelRequestedRef = useRef(false)
  const offlineDuringUploadRef = useRef(false)
  const controllersRef = useRef(new Map<string, AbortController>())
  const [totalDuration, setTotalDuration] = useState(0)
  const metrics: UploadMetrics = {
    total: items.length,

    successCount: items.filter((item) => item.status === 'success').length,
    failedCount: items.filter((item) => item.status === 'failed').length,

    firstAttemptFailedCount: items.filter((item) => item.firstAttemptFailed).length,
    retryCount: items.reduce((total, item) => total + item.retryCount, 0),

    totalDuration,
  }

  useEffect(() => {
    const controllers = controllersRef.current

    return () => {
      // 页面离开时取消所有未完成请求，避免请求结束后继续更新已卸载组件。
      mountedRef.current = false
      cancelRequestedRef.current = true
      controllers.forEach((controller) => controller.abort())
      controllers.clear()
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)

      if (runningRef.current) {
        offlineDuringUploadRef.current = true
        cancelRequestedRef.current = true

        controllersRef.current.forEach((controller) => controller.abort())
        controllersRef.current.clear()

        setItems((current) => current.map((item) => (
          item.status === 'pending' || item.status === 'uploading'
            ? {
                ...item,
                status: 'failed',
                error: new Error('网络已断开'),
                failureReason: 'offline',
              }
            : item
        )))
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (runningRef.current) return
    const files = Array.from(event.target.files ?? [])

    const newItems: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      retryCount: 0,
      firstAttemptFailed: false,
    }))

    setItems(newItems)
    setTotalDuration(0)
  }

  const handleCancelUpload = () => {
    if (!runningRef.current) return

    // 用户主动取消后，正在上传的请求 abort，尚未开始的任务也统一标记为 canceled。
    cancelRequestedRef.current = true
    controllersRef.current.forEach((controller) => controller.abort())
    controllersRef.current.clear()
    setItems((current) => current.map((item) => (
      item.status === 'pending' || item.status === 'uploading'
        ? {
            ...item,
            status: 'canceled',
            error: undefined,
            failureReason: 'canceled',
          }
        : item
    )))
  }

  const handleUpload = async () => {
    // 用 ref 同步拦截重复点击，避免状态更新前启动多个批次。
    if (runningRef.current) return
    if (!isOnline) return
    const batch = items.filter((item) => item.status === 'pending')
    if (batch.length === 0) return

    // 锁定本批次，并记录开始时间，用于计算整批耗时。
    runningRef.current = true
    cancelRequestedRef.current = false
    offlineDuringUploadRef.current = false
    setIsUploading(true)
    const start = performance.now()
    const updateItem = (id: string, patch: Partial<UploadItem>) => {
      // 卸载后跳过状态更新，防止异步任务晚返回时触发无意义 setState。
      if (!mountedRef.current) return

      setItems((current) => current.map((item) => (
        item.id === id ? { ...item, ...patch } : item
      )))
    }
    const uploadBatch = async (batchItems: UploadItem[], isRetry: boolean) => {
      const failedItems: UploadItem[] = []

      await runWithConcurrency(batchItems.map((item) => async () => {
        const attemptStart = performance.now()
        // 取消可能发生在任务排队期间；worker 拿到任务时先判断，避免再发起请求。
        if (cancelRequestedRef.current) {
          const wasOffline = offlineDuringUploadRef.current

          updateItem(item.id, {
            status: wasOffline ? 'failed' : 'canceled',
            failureReason: wasOffline ? 'offline' : 'canceled',
            duration: 0,
          })
          return
        }

        // 每个任务独立持有 controller，方便按批次统一取消正在上传的请求。
        const controller = new AbortController()
        controllersRef.current.set(item.id, controller)

        try {
          updateItem(item.id, {
            status: 'uploading',
            retryCount: isRetry ? item.retryCount + 1 : item.retryCount,
            url: undefined,
            error: undefined,
            duration: undefined,
            failureReason: undefined,
          })

          const result = await uploadTask(item.file, {
            signal: controller.signal,
            timeoutMs: UPLOAD_TIMEOUT_MS,
          })
          const isCanceled = result.failureReason === 'canceled'
          const isOfflineFailure = isCanceled && offlineDuringUploadRef.current
          // 用户取消不算第一轮失败，也不进入后续自动重试。
          const firstAttemptFailed = !isRetry && !result.success && !isCanceled
          const nextStatus = result.success
            ? 'success'
            : isOfflineFailure
              ? 'failed'
              : isCanceled
              ? 'canceled'
              : 'failed'

          updateItem(item.id, {
            status: nextStatus,
            url: result.url,
            error: isOfflineFailure ? new Error('网络已断开') : result.error,
            duration: result.duration,
            failureReason: isOfflineFailure ? 'offline' : result.failureReason,
            firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
          })

          if (!result.success && !isCanceled) {
            failedItems.push({
              ...item,
              status: 'failed',
              retryCount: isRetry ? item.retryCount + 1 : item.retryCount,
              firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
              url: result.url,
              error: result.error,
              duration: result.duration,
              failureReason: result.failureReason,
            })
          }
        } catch (error) {
          const firstAttemptFailed = !isRetry

          updateItem(item.id, {
            status: 'failed',
            error,
            duration: performance.now() - attemptStart,
            failureReason: 'request-failed',
            firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
          })

          failedItems.push({
            ...item,
            status: 'failed',
            retryCount: isRetry ? item.retryCount + 1 : item.retryCount,
            firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
            error,
            duration: performance.now() - attemptStart,
            failureReason: 'request-failed',
          })
        } finally {
          controllersRef.current.delete(item.id)
        }
      }), CONCURRENCY_LIMIT)

      return failedItems
    }

    try {
      const firstAttemptFailedItems = await uploadBatch(batch, false)
      const retryItems = firstAttemptFailedItems.filter((item) => item.retryCount < 1)

      // 第一轮全部结束后才统一重试；用户取消或断网后跳过重试轮。
      if (
        !cancelRequestedRef.current &&
        !offlineDuringUploadRef.current &&
        retryItems.length > 0
      ) {
        await uploadBatch(retryItems, true)
      }
    } finally {
      // 批次结束后记录指标，并解除运行锁和界面的上传中状态。
      if (mountedRef.current) {
        setTotalDuration(performance.now() - start)
        setIsUploading(false)
      }

      controllersRef.current.clear()
      runningRef.current = false
    }
  }

  return (
    <div
      style={{
        width: 600,
        margin: '40px auto',
        padding: 24,
        border: '1px solid #ddd',
        borderRadius: 12,
      }}
    >
      <h2>批量图片上传</h2>

      {!isOnline && (
        <div style={{ marginBottom: 12, color: '#b00020' }}>
          网络已断开，当前无法上传
        </div>
      )}

      {isOnline && items.some((item) => item.failureReason === 'offline') && (
        <div style={{ marginBottom: 12, color: '#166534' }}>
          网络已恢复，可重新选择图片后上传
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        disabled={isUploading}
        onChange={handleFileChange}
      />

      <div style={{ marginTop: 24 }}>
        <h3>上传列表</h3>

        {items.length === 0 ? (
          <p>暂未选择图片</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <span>{item.file.name}</span>

              <span>{item.status}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button
          disabled={
            !isOnline ||
            isUploading ||
            !items.some((item) => item.status === 'pending')
          }
          onClick={handleUpload}
          style={{
            padding: '8px 16px',
          }}
        >
          {isUploading ? '上传中…' : '开始上传'}
        </button>

        <button
          disabled={!isUploading}
          onClick={handleCancelUpload}
          style={{
            padding: '8px 16px',
          }}
        >
          取消上传
        </button>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <h3>上传指标</h3>
          <div>总任务数：{metrics.total}</div>
          <div>成功：{metrics.successCount}</div>
          <div>失败：{metrics.failedCount}</div>
          <div>
            第一轮失败：{metrics.firstAttemptFailedCount}
          </div>
          <div>
            总耗时：{metrics.totalDuration.toFixed(0)} ms
          </div>
          <div>并发上限：{CONCURRENCY_LIMIT}</div>
      </div>
    </div>
  )
}
