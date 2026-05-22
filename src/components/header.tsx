import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

export function Header() {
  return (
    <header className="rule-b">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-baseline justify-between gap-6">
        <Link href="/" className="group">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Surge Monitor
          </div>
          <div className="font-serif text-2xl md:text-3xl leading-none mt-1">
            Monitor de surtos de doenças em África
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline underline-offset-4">
            Live feed
          </Link>
          <Link href="/about" className="hover:underline underline-offset-4">
            About
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
