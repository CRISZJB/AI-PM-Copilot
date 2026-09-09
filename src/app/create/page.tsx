import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProjectForm } from "@/components/create/ProjectForm";

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-8 py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
            创建项目
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            记录产品想法
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            填写结构化输入后，实时 AI 会生成产品分析。审阅并确认后，再进入 MVP、需求，最终得到可补充、可下载的
            PRD。
          </p>
          <p className="mt-3 rounded-md border border-dashed border-border bg-surface-muted/40 px-4 py-3 text-xs leading-relaxed text-ink-faint">
            表单已预填「AI 学习规划助手」仅作示例模板，方便你感受输入结构——可直接改成自己的产品想法。该案例不是本产品；主产品是
            AI PM Copilot。
          </p>

          <div className="mt-10 rounded-lg border border-border bg-white p-6 sm:p-8">
            <ProjectForm />
          </div>
        </div>
      </main>
    </div>
  );
}
