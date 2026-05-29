import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
            PRIS
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">About</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
