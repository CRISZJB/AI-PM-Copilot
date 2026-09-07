import { SiteHeader } from "@/components/layout/SiteHeader";
import { LinkButton } from "@/components/ui/Button";

const capabilities = [
  {
    step: "01",
    title: "Understand the Problem",
    description:
      "Analyze users, pain points, and core usage scenarios before jumping to features.",
  },
  {
    step: "02",
    title: "Define the MVP",
    description:
      "Break down core capabilities and prioritize what must ship, what can wait, and what should stay out.",
  },
  {
    step: "03",
    title: "Generate Requirements",
    description:
      "Produce user stories, Given/When/Then acceptance criteria, and a structured PRD draft.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-[1440px] px-8 pb-20 pt-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-tight text-ink">
              AI PM Copilot
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Turn product ideas into structured product plans.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              From vague idea to user insight, MVP scope and PRD.
            </p>
            <div className="mt-10">
              <LinkButton href="/create" className="px-6 py-3 text-[15px]">
                Start a Project
              </LinkButton>
            </div>
          </div>

          <div className="mt-20 max-w-3xl border-t border-border pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Product workflow
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Product Analysis → MVP Scope → Requirements → PRD Draft
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="mx-auto max-w-[1440px] px-8 py-20">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                Built for AI product workflow
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Not a chat box. A guided path from structured input to product
                decisions and requirements.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {capabilities.map((item) => (
                <article key={item.step} className="max-w-sm">
                  <p className="font-mono text-xs text-ink-faint">{item.step}</p>
                  <h3 className="mt-3 text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
