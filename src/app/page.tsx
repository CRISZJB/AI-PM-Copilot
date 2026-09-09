import { SiteHeader } from "@/components/layout/SiteHeader";
import { LinkButton } from "@/components/ui/Button";
import { LoadSampleButton } from "@/components/home/LoadSampleButton";

const capabilities = [
  {
    step: "01",
    title: "理解问题",
    description:
      "在跳到功能清单之前，先澄清用户、痛点与核心场景。",
  },
  {
    step: "02",
    title: "定义 MVP",
    description:
      "排出必须验证、可以等待与暂不做的事项，控制范围。",
  },
  {
    step: "03",
    title: "产出可下载 PRD",
    description:
      "装配需求与决策，支持 PM 补充，并导出 Markdown PRD 草稿。",
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
              从产品想法，生成可编辑、可下载的 PRD。
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              面向产品经理的结构化工作流：想法 → 产品分析 → MVP 范围 → 需求 →
              PRD。不是聊天机器人。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <LinkButton href="/create" className="px-6 py-3 text-[15px]">
                开始你的项目
              </LinkButton>
              <LoadSampleButton className="px-6 py-3 text-[15px]" />
            </div>
            <p className="mt-4 max-w-lg text-xs leading-relaxed text-ink-faint">
              「查看示例工作流」会打开演示案例（AI
              学习规划助手），用于展示 Copilot
              如何走完流程——案例本身不是本产品。
            </p>
          </div>

          <div className="mt-20 max-w-3xl border-t border-border pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              产品工作流
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              产品想法 → 分析 → MVP → 需求 → 可编辑 / 可下载 PRD
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="mx-auto max-w-[1440px] px-8 py-20">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                专为 PM 产品决策而建
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                不是对话框。每一步都是结构化产出，并保留你审阅与确认的空间；最终落到一份可带走的
                PRD 草稿。
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
