import { optimize } from 'svgo'

export async function minifySvg(svgString: string): Promise<string> {
	const result = optimize(svgString, {
		multipass: true,
		plugins: [
			{
				name: 'preset-default',
				params: {
					overrides: {
						removeViewBox: false,
						// Bug: removes <mask>
						// removeHiddenElems: false,
						// This currently throws an error
						// removeOffCanvasPaths: false,
						removeAttrs: {
							params: {
								attrs: ['data-.*', 'class']
							}
						},
						// Bug: when this is run it removes the xlink namespace, but reusePaths adds <use> elements with xlink:href
						// without making sure the namespace exists
						// removeUnusedNS: false,
					}
				}
			},
			'removeScriptElement',
			'reusePaths',
		]
	} as any)

	return result
}
