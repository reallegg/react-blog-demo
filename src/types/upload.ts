export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'failed'
  | 'canceled'

// 失败原因用于区分普通失败、超时、用户取消和后续要接入的断网场景。
export type UploadFailureReason =
  | 'request-failed'
  | 'timeout'
  | 'canceled'
  | 'offline'

export interface UploadItem {
  id: string
  file: File
  status: UploadStatus

  retryCount: number
  firstAttemptFailed?: boolean

  duration?: number
  url?: string
  error?: unknown
  failureReason?: UploadFailureReason
}

export interface UploadMetrics {
  total: number
  successCount: number
  failedCount: number

  firstAttemptFailedCount: number
  retryCount: number

  totalDuration: number
}
