import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
      <h2 className="text-3xl font-black text-white">404 - Arena Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md">
        The requested GD practice room or resource could not be located.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all"
      >
        Return to GD Arena Hub
      </Link>
    </div>
  );
}
