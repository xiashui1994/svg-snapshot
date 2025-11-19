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

export const insertCrossOrigin = (): void => {
  const links = document.querySelectorAll("link[rel=stylesheet]")
  for (const link of links) {
    const newLink = link.cloneNode() as HTMLLinkElement
    newLink.setAttribute("crossorigin", "anonymous")
    link.replaceWith(newLink)
  }
}
