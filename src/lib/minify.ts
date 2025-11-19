import { optimize } from "svgo"

export async function minifySvg(svgString: string): Promise<string> {
  const result = optimize(svgString, {
    multipass: true
  } as any)

  return result.data
}
