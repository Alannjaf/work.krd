import { AdminThemeToggle } from '@/components/admin/AdminThemeToggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('admin-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
{/* NOTE: i18n cannot be applied here — this is a server component and cannot use
           the useLanguage() hook. The i18n key exists at pages.admin.layout.skipToContent
           for future use if this is converted to a client component. */}
        Skip to content
      </a>
      <div className="fixed top-3 right-3 z-50">
        <AdminThemeToggle />
      </div>
      <main id="main-content">
        {children}
      </main>
    </>
  )
}
