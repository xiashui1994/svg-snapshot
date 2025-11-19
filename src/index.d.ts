/// <reference types="chrome" />

declare module "svgo" {
  export function optimize(svg: string, options?: any): any
}
