import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/features" className="text-sm text-zinc-500 hover:text-zinc-900">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-zinc-500 hover:text-zinc-900">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-zinc-500 hover:text-zinc-900">About</Link></li>
              <li><Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900">Privacy Notice</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 pt-8">
          <p className="text-xs text-zinc-400">© 2026 Project PRIS. RA 10173 Compliant.</p>
        </div>
      </div>
    </footer>
  );
}
