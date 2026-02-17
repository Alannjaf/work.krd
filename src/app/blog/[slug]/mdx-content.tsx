import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'

interface MDXContentProps {
  source: string
}

export async function MDXContent({ source }: MDXContentProps) {
  const code = String(
    await compile(source, {
      outputFormat: 'function-body',
      remarkPlugins: [remarkGfm],
    })
  )

  const { default: Content } = await run(code, runtime as any)

  return <Content />
}
