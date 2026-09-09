# AI PM Copilot — Project Handoff

**Purpose:** Primary context for the next Cursor chat. Read this file first before any further development.

**Last updated:** 2026-09-07 (PRD v2: assemble → merge → Workspace → Markdown export)  
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Zod 4 + openai SDK (DeepSeek-compatible)

**This handoff is a status transfer only.** Do not redesign the product, reopen frozen prompts, or change Schema / API / HITL / architecture without an explicit new request.

**Related docs (do not delete):**

| Doc | Role |
|-----|------|
| `product_spec.md` | Product spec (repo root) |
| `docs/ai_architecture.md` | AI workflow + contracts |
| `docs/prompt_design.md` | Prompt version history (Analysis / MVP / Requirements) |
| `docs/eval_v1.md` / `docs/regression_eval_v2.md` | Product Analysis evals |
| `docs/mvp_eval_v1.md` / `v2` / `v3` | MVP Prioritization evals |
| `docs/requirements_eval_v1.md` | Requirements Prompt v1 eval (keep) |
| `docs/requirements_eval_v2.md` | Requirements Prompt v2 eval — **FROZEN** |
| `docs/superpowers/plans/2026-09-07-prd-v2.md` | PRD v2 implementation plan |

---

# 1. Project Goal

**AI PM Copilot** is a structured AI product-workflow tool for PMs (also a portfolio demo).

It is **not** a generic chatbot.

**Principle: AI proposes. PM decides.**

Final PM-facing deliverable: an **editable, downloadable PRD** assembled from upstream decisions plus PM supplement — **not** a second product app.

---

# 2. Frozen Status (current)

| Stage | Prompt | Status |
|-------|--------|--------|
| Product Analysis | **v2** | **FROZEN** |
| MVP Prioritization | **v3** | **FROZEN** |
| Requirements Generation | **v2** | **FROZEN** |

Do **not** create Analysis v3 / MVP v4 / Requirements v3 without an explicit product decision.

PRD has **no Prompt** and **no LLM**.

---

# 3. Complete Live Workflow (implemented)

```
Create Project
    → Product Analysis (DeepSeek, Prompt v2 FROZEN)
    → Confirm Analysis
    → Explicit Generate MVP Scope
    → MVP Prioritization (DeepSeek, Prompt v3 FROZEN)
    → Review / Edit / Reprioritize / Confirm MVP
    → Explicit Generate Requirements
    → Requirements Generation (DeepSeek, Prompt v2 FROZEN)
    → PRD v2:
         assemblePrd(workspace)          ← read-only projection
         + PrdOverride (PM supplement)   ← independent sessionStorage
         → mergePrd → PRD Workspace UI
         → prdToMarkdown → download / copy
```

**Gates:**

- Confirm Analysis does **not** auto-run MVP  
- Confirm MVP does **not** auto-run Requirements  
- Requirements API requires `analysisStatus === "confirmed"` **and** `mvpScopeStatus === "confirmed"`  
- There is **no** Requirements Confirm HITL (by design for now)  
- PRD has **no LLM** — **do not** wire a PRD LLM  
- PRD edits (**PrdOverride**) must **not** write back Analysis / MVP / Requirements  

---

# 4. What Is Complete

| Area | Status |
|------|--------|
| Product Analysis | **Live DeepSeek** + Zod + Draft/Confirm HITL + provenance + `editedByUser` |
| MVP Prioritization | **Live DeepSeek** + Zod + Draft/Confirm HITL + `editedByUser` / `reprioritizedByUser` |
| Requirements | **Live DeepSeek** + Zod + explicit Generate / Regenerate (no Confirm status machine) |
| PRD v2 | **assemblePrd → mergePrd → Workspace → Markdown export** (no LLM) |
| PM Override | `successMetrics` / `validationPlan` / `openDecisions` / `pmNotes` in independent sessionStorage |
| Provenance display | Analysis badges in Analysis UI + PRD Analysis sections |
| Sample Workspace标识 | Sidebar + Overview + PRD when `mvpScopeSource === "mock"` |
| Demo copy hygiene | “Generated Requirements” (not “Confirmed Requirements”); upstream readiness hints |

**Evals (frozen layers):**

- Analysis Prompt v2 — frozen after regression  
- MVP Prompt v3 — `docs/mvp_eval_v3.md` — **3 / 3 PASS → FROZEN**  
- Requirements Prompt v2 — `docs/requirements_eval_v2.md` — **3 / 3 PASS → FROZEN**  

**PRD v2 tests:** `npx tsx scripts/test-prd-v2.ts`

---

# 5. Known Backlog (do not invent scope)

Recorded for the next chat. **Do not execute unless the user explicitly asks.**

1. **Analysis returns to Draft** after confirm does **not** automatically invalidate MVP / Requirements — **defer**  
2. **Do not** wire a **PRD LLM**  
3. **Do not** add **Requirements Confirm HITL** unless explicitly requested  
4. Optional later: section-level `sectionNotes`, PDF export, Override inside `ProjectWorkspace` (not required now)

---

# 6. Engineering Constraints

Unless the user **explicitly** requests a change:

| Do not change | Why |
|---------------|-----|
| Product Analysis Prompt v2 | FROZEN |
| MVP Prioritization Prompt v3 | FROZEN |
| Requirements Prompt v2 | FROZEN |
| Zod Schema / TypeScript AI contracts | Contract stability |
| Analysis / MVP / Requirements API contracts | Keep routes stable |
| HITL state machines | No new Requirements/PRD confirm machines without ask |
| Architecture (stages; PRD no LLM) | Stable demo narrative |
| Auto-call Requirements after Confirm MVP | Not allowed |
| PRD → independent LLM generator | Not allowed |
| PRD Override → write back upstream | Not allowed |

Also:

- Do not put API keys in code or docs  
- Do not delete eval history files  
- Prefer small, scoped changes; confirm impact on frozen validation logic before editing AI behavior  

---

# 7. Code Map (quick)

## Pages / routes

| Path | Role |
|------|------|
| `/` | Landing |
| `/create` | Create Project → live Analysis |
| `/workspace` | Analysis / MVP / Requirements / PRD Workspace |
| `POST /api/ai/product-analysis` | Live Product Analysis |
| `POST /api/ai/mvp-scope` | Live MVP (requires confirmed analysis) |
| `POST /api/ai/requirements` | Live Requirements (requires confirmed analysis + confirmed MVP) |

## Key files

| Stage | Files |
|-------|--------|
| Analysis | `src/lib/ai/run-product-analysis.ts`, `src/lib/ai/prompts/product-analysis.ts`, `src/app/api/ai/product-analysis/route.ts` |
| MVP | `src/lib/ai/run-mvp-prioritization.ts`, `src/lib/ai/prompts/mvp-prioritization.ts`, `src/app/api/ai/mvp-scope/route.ts` |
| Requirements | `src/lib/ai/run-requirements.ts`, `src/lib/ai/prompts/requirements.ts`, `src/app/api/ai/requirements/route.ts` |
| PRD | `src/ai/prd/assemblePrd.ts`, `mergePrd.ts`, `toMarkdown.ts`, `override-types.ts`, `empty-override.ts` |
| PRD UI / store | `src/components/workspace/PRDSection.tsx`, `prd/PrdOverrideForm.tsx`, `prd/PrdToolbar.tsx`, `src/lib/prd-override-store.ts` |
| Store / gates | `src/lib/project-store.ts` (`markPrdSynced`), `src/lib/analysis-gate.ts` |
| Mock sample only | `src/ai/pipeline/mock/*`, `src/data/mock-project.ts` |

## Workspace fields

- `analysisStatus`: `draft` \| `confirmed`  
- `mvpScopeStatus`: `none` \| `draft` \| `confirmed`  
- `mvpScopeSource`: `none` \| `mock` \| `live`  
- `requirements`: `Requirement[]` (empty on live create until Generate)  
- `prdSync`: sync meta only — **PRD body is not stored in workspace**  
- `WORKSPACE_SCHEMA_VERSION = 4`  

**PM Override** (separate): sessionStorage key `ai-pm-copilot-prd-override-v1`, isolated by normalized `projectName`.

Live Create path: MVP starts `none`, Requirements start `[]` — do not mix mock features into live MVP.

## Env (names only)

```
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
DEEPSEEK_BASE_URL
```

---

# 8. Rules for the Next Cursor Chat

1. **First action:** read `docs/project_handoff.md` (this file).  
2. Inherit **Analysis v2 FROZEN**, **MVP v3 FROZEN**, **Requirements v2 FROZEN**.  
3. Do **not** redesign the product or regenerate frozen prompts.  
4. Do **not** change Schema / API / HITL / architecture without explicit ask.  
5. Prefer **small, scoped** changes.  
6. Explicitly **out of scope** unless asked: PRD LLM; Requirements Confirm HITL; Analysis→downstream invalidation; Override write-back to upstream.  

---

# 9. Quick “Do Not Touch” Checklist

- [ ] Product Analysis Prompt v2  
- [ ] MVP Prioritization Prompt v3  
- [ ] Requirements Prompt v2  
- [ ] Schema / Zod contracts  
- [ ] API route contracts  
- [ ] HITL status machines  
- [ ] Eval history files  
- [ ] Auto Requirements after Confirm MVP  
- [ ] PRD → LLM rewrite  
- [ ] PRD Override → mutate Analysis / MVP / Requirements  

---

End of handoff. Next chat: start from this file.
