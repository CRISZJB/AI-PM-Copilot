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
            产品工作流
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/create" className="hover:text-ink transition-colors">
            新建项目
          </Link>
          <Link href="/workspace" className="hover:text-ink transition-colors">
            工作区
          </Link>
        </nav>
      </div>
    </header>
  );
}
