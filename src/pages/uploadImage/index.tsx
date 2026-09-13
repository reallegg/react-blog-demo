import { useState } from 'react'
import { uploadTask } from '../../services/uploadTask'
import type {
  UploadItem,
  UploadMetrics,
} from '../../types/upload.ts'

export default function ImageUploader() {
  const [items, setItems] = useState<UploadItem[]>([])
  const metrics: UploadMetrics = {
  total: items.length,

  successCount: 0,
  failedCount: 0,

  firstAttemptFailedCount: 0,
  retryCount: 0,
  retrySuccessCount: 0,

  totalDuration: 0,
  maxConcurrency: 0,
}

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? [])

    const newItems: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      retryCount: 0,
    }))

    setItems(newItems)
  }

  const handleUpload = async () => {
    if (items.length === 0) return

    const firstItem = items[0]

    try {
      const result = await uploadTask(firstItem.file)

      console.log('上传成功', result)
    } catch (error) {
      console.log('上传失败', error)
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
        disabled={items.length === 0}
        onClick={handleUpload}
        style={{
          marginTop: 20,
          padding: '8px 16px',
        }}
      >
        开始上传
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
          <div>重试次数：{metrics.retryCount}</div>
          <div>重试成功：{metrics.retrySuccessCount}</div>
          <div>
            总耗时：{metrics.totalDuration.toFixed(0)} ms
          </div>
          <div>最大并发数：{metrics.maxConcurrency}</div>
      </div>
    </div>
  )
}
