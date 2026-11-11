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

## 2026-11-12 — Read-only analysis of the committed first contract run

**Tool:** Codex (model version not independently verified).

**Exact user prompt:**

```text
Gate 2 first-run evidence has been captured and committed in contract-run-1.txt.\
\
Read the first-run output and analyze every failed contract test against the relevant sections of CONTRACT.md.\
\
For each failure, identify:\
1\. The exact test name.\
2\. The relevant contract section and required behavior.\
3\. What the first implementation did differently.\
4\. Whether the contract wording is ambiguous.\
\
Do not read or modify test/ or CONTRACT.md.\
Do not modify src/ or migrations/ yet.\
Do not overwrite or rerun contract-run-1.txt.\
\
Report the analysis and stop before implementation fixes.
```

**Actions and evidence:** Verified first-run evidence commit `486588a3be8f22d4f91594628e63ef189a6d7a55`, read the preserved output, and compared the contract and first implementation. The log reports 29 tests passed and zero failed. Read-only comparisons showed that the log matched its evidence commit, source/migrations matched `4c49c10`, and the contract matched the starter. Reported that there were no failing test names or observed failure differences to analyze. Identified three actual assumptions: whole-JSON comparison includes unknown fields, no separate Content-Type rejection, and cursor/filter mismatch returns validation.

**Kept:** Preserved first-run evidence and first implementation; no repair request was inferred from the passing run.

**Changed:** None in that analysis turn; no repository edits or tests were performed. The three assumptions were reported in the conversation.

**Rejected:** None. No student rejection is claimed.

**By hand:** The student states that the first contract run was captured and committed. Git confirms the evidence commit and its contents; unaided activities are not independently observable by the agent.

## 2026-11-12 — Criterion 4 special case and actual agent ambiguity answer

**Tool:** Codex (model version not independently verified).

**Exact user prompt:**

```text
The preserved first contract run passed 29/29 tests with zero failures.\
\
Proceed with the rubric's special case for criterion 4. Document the three implementation assumptions already identified, referencing the relevant sections of CONTRACT.md and the actual implementation decisions.\
\
Then answer exactly: "Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?"\
\
Record your interpretations separately from the student's final decisions. Leave the student's independent ambiguity and final interpretation decisions for the student to complete.\
\
Update AI-LOG.md with the actual prompts and actions. Do not invent Changed or Rejected decisions.\
\
Do not edit src/, migrations/, test/, CONTRACT.md, or contract-run-1.txt. Do not rerun tests. Stop after the documentation update.
```

**Exact rubric question answered:**

> Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?

**Actions:** Updated `NOTES.md` Section 4 with the actual first-run evidence and the three previously identified assumptions, each tied to contract sections, actual source decisions and evidence limits. Recorded the agent's current answer in Section 5.2 with seven cases: unknown fields in equality, Content-Type, cursor/filter mismatch, repeated query parameters, non-object line error pointers, unsupported methods and key-length character units. Preserved the fourteen earlier candidates as historical material in Section 5.1. Created an explicitly unfilled student decision worksheet in Section 5.3 and left the independent ambiguity in Section 6 pending. Updated only current checkpoint/evidence references in README, the runbook and the report; no score claims or final verification claims were filled.

**Kept:** The same first implementation and immutable 29/29 first-run evidence; original prediction text and reasons; historical worksheet candidates with their original provisional status. The three assumptions are agent-authored analysis, not student approvals.

**Changed:** Documentation status previously said that the first-run log and actual agent answer were unavailable. Replaced those stale fields with committed evidence and the answer now provided. Replaced unused failure-record placeholders with an explicit zero-failure finding and the rubric's three-assumption analysis. The actual answer distinguishes code behavior from historical proposals: the handler counts code points but does not explicitly trim the key, and ignores Content-Type even beyond parameterized JSON media types. These are documentation corrections based on source, not code changes or student reinterpretations.

**Rejected:** None. No proposal was rejected by the student, and no rejection was invented for the rubric.

**By hand:** No final student interpretation, personal justification, clarification sentence or independently discovered ambiguity has been supplied in this documentation turn. Those remain for the student to complete.

**Validation and limits:** Inspected documentation diffs and whitespace only; no tests, migrations or API experiments were run. No test source was inspected. No edits were made to `src/`, migrations, `CONTRACT.md` or `contract-run-1.txt`. The pass count comes solely from preserved evidence commit `486588a`; source-confirmed edge cases are not presented as individually tested. No repair prompts or fix commits exist for this run. Stopped after documentation; Gate 4 human decisions and Gate 5 verification remain pending.

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

