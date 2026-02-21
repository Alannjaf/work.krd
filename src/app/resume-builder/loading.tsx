export default function ResumeBuilderLoading() {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header skeleton */}
      <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="w-px h-5 bg-gray-200" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse flex-1" />
        <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - form sections */}
        <div className="w-full md:w-[420px] border-r border-gray-200 overflow-y-auto p-4 space-y-4">
          {/* Section tabs skeleton */}
          <div className="flex gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>

          {/* Form fields skeleton */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Right side - preview */}
        <div className="hidden md:flex flex-1 bg-gray-100 items-start justify-center p-6">
          <div className="w-[794px] bg-white rounded shadow-sm" style={{ aspectRatio: '794/1123' }}>
            <div className="p-12 space-y-4 animate-pulse">
              <div className="h-8 w-64 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-100 rounded" />
              <div className="h-px w-full bg-gray-200 my-6" />
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${85 - i * 5}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
