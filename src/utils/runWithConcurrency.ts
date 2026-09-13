export type AsyncTask<T> = () => Promise<T>

export async function runWithConcurrency<T>(
  tasks: AsyncTask<T>[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError('并发上限必须是正整数')
  }

  const results: PromiseSettledResult<T>[] = new Array(tasks.length)

  let currentIndex = 0

  async function worker() {
    while (true) {
      const index = currentIndex++

      if (index >= tasks.length) {
        return
      }

      try {
        results[index] = { status: 'fulfilled', value: await tasks[index]() }
      } catch (reason) {
        results[index] = { status: 'rejected', reason }
      }
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
