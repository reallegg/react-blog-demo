import { mockUpload } from './mockUpload'

export interface UploadTaskResult {
  success: boolean
  url?: string
  error?: unknown
  duration: number
}

export async function uploadTask(
  file: File
): Promise<UploadTaskResult> {
  const start = performance.now()

  try {
    const result = await mockUpload(file)

    return {
      success: true,
      url:result.url,
      duration: performance.now() - start,
    }
  } catch (error) {
    return {
      success: false,
      error,
      duration: performance.now() - start,
    }
  }
}