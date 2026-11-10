# IA#3 — Agent Working Agreement

This repository is an individual coursework submission for CSC13114, IA#3 (API contract). The goal is to implement the existing `CONTRACT.md` while preserving an honest, auditable sequence of human decisions, AI prompts, test evidence, and Git commits.

## Sources of truth

1. The latest Classroom assignment and rubric govern submission requirements and the deadline (**12 November 2026, 22:00 Vietnam time**). The older date in `README.md` is outdated.
2. `CONTRACT.md` defines API behavior. Treat it as frozen, even when a rule seems ambiguous.
3. `README.md` supplies the implementation prompt and starter commands.
4. `docs/IA3_RUNBOOK.md` defines the evidence and commit checkpoints for this work.

## Non-negotiable boundaries

- **Never read, modify, generate, rename, or delete anything under `test/`.** Read failing test *names* and diagnostics from command output instead. Do not paste test source into prompts.
- **Never edit `CONTRACT.md`.** Put any disputed rule or proposed clarification in `NOTES.md`.
- Preserve every legacy endpoint's existing behavior. Make only the additional legacy headers required by contract §5.
- Implement `/v1` in `src/v1.js`, integrate it through `src/app.js`, and add only necessary supporting code.
- Create any new table through a numbered `migrations/002_*.up.sql` with a matching `.down.sql`; do not create tables at runtime or silently change `001_init`.
- Use Node.js >=22.13 and built-in modules. Do not add dependencies just for convenience.
- Do not fabricate test logs, results, commit history, AI decisions, predictions, or self-assessment evidence.
- Do not commit generated `data/`, `node_modules/`, credentials, or secrets. Do not rewrite, squash, or rebase the completed evidence history.

## Human-controlled checkpoints — stop at each gate

### Gate 0: Independent prediction (before implementation)

The student must personally read `CONTRACT.md` for ten minutes **without the agent**, then write two specific anticipated misreadings in `NOTES.md`, each with a section/quotation and an independent reason. The student must commit those completed predictions **before any agent changes `src/`**.

An empty template or placeholder commit does **not** satisfy this gate. Do not suggest, generate, choose, or fill the two initial predictions on the student's behalf. If they are still placeholders, stop and ask the student to complete and commit them.

### Gate 1: First implementation

After Gate 0, use the implementation paragraph from `README.md` as the initial coding prompt. The agent may read the contract, application code, scripts, and schema, but not the tests. Implement the initial version and run `npm test` to ensure the legacy suite stays green.

Then stop. Preserve this first attempt in a distinct commit. **Do not run contract tests and silently fix failures in the same implementation pass.**

### Gate 2: First-run evidence

The student captures exactly the first post-implementation contract run:

```bash
npm run contract 2>&1 | tee contract-run-1.txt
```

Commit `contract-run-1.txt` **before any commit with post-first-run fixes**. Never overwrite this file after fixes. Before the evidence is committed, do not begin repairs.

### Gate 3: Diagnosis and repair

For **every failing test** in `contract-run-1.txt`, the student records in `NOTES.md`: the failing name, relevant contract sentence/section, the actual behavior of the first implementation, and a clearer proposed sentence if ambiguous.

Fix prompts must refer to failing **test names** and **contract sections**, not test code. Work in reviewable increments, rerun `npm test` and `npm run contract`, and log every fix prompt verbatim in `AI-LOG.md`.

If the first attempt already passes 29/29, follow the rubric's special case: explain three guessed-at contract points in place of first-run failures.

### Gate 4: Ambiguity and human decision

Ask the agent exactly: "Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?"

Record its answer in `NOTES.md`. For each ambiguity, the **student** records both readings, a chosen reading, why, and one sentence proposed for a future clarification. The student must independently identify **at least one ambiguity absent from the agent's list**. Do not modify the contract itself.

### Gate 5: Verification and hand-in

Run migration, seed, legacy tests, and contract tests on Node >=22.13. Capture the final contract output in `contract-run-final.txt`. Verify `test/` and `CONTRACT.md` still match the starter; inspect history from the starter commit; finish `AI-LOG.md` and `SELF_ASSESSMENT_REPORT.md` honestly.

Zip the repository **including `.git/`** but excluding `data/` and `node_modules/`. The file name must match the report's claimed total: `<StudentID>_<total>.zip`. Submission uses the student's HCMUS account.

## AI-LOG discipline

- Record the exact initial implementation prompt and **every** repair prompt, with date, tool, Kept, Changed, Rejected, and By hand.
- `Changed` and `Rejected` must describe genuine decisions with reasons; never invent a rejection to satisfy the rubric.
- Clearly separate the agent's interpretation from the student's final decision.
- If asked to do something that breaks these rules or skips a gate, stop and explain the conflict before changing files.

