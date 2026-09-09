import type { ProjectWorkspace } from "@/types/project";
import { ContentCard } from "@/components/ui/ContentCard";

export function OverviewSection({ workspace }: { workspace: ProjectWorkspace }) {
  const { input } = workspace;
  const isSample = workspace.mvpScopeSource === "mock";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          概览
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {input.projectName}
        </h1>
        {isSample ? (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted/40 px-4 py-3">
            <p className="text-sm font-medium text-ink">
              示例案例（用于演示 AI PM Copilot）
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              「{input.projectName}」是 Sample Product
              Case，用来走通分析 → MVP → 需求 →
              PRD。主产品是 AI PM Copilot，不是学习规划 App。数据为离线示例，非「创建项目」实时运行结果。
            </p>
          </div>
        ) : null}
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          项目输入已记录。请按侧栏审阅产品分析并确认，再显式生成 MVP 与需求。最终在
          PRD 工作区补充成功标准等决策，并下载 Markdown PRD 草稿。
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          分析状态：{" "}
          <span className="font-medium text-ink">
            {workspace.analysisStatus === "confirmed" ? "已确认" : "草稿"}
          </span>
          {" · "}
          MVP：{" "}
          <span className="font-medium text-ink">
            {workspace.mvpScopeStatus === "none"
              ? "尚未生成"
              : workspace.mvpScopeStatus === "confirmed"
                ? "已确认"
                : "草稿"}
            {workspace.mvpScopeSource === "live"
              ? "（实时）"
              : workspace.mvpScopeSource === "mock"
                ? "（示例）"
                : ""}
          </span>
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard title="产品想法">{input.productIdea}</ContentCard>
        <ContentCard title="目标用户">{input.targetUser}</ContentCard>
        <ContentCard title="问题">{input.problem}</ContentCard>
        <ContentCard title="业务目标">{input.businessGoal}</ContentCard>
        <ContentCard title="约束条件" className="lg:col-span-2">
          {input.constraints}
        </ContentCard>
      </div>

      <section className="rounded-lg border border-dashed border-border bg-surface-muted/40 px-6 py-5">
        <h2 className="text-sm font-semibold text-ink">工作流进度</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {["产品分析", "MVP 范围", "需求", "可下载 PRD"].map((step, index) => (
            <li
              key={step}
              className="rounded-md border border-border bg-white px-4 py-3"
            >
              <p className="font-mono text-[11px] text-ink-faint">
                步骤 {index + 1}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
