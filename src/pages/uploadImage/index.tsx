import { useRef, useState } from 'react'
import { uploadTask } from '../../services/uploadTask'
import { runWithConcurrency } from '../../utils/runWithConcurrency'
import type {
  UploadItem,
  UploadMetrics,
} from '../../types/upload.ts'

const CONCURRENCY_LIMIT = 3

export default function ImageUploader() {
  const [items, setItems] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const runningRef = useRef(false)
  const [totalDuration, setTotalDuration] = useState(0)
  const metrics: UploadMetrics = {
    total: items.length,

    successCount: items.filter((item) => item.status === 'success').length,
    failedCount: items.filter((item) => item.status === 'failed').length,

    firstAttemptFailedCount: items.filter((item) => item.firstAttemptFailed).length,
    retryCount: items.reduce((total, item) => total + item.retryCount, 0),

    totalDuration,
  }

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

  const handleUpload = async () => {
    // 用 ref 同步拦截重复点击，避免状态更新前启动多个批次。
    if (runningRef.current) return
    const batch = items.filter((item) => item.status === 'pending')
    if (batch.length === 0) return

    // 锁定本批次，并记录开始时间，用于计算整批耗时。
    runningRef.current = true
    setIsUploading(true)
    const start = performance.now()
    const updateItem = (id: string, patch: Partial<UploadItem>) => {
      setItems((current) => current.map((item) => (
        item.id === id ? { ...item, ...patch } : item
      )))
    }
    const uploadBatch = async (batchItems: UploadItem[], isRetry: boolean) => {
      const failedItems: UploadItem[] = []

      await runWithConcurrency(batchItems.map((item) => async () => {
        const attemptStart = performance.now()
        try {
          updateItem(item.id, {
            status: 'uploading',
            retryCount: isRetry ? item.retryCount + 1 : item.retryCount,
            url: undefined,
            error: undefined,
            duration: undefined,
          })

          const result = await uploadTask(item.file)
          const firstAttemptFailed = !isRetry && !result.success

          updateItem(item.id, {
            status: result.success ? 'success' : 'failed',
            url: result.url,
            error: result.error,
            duration: result.duration,
            firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
          })

          if (!result.success) {
            failedItems.push({
              ...item,
              status: 'failed',
              retryCount: isRetry ? item.retryCount + 1 : item.retryCount,
              firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
              url: result.url,
              error: result.error,
              duration: result.duration,
            })
          }
        } catch (error) {
          const firstAttemptFailed = !isRetry

          updateItem(item.id, {
            status: 'failed',
            error,
            duration: performance.now() - attemptStart,
            firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
          })

          failedItems.push({
            ...item,
            status: 'failed',
            retryCount: isRetry ? item.retryCount + 1 : item.retryCount,
            firstAttemptFailed: item.firstAttemptFailed || firstAttemptFailed,
            error,
            duration: performance.now() - attemptStart,
          })
        }
      }), CONCURRENCY_LIMIT)

      return failedItems
    }

    try {
      const firstAttemptFailedItems = await uploadBatch(batch, false)
      const retryItems = firstAttemptFailedItems.filter((item) => item.retryCount < 1)

      if (retryItems.length > 0) {
        await uploadBatch(retryItems, true)
      }
    } finally {
      // 批次结束后记录指标，并解除运行锁和界面的上传中状态。
      setTotalDuration(performance.now() - start)
      runningRef.current = false
      setIsUploading(false)
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

      <button
        disabled={isUploading || !items.some((item) => item.status === 'pending')}
        onClick={handleUpload}
        style={{
          marginTop: 20,
          padding: '8px 16px',
        }}
      >
        {isUploading ? '上传中…' : '开始上传'}
      </button>

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
