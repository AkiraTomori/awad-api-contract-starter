# AI-LOG.md — IA#3 API Contract

This is an honest, evolving record of AI assistance. Entries distinguish historical planning, the student's confirmations, implementation and observed verification. Log the exact coding prompt and **every** fix prompt when those actions actually occur. Do not invent Changed or Rejected decisions.

## 2026-11-10 — Assignment planning and documentation scaffold

**Tool:** ChatGPT (GPT-6) with GitHub integration.

**Asked for:** Reviewed the supplied IA#3 assignment/rubric, repository README and contract, and planned the work. Then asked: "PR tổng thể sườn để làm trong Repo bài tập này đi, kể cả AI LOG đợt đầu" and added: "Có file AGENTS.md để mà cho biết Workflow làm việc của Repository này luôn".

**Scope given to AI:** Create a docs-only PR containing the workflow instructions, a runbook, notes placeholders, a self-assessment template, and this log. Do not implement `/v1`, read tests, change the contract, invent predictions, or fabricate test evidence.

**Kept:** A scaffold for `AGENTS.md`, `docs/IA3_RUNBOOK.md`, `NOTES.md`, `SELF_ASSESSMENT_REPORT.md`, and `AI-LOG.md`; separate checkpoints for independent predictions, first implementation, first-run capture, repairs, and final audit.

**Changed:** None yet. No agent-authored implementation has been reviewed or modified at this preparation stage. Add an actual change and its reason when one occurs.

**Rejected:** None yet. No implementation proposal has been evaluated; record a genuine rejected suggestion/code change and why **if it occurs**. Do not claim a fictional rejection.

**By hand:** The student's required ten-minute unaided contract reading, selection of two predictions, and evidence-based judgments have **not** been performed or claimed by this PR. They are pending independent student work.

**Files affected:** Documentation only. `src/`, `test/`, `CONTRACT.md`, and migrations remain untouched by this PR.

## 2026-11-12 — Gate 0 verification and Gate 1 authorization

**Tool:** Codex (model version not independently verified).

**Exact initial implementation prompt (also the README prompt):**

> Implement the `/v1` API in `src/v1.js` exactly as `CONTRACT.md` specifies, and the headers its section 5 requires on the legacy API in `src/app.js`. Put any new table in a new migration with a `down`. Do not read or edit anything under `test/`, and do not edit `CONTRACT.md`. Run `npm test` when you are done; it must stay green.

**Initial response:** The agent stopped without changes because the notes marked Gate 0 pending. No tests were run in that response.

**Exact follow-up authorization:**

> Gate 0 has been completed. I independently reviewed CONTRACT.md, finalized two predictions in NOTES.md, and committed them before any implementation changes. Please verify the commit history and proceed with Gate 1 according to AGENTS.md and the README implementation instructions. Do not read test/ or modify CONTRACT.md. Stop after the first implementation and npm test; do not run contract tests or begin fixes yet.
>
> Mình đã đọc rồi, tự ghi rồi, đồng nhất tài liệu cho mình luôn và thực hiện như yêu cầu

**Kept:** The student's two committed predictions; frozen contract; the requirement to stop before the first contract run.

**Changed:** Synchronized stale Gate 0 status in `NOTES.md` and the runbook with the student's confirmation and the actual prediction commit. Corrected the obsolete README deadline using `AGENTS.md` and the runbook. These are current documentation corrections, not retrospective claims about what the planning PR accomplished.

**Rejected:** None. No implementation proposal has yet been rejected by the student.

**By hand:** The student states that the independent contract reading and predictions were completed before implementation. The agent cannot independently verify unaided activity.

**Evidence:** Prediction commit `fc96aaa5fa00023e57f888819984ef80a516ad5a`, dated 12 November 2026 at 00:07:38 +07:00. Before implementation, `git log -- src/` showed only starter commit `6f7bf05`; the starter-to-HEAD diff for `src/` and migrations was empty. The existing `.gitignore` change belongs to the user and is excluded from agent commits. Gate 1 results will be recorded after execution.

## 2026-11-12 — Gate 1 first implementation and legacy verification

**Tool:** Codex; Node v26.6.0. Used the exact initial README prompt and follow-up authorization recorded above; no repair prompt was received or acted on.

**Kept (agent implementation; student review pending):** `/v1` menu retrieval, order creation/retrieval/listing and problem details in `src/v1.js`; transactional persistence of completed idempotency results; recursive JSON fingerprinting; preserved order-line prices and positions; durable opaque cursors bound to their original filter and first-page upper bound. The migration retains completed keys and cursors indefinitely. No dependencies added.

**Changed:** Replaced the versioned-handler stub and added only section 5 lifecycle/successor headers to legacy responses in `src/app.js`. Added `002_v1_state.up.sql` and matching `down` for the two supporting tables. Updated current checkpoint documentation and corrected stale report references; historical planning entries and the student's prediction text remain intact. No source fixes followed the legacy test run.

**Rejected:** None. No student rejection or review decision is claimed.

**By hand:** Student confirmed the pre-agent reading and prediction authorship. No student implementation edits, contract-failure diagnosis or final ambiguity decisions are claimed for this gate.

**Observed verification:** `node --version` returned `v26.6.0`. Executed exactly:

```bash
set -o pipefail
npm test 2>&1 | tee docs/gate-1-legacy-test.txt
```

Exit status 0; tests 3, pass 3, fail 0. Raw output is preserved in the linked repository file. Whitespace validation of the source changes also passed. The agent did not inspect any test source, modify the contract, run contract tests, perform separate migration up/down validation or start post-first-run fixes. Active-request tracking is connection-local; simultaneous in-flight behavior across independent processes is not verified by the legacy suite. No contract pass count is claimed.

**Evidence and checkpoint:** Documentation synchronization commit `5d614da`; distinct first implementation commit `4c49c10`, after prediction commit `fc96aaa`. Gate 1 is stopped. The next human-controlled action is Gate 2's first contract run and immutable evidence commit, before any repairs.

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

