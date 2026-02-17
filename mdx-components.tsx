import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-8">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-6">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold mb-3 mt-5">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-primary-600 hover:text-primary-700 underline"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-500 pl-4 italic my-4 text-gray-700">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    ...components,
  }
}
