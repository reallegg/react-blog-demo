export interface MockUploadResponse {
  url: string
}

export function mockUpload(
  file: File
): Promise<MockUploadResponse> {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 1500 + 500

    console.log(`[start] ${file.name}`)

    setTimeout(() => {
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
  })
}