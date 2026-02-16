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
{/* TODO: i18n — needs pages.admin.* namespace */}
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
