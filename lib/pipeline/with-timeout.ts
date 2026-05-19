/** Race a promise against a deadline; rejects with Error('timeout') on expiry. */
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}
