export const svgNamespace = "http://www.w3.org/2000/svg"

export class AbortError extends Error {
  public readonly name = "AbortError"
  constructor(message: string = "Aborted") {
    super(message)
  }
}

export const logErrors =
  <A extends any[]>(func: (...args: A) => Promise<void>) =>
  (...args: A): void => {
    func(...args).catch(console.error)
  }

export const once = <T extends any[]>(
  emitter: any,
  filter: (...args: T) => boolean = () => true
): Promise<T> =>
  new Promise((resolve) => {
    const listener = (...args: T): void => {
      if (!filter(...args)) {
        return
      }
      if (typeof emitter.removeListener === "function") {
        emitter.removeListener(listener)
      } else if (typeof emitter.removeEventListener === "function") {
        emitter.removeEventListener("mousedown", listener as any)
      }
      resolve(args)
    }
    if (typeof emitter.addListener === "function") {
      emitter.addListener(listener)
    } else if (typeof emitter.addEventListener === "function") {
      emitter.addEventListener("mousedown", listener as any)
    }
  })

class AssertionError extends Error {
  public readonly name = "AssertionError"
}

export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message)
  }
}

export async function fetchBase64(fetch: Response): Promise<string> {
  const arrayBuffer = await fetch.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, chunk)
  }
  return btoa(binary)
}

export function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}