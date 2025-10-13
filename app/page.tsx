import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">YourToyotaPicks</h1>
        <p className="text-xl text-gray-600">
          Automated curation of high-quality used Toyota & Honda vehicles
        </p>
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
