export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}
