export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'failed'

export interface UploadItem {
  id: string
  file: File
  status: UploadStatus

  retryCount: number

  duration?: number
  url?: string
  error?: unknown
}

export interface UploadMetrics {
  total: number
  successCount: number
  failedCount: number

  firstAttemptFailedCount: number
  retryCount: number
  retrySuccessCount: number

  totalDuration: number
  maxConcurrency: number
}