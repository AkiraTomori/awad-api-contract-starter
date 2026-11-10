# AI-LOG.md — IA#3 API Contract

This is an honest, evolving record of AI assistance. The current entry covers **planning and docs-only scaffolding**, not a completed implementation. Log the exact coding prompt and **every** fix prompt when those actions actually occur. Do not invent Changed or Rejected decisions.

## 2026-11-10 — Assignment planning and documentation scaffold

**Tool:** ChatGPT (GPT-6) with GitHub integration.

**Asked for:** Reviewed the supplied IA#3 assignment/rubric, repository README and contract, and planned the work. Then asked: "PR tổng thể sườn để làm trong Repo bài tập này đi, kể cả AI LOG đợt đầu" and added: "Có file AGENTS.md để mà cho biết Workflow làm việc của Repository này luôn".

**Scope given to AI:** Create a docs-only PR containing the workflow instructions, a runbook, notes placeholders, a self-assessment template, and this log. Do not implement `/v1`, read tests, change the contract, invent predictions, or fabricate test evidence.

**Kept:** A scaffold for `AGENTS.md`, `docs/IA3_RUNBOOK.md`, `NOTES.md`, `SELF_ASSESSMENT_REPORT.md`, and `AI-LOG.md`; separate checkpoints for independent predictions, first implementation, first-run capture, repairs, and final audit.

**Changed:** None yet. No agent-authored implementation has been reviewed or modified at this preparation stage. Add an actual change and its reason when one occurs.

**Rejected:** None yet. No implementation proposal has been evaluated; record a genuine rejected suggestion/code change and why **if it occurs**. Do not claim a fictional rejection.

**By hand:** The student's required ten-minute unaided contract reading, selection of two predictions, and evidence-based judgments have **not** been performed or claimed by this PR. They are pending independent student work.

**Files affected:** Documentation only. `src/`, `test/`, `CONTRACT.md`, and migrations remain untouched by this PR.

## Future AI interaction entries — fill as work happens

For every later agent interaction, add a separate entry (or an explicitly ordered prompt record):

```text
## YYYY-MM-DD — <actual task>
Tool: <name and version, if known>
Exact prompt:
> <paste the exact text handed to the agent>
Kept: <actual code/decision retained, with file or commit>
Changed: <actual part revised and why>
Rejected: <actual part not kept and why, or honestly none>
By hand: <actual independent work>
Evidence: <commit SHA, command output, NOTES section>
```

**Minimum future events:** initial implementation prompt from README; every test-name-plus-contract-section fix prompt; the contract ambiguity question and the agent's answer; final human decisions. An AI-written summary is not a substitute for these prompt records.

