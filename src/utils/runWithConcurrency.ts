export type AsyncTask<T> = () => Promise<T>

export async function runWithConcurrency<T>(
  tasks: AsyncTask<T>[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)

  let currentIndex = 0

  async function worker() {
    while (true) {
      const index = currentIndex++

      if (index >= tasks.length) {
        return
      }

      results[index] = await tasks[index]()
    }
  }

  const workerCount = Math.min(limit, tasks.length)

  const workers = Array.from(
    { length: workerCount },
    () => worker()
  )

  await Promise.all(workers)

  return results
}
