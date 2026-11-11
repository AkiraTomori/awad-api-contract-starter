# IA#3 — Implementation and Evidence Runbook

**Course:** CSC13114 — Advanced Web Application Development  
**Assignment:** IA#3, individual, 100 points (2% of course)  
**Deadline:** Thursday, 12 November 2026, 22:00 (Vietnam time)  
**Status:** Gate 0 complete: predictions committed in `fc96aaa`, with independent reading and authorship confirmed by the student on 12 November 2026. Gate 1 complete: first implementation `4c49c10`; `npm test` PASS 3/3 on Node v26.6.0, captured in `docs/gate-1-legacy-test.txt`. Stopped before Gate 2. Contract runs, repairs, ambiguity decisions and final assessment remain pending.

> The deadline in `README.md` is synchronized with this runbook and `AGENTS.md`. The latest Classroom rubric remains authoritative.

## Score allocation

| Criterion | Max | Evidence needed |
|---|---:|---|
| Contract tests | 30 | Legacy 3/3, contract 29/29, consistent final log |
| Rules kept | 10 | No edits in `test/` or `CONTRACT.md`; paired migrations |
| Predictions before the agent | 10 | Two personal predictions + reasons, committed before `src/` changes; outcomes recorded |
| First run, explained line by line | 20 | Immutable `contract-run-1.txt`; one explanation per failure |
| Ambiguous contract wording | 20 | Agent's list, two readings, personal decision, clarifying wording, one independent find |
| AI-LOG | 10 | Exact initial and repair prompts; real Kept/Changed/Rejected decisions |

## Phase 0 — Baseline and student-only reading

```bash
node -v
npm run migrate
npm run seed
npm test
npm run contract
```

Expected starter state (verify locally, do not claim it ran until it does): legacy 3/3, contract 0/29.

**Human task:** Read the entire `CONTRACT.md` for ten minutes without AI help. Fill the two independent prediction fields in `NOTES.md` with the exact section/sentence and why the agent may get it wrong. Commit the completed predictions **before** implementation:

```bash
git add NOTES.md
git commit -m "docs: record independent pre-agent predictions"
```

The scaffold commit only contains placeholders. It is **not** the prediction commit.

## Phase 1 — Agent's initial implementation

Only after Phase 0 is committed, give the agent this README prompt (record it verbatim in `AI-LOG.md`):

> Implement the `/v1` API in `src/v1.js` exactly as `CONTRACT.md` specifies, and the headers its section 5 requires on the legacy API in `src/app.js`. Put any new table in a new migration with a `down`. Do not read or edit anything under `test/`, and do not edit `CONTRACT.md`. Run `npm test` when you are done; it must stay green.

Inspect the first implementation and commit it before contract-driven fixes:

```bash
git add src/ migrations/
git commit -m "feat: initial agent implementation of v1"
```

Do not let the agent pre-run the contract tests and fix failures before Phase 2's preserved first run.

## Phase 2 — Immutable first contract run

```bash
set -o pipefail
npm run contract 2>&1 | tee contract-run-1.txt
git add contract-run-1.txt
git commit -m "test: preserve first contract run before fixes"
```

The command may fail; that is expected evidence. Preserve all output. Do not overwrite the file or repair code before committing it. The first-run commit must precede all *subsequent fixes* to `src/`.

## Phase 3 — Failure analysis and fixes

1. Read every failed test *name* in `contract-run-1.txt`, not the test source.
2. Add one row per failure to `NOTES.md`: name, contract section/sentence, what the agent did differently, and clearer wording where relevant.
3. Prompt the agent with the failing **name and contract section**, never copied test code.
4. Record every repair prompt and real Kept/Changed/Rejected decision in `AI-LOG.md`.
5. Rerun `npm test` and `npm run contract` after each logical fix. Commit reviewable changes; leave `contract-run-1.txt` unchanged.

If the first implementation passed 29/29, record the three assumptions the agent made and analyze them as the rubric directs.

## Phase 4 — Contract ambiguity decisions

Ask the agent exactly:

> Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?

In `NOTES.md` preserve or summarize its answer. For every case add section, reading A, reading B, chosen reading, reason, and a proposed sentence. Add at least one ambiguity discovered independently by the student that is missing from the agent's response. Never edit `CONTRACT.md`.

## Phase 5 — Final verification and packaging

```bash
npm run migrate
npm run seed
npm test
set -o pipefail
npm run contract 2>&1 | tee contract-run-final.txt
git status
git log --oneline --reverse
```

Confirm: legacy 3/3, contract 29/29, all failures in the first run accounted for, and tests/spec unchanged **relative to the original starter commit** (checking only `git diff` against HEAD is insufficient).

Fill `SELF_ASSESSMENT_REPORT.md` with six scored rows and concrete file/commit evidence. Ensure the claimed total is the sum, and honestly document unfinished work. Commit all final evidence.

From the **parent directory** of this repository, with real values substituted:

```bash
STUDENT_ID=YOUR_STUDENT_ID
CLAIMED_SCORE=YOUR_VERIFIED_TOTAL
zip -r "${STUDENT_ID}_${CLAIMED_SCORE}.zip" awad-api-contract-starter \
  -x 'awad-api-contract-starter/data/*' \
     'awad-api-contract-starter/data/' \
     'awad-api-contract-starter/node_modules/*' \
     'awad-api-contract-starter/node_modules/'
unzip -l "${STUDENT_ID}_${CLAIMED_SCORE}.zip"
```

Check that the ZIP includes `.git/HEAD`, `.git/objects/`, all final files and no `data/` or `node_modules/`. **Do not use `git archive`: it omits `.git/`.** Submit from `<StudentID>@student.hcmus.edu.vn` on Classroom before the deadline.

## Evidence checkpoints / suggested Git order

1. Docs-only scaffold PR (this PR; placeholders, **not** predictions).
2. Student's independent prediction commit (`NOTES.md` filled).
3. First agent implementation commit (`src/`, migrations).
4. First-run `contract-run-1.txt` commit.
5. Fix commits with recorded prompts and failure analysis.
6. Final log, final notes, AI log and self-assessment commit.

Do not squash, rebase, or rebuild this history after completing the assignment. A PR is optional for submission; the final ZIP and its Git history are what the rubric evaluates.

