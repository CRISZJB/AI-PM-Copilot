import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur">
      <div
        className={`mx-auto flex max-w-[1440px] items-center justify-between px-8 ${
          compact ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            AI PM Copilot
          </span>
          <span className="hidden text-xs text-ink-faint sm:inline">
            Product workflow
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/create" className="hover:text-ink transition-colors">
            New Project
          </Link>
          <Link href="/workspace" className="hover:text-ink transition-colors">
            Workspace
          </Link>
        </nav>
      </div>
    </header>
  );
}
