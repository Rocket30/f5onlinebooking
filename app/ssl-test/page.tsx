export default function SSLTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">SSL Test Page</h1>
      <p className="mb-4">If you can see this page, basic page loading is working.</p>

      <div className="p-4 bg-green-100 border border-green-300 rounded mb-4">
        <p className="font-semibold text-green-800">SSL Status: Working</p>
        <p className="text-sm text-green-700">This page loaded successfully over HTTPS.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Try clearing your browser cache and cookies</li>
          <li>Test on different mobile browsers (Chrome, Safari, Firefox)</li>
          <li>Try both cellular data and WiFi connections</li>
          <li>Check if the issue occurs on all pages or just specific ones</li>
        </ol>
      </div>
    </div>
  )
}
