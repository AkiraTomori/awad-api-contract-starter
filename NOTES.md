# IA#3 — My Contract Review Notes

**Course:** CSC13114 — Advanced Web Application Development (23KTPM1)

**Assignment:** IA#3 — API Contract

**Student:** Thái Minh Huy — 23127379

**Date:** 11 November 2026

**Status:** Working notes — implementation and test evidence not yet verified

> **Evidence note:** The predictions and interpretations are provisional. Independent reading, implementation results, and test outcomes must be supported by actual records before submission.

## 1. Predictions to check before implementation

**Independent reading:** Required ten-minute review not yet recorded.

**Prediction commit SHA:** Not yet provided; qualifying pre-implementation evidence remains pending.

**Evidence status:** These are proposed predictions, not confirmed implementation failures.

### Prediction 1 — Idempotency checks may happen in the wrong order

- **CONTRACT.md section and exact sentence:** §4.2: “The server checks, **in this order**, and stops at the first step that fails:” Step 3 checks whether “The key has been used before” before step 4 validates order fields.
- **What I expect the agent to get wrong:** I think the agent may validate `tableId`, `items`, or current menu-item information before checking an existing `Idempotency-Key`. For a repeated key, this could return a new validation error or calculate a different response instead of replaying the original stored `201` response. If the same key is used with a different valid JSON value, it could also return `400 validation` instead of the required `422 idempotency-key-reused`.
- **Why I expect this mistake:** In many APIs, checking request fields before database operations is a natural implementation pattern. However, this contract explicitly defines a different order. I think an agent could implement all the individual checks correctly but put them in the wrong sequence, especially if validation is handled by shared middleware.
- **Outcome (complete after implementation):** PENDING — compare the first implementation and first contract-run output with §4.2. Record the exact failed test, observed status/response, and commit if this happens; otherwise mark it not confirmed.

### Prediction 2 — Cursor pagination may not stay stable after new orders

- **CONTRACT.md section and exact sentence:** §4.4: “**Pages do not move under the client.** While a client walks the pages, orders placed after it fetched the first page do not appear on later pages, and no order appears twice or is skipped.”
- **What I expect the agent to get wrong:** I think the agent may implement pagination with `OFFSET` or a cursor that only stores the current page position. When new orders are created between the first and second page requests, the result could repeat an earlier order, skip an older order, or let a newly created order enter the ongoing pagination sequence.
- **Why I expect this mistake:** Offset pagination is simple and usually works during testing with a fixed set of rows. This API lists orders newest first, so inserting a new order changes the position of existing rows. The contract needs the original pagination walk to remain stable. I think the agent might overlook that requirement unless it keeps enough information about the first page's boundary and the current position.
- **Outcome (complete after implementation):** PENDING — inspect actual pagination-under-insert and cursor test results. Do not claim the prediction was correct until the first-run evidence shows the implementation's behavior.

## 2. Review scope and evidence status

The assignment separates three questions: **what the contract requires**, **what the agent predicted or implemented**, and **what the tests demonstrated**. Passing tests is evidence of tested behavior, not proof that every ambiguous sentence has a unique interpretation.

| Evidence | Current status in this reference | What is required for a submission |
|---|---|---|
| Contract and rubric review | Draft review notes available; independent reading not recorded | Student's own contract reading |
| Two pre-agent predictions | Two provisional predictions in Section 1, expanded in Section 3; independent selection and commit not yet evidenced | Two independently selected, reasoned and pre-committed student predictions |
| First implementation commit | Not verified | Actual Git SHA, before the first contract run |
| `contract-run-1.txt` | Not available in the inspected repository state | Preserve the **first** post-implementation run and commit it before fixes |
| First-run failures | Unknown | One evidence-based entry **for every failed test** |
| Implementing agent's ambiguity response | Not yet observed | Ask the exact rubric question and preserve the actual answer |
| Student-only ambiguity | Not supplied | One genuinely student-discovered point absent from the implementing agent's list |
| `contract-run-final.txt` | Not available | Actual final run, consistent with grading results |

The unchanged legacy API, frozen specification, migration rules, and evidence order remain mandatory. Do **not** change `test/` or `CONTRACT.md` to make a test pass.

## 3. Two implementation risks to evaluate

### Prediction 1 — Idempotency validation precedence (`CONTRACT.md` §4.2)

- **Contract reference:** §4.2, the numbered request-processing steps, particularly step 3 (previously used key) **before** step 4 (field validation), together with the idempotency replay rules.
- **Potential mistake to check:** An implementation agent may validate every body field, query current menu-item prices, or reject unknown items **before** checking whether an already-used key has a stored successful response.
- **Why I consider this a risk:** Many conventional request handlers parse and validate the body before checking application state. Here, the specification explicitly puts the used-key check ahead of field validation and menu-item existence. It is easy to write individually reasonable middleware in the wrong order. The contract also distinguishes syntactically valid JSON from a semantically valid order.
- **Expected observable mistake:** A valid-JSON retry with an existing key is revalidated or recalculated instead of returning the original stored `201` body and `Location`. Another possible mistake is allowing an invalid new body to bypass the required `422 idempotency-key-reused` when the same key was already used with different JSON content.
- **Required behavior:** First check the key's presence/length, then JSON syntax, then an existing-key record. A successful identical replay returns **the original** `201` response plus `Idempotent-Replayed: true`, without placing another order. A different JSON body with the same stored key returns `422 idempotency-key-reused`. New keys continue through validation, menu-item lookup, and creation.
- **How to check later:** Inspect actual first-run test names/output involving duplicate keys, replay, body differences, and error precedence. Check the first implementation's observed behavior without reading or editing `test/`.
- **Outcome:** **NOT YET VERIFIED.** No first-run result is available. Record `confirmed` or `not confirmed`, the exact test name, and the implementation commit after execution.

### Prediction 2 — Stable cursor pagination (`CONTRACT.md` §4.4)

- **Contract reference:** §4.4, the statement that pages must not move under the client, plus newest-first ordering and the `nextCursor` rules.
- **Potential mistake to check:** An implementation agent may use an offset (`OFFSET`, page number, or equivalent) or encode only the last item ID without retaining a stable first-page boundary. This can cause newly inserted orders to move later pages, creating duplicates or skipped results.
- **Why I consider this a risk:** Offset pagination is the simplest common pattern, and a basic keyset cursor can look correct in a static database. The contract imposes a stronger requirement: the logical pagination walk must remain stable if new orders are placed after the first page. Cursor handling must also respect the `tableId` filter and the 24-hour validity rule.
- **Expected observable mistake:** An order created between page requests appears in a later page, or an earlier order is repeated or skipped because the dataset shifted. Another likely mistake is returning a non-null cursor for an empty final page.
- **Required behavior:** Return orders in descending ID order. A cursor must carry enough information to enforce the original walk's upper boundary and position, and it must work with the original filter. `nextCursor` is `null` exactly when no later page has entries; it must never lead to an empty page.
- **How to check later:** Use actual contract-run output related to pagination under inserts, cursor validity, filtering, and the last page. Record observed first-implementation behavior rather than assuming this prediction came true.
- **Outcome:** **NOT YET VERIFIED.** No first-run result is available. Record `confirmed` or `not confirmed`, with evidence, after execution.

**My qualifying independent-prediction commit:** NOT PROVIDED.

**Post-run summary:** Prediction 1 — pending; Prediction 2 — pending.

## 4. First-run analysis — required evidence, not hypothetical failures

**First implementation commit:** NOT PROVIDED

**First-run evidence commit:** NOT PROVIDED

**Observed result:** UNKNOWN / 29 contract tests

**Command required:** `npm run contract 2>&1 | tee contract-run-1.txt`

At the time this reference was prepared, the first post-implementation run was not available. **It would be inaccurate to invent failed test names, pass counts, response bodies, repair commits, or outcomes.** Once `contract-run-1.txt` exists, make exactly one entry per failed test, including multiple tests about the same contract rule.

### 4.1 Failure record — repeat for every actual failure

| Required field | Evidence to enter |
|---|---|
| **Exact failing test name** | `[COPY FROM THE REAL FIRST-RUN OUTPUT]` |
| **Relevant contract section and rule** | `[SECTION + SHORT QUOTATION OR PRECISE PARAPHRASE]` |
| **Required behavior** | `[SPECIFIC STATUS / BODY / HEADER / SIDE EFFECT]` |
| **Observed first-implementation behavior** | `[ACTUAL VS EXPECTED FROM THE OUTPUT AND IMPLEMENTATION]` |
| **Why they differed** | `[ROOT CAUSE OR SUPPORTED EXPLANATION]` |
| **Two possible readings, if any** | `[A AND B; OTHERWISE “NOT AMBIGUOUS”]` |
| **Clearer sentence proposed for the contract** | `[ONE TESTABLE SENTENCE; OR “NOT NEEDED”]` |
| **Repair prompt / commit** | `[EXACT PROMPT IN AI-LOG + REAL SHA]` |
| **Outcome after fix** | `[OBSERVED PASS/FAIL; ACTUAL FINAL LOG]` |

### 4.2 Contract coverage checklist for classifying actual failures

The following are **analysis prompts**, not a claim that any of these tests failed:

| Area | Contract section | What to inspect in the first-run evidence |
|---|---|---|
| JSON and money | §1 | Dong integers, UTC timestamps, unknown request fields ignored |
| Problem details | §2 | Exact status/type/title; safe one-sentence detail; correct `errors` entry shape and multiplicity |
| Menu retrieval | §4.1 | `200` menu item; `404 not-found` on missing/invalid resource ID |
| Order validation | §4.2 | Key-before-JSON-before-replay precedence; all invalid fields reported; whole-body pointer `""` |
| Unknown items | §4.2 | `422 unknown-menu-item`, one pointer per unknown line |
| Successful orders | §§3, 4.2 | `201`, `Location`, item order, price snapshot, correct integer total |
| Idempotency | §4.2 | Same-body replay, changed-body rejection, in-flight response, transactional persistence, 4xx not stored |
| Order retrieval | §4.3 | `200` for existing order, `404` for missing or invalid ID |
| Order listing | §4.4 | Descending IDs, valid filters, strict bounds, stable cursor, no cursor to empty page |
| API separation | §5 | `/v1` problem details vs. unchanged legacy JSON error structure |
| Legacy lifecycle | §5 | `Deprecation` and `Sunset` even on legacy errors; successor `Link` for successful `GET /menu/{id}` |

### 4.3 If the first agent implementation passes 29/29

Write the **actual** observed `29/29` result and explain three real assumptions the implementation agent made. Possible topics to ask about (not assumed agent answers):

1. How was JSON-value equality implemented for idempotency, including nested objects and unknown fields?
2. What information does the pagination cursor store to prevent page movement under new inserts?
3. How are non-`201` outcomes excluded from the persistent idempotency record?

For each, cite the relevant contract rule, the agent's actual choice, why another choice was plausible, and whether evidence supports that choice.

## 5. Wording that could be interpreted two ways — my review worksheet

**Question from the rubric to ask the implementing agent later, exactly:**

> Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?

**Review status:** The cases below are **provisional interpretations**, **not** a quotation or summary of the implementing agent's later answer. They are proposals for discussion. The student should record the implementing agent's real answer separately, make their own decisions, and then compare them against these candidates.

### A1 — Unknown fields versus idempotency fingerprint (§§1, 4.2)

- **Reading A:** Unknown request fields are ignored both when placing an order and when deciding whether two keyed requests have the same body.
- **Reading B:** Unknown fields do not influence order creation, but they still count as part of the JSON body when checking for a different request under the same key.
- **Working interpretation to evaluate:** **B**. Section 4.2 defines body equivalence by JSON-value equality and says differences other than object-key order and whitespace matter.
- **Why:** Ignoring an extra field for business processing is separate from treating two raw client requests as equivalent. A server should not silently redefine the stated fingerprint rule.
- **Sentence to add to a future contract revision:** “Idempotency body comparison includes every parsed JSON field, including fields otherwise ignored by order creation; only object-member order and insignificant JSON whitespace are ignored.”

### A2 — Missing or non-JSON Content-Type (§4.2)

- **Reading A:** The stated `Content-Type: application/json` header is required; missing, different, or parameterized values must be rejected.
- **Reading B:** The server may accept a parseable JSON body with a compatible media type such as `application/json; charset=utf-8`; the numbered validation sequence does not specify a separate Content-Type rejection step.
- **Working interpretation to evaluate:** **B**, provisionally, because the explicit ordered failure algorithm has no Content-Type step, while the contract clearly requires JSON syntax. This is a **specification gap**, not a proven test expectation.
- **Why:** The contract should state a status and problem type if it intends to reject a syntactically valid JSON body based only on its media type.
- **Sentence to add:** “A POST request may use `application/json` with an optional UTF-8 charset parameter; if a JSON body is supplied without that media type, the server [explicitly define accept/reject and the error type].”
- **Decision needing specification-owner confirmation:** The bracketed behavior cannot be resolved definitively from the current text.

### A3 — Retry with an old key and an invalid body (§4.2)

- **Reading A:** Validate all order fields before determining whether a used key has a replay or conflict.
- **Reading B:** For syntactically valid JSON, check the used key and body equality before field validation.
- **Working interpretation to evaluate:** **B**. The numbered sequence is explicit: key, JSON syntax, prior key, field validation, menu-item existence, creation.
- **Why:** An identical replay must return the stored result, and a reused key with a changed JSON value must fail even if new fields would also be invalid.
- **Sentence to add:** “After successful JSON parsing, check any existing idempotency record before validating body fields or checking menu-item existence; an identical completed request is replayed without revalidation.”

### A4 — Order-line duplicates (§§3, 4.2)

- **Reading A:** Multiple lines referring to the same menu item should be merged into a single line with the summed quantity.
- **Reading B:** Multiple lines remain separate and in the original order because the contract has no uniqueness constraint.
- **Working interpretation to evaluate:** **B**.
- **Why:** The resource section explicitly preserves client line order and calculates totals over all lines; merging would silently change the response shape.
- **Sentence to add:** “Repeated `menuItemId` values are permitted in different order lines and must not be consolidated or reordered.”

### A5 — Validation error enumeration (§§2, 4.2)

- **Reading A:** Return one error for the first invalid field, or one summary error for each category.
- **Reading B:** Collect a separate entry for each invalid field that can be identified from the parsed input, using precise JSON Pointers.
- **Working interpretation to evaluate:** **B**.
- **Why:** The contract requires an entry for every problem found, not just the first. If a container such as `items` is not an array, it is not meaningful to invent errors for nonexistent child paths.
- **Sentence to add:** “Report one `errors` entry for each independently invalid field that can be evaluated; when a parent field has the wrong type, report that parent rather than hypothetical missing descendants.”

### A6 — Missing/invalid path ID and unknown method (§§2, 4.1, 4.3)

- **Reading A:** An invalid path ID produces `400 validation`; an unsupported method on an otherwise known `/v1` path produces `405`.
- **Reading B:** A missing or non-positive-integer resource ID produces `404 not-found`, and a `/v1` route not specified by the contract also uses the specified `404` problem response.
- **Working interpretation to evaluate:** **B** for invalid IDs, because §2 is explicit. For unknown methods, **B is provisional** because method-not-allowed behavior is not separately defined.
- **Why:** The contract directly equates invalid resource IDs with not found, but does not fully describe route-method mismatches.
- **Sentence to add:** “An invalid `{id}` always returns a `404 not-found` problem; unsupported methods on `/v1` endpoints return [explicitly choose `404` or `405` and define the body].”

### A7 — Cursor value and filter binding (§4.4)

- **Reading A:** A syntactically readable cursor can be reused with any `tableId`; the server applies the new filter.
- **Reading B:** The cursor is tied to the original filter; using it with a different `tableId` is invalid.
- **Working interpretation to evaluate:** **B**, with `400 validation` and `parameter: cursor` for a mismatch.
- **Why:** The text directs clients to use a cursor with the same `tableId`. Reusing a position from a different filtered list can skip rows or violate stable traversal.
- **Sentence to add:** “A cursor is bound to the `tableId` filter used when it was issued; a different filter or an unreadable cursor returns `400 validation` with `parameter: cursor`.”

### A8 — Cursor snapshot, insertion and last-page behavior (§4.4)

- **Reading A:** Any cursor that fetches older IDs is good enough; new orders may still affect the page boundary or be visible to later pages.
- **Reading B:** The page walk retains a fixed initial upper bound and an advancing position, so new orders do not appear and old orders are not duplicated or skipped.
- **Working interpretation to evaluate:** **B**.
- **Why:** The “pages do not move” rule and the `null`-if-and-only-if-no-more rule are stronger than a simple offset or naive next-page token.
- **Sentence to add:** “Each `nextCursor` must preserve the first page's maximum visible order ID, the last returned position, and the original filter; return `null` when no matching orders remain beyond that position.”

### A9 — Multiple occurrences of one query parameter (§4.4)

- **Reading A:** For `?limit=10&limit=20`, silently use the first value or the last value.
- **Reading B:** Reject repeated scalar pagination/filter parameters as ambiguous input.
- **Working interpretation to evaluate:** **B**, provisionally.
- **Why:** The specification describes one integer value for each parameter, but it does not say how duplicate query keys are handled. Silent selection can depend on framework behavior.
- **Sentence to add:** “Each of `tableId`, `limit`, and `cursor` may occur at most once; repeated occurrences return `400 validation` naming that parameter.”

### A10 — Header value length and whitespace (§4.2)

- **Reading A:** Measure the `Idempotency-Key` using UTF-8 bytes and treat surrounding whitespace as part of the key.
- **Reading B:** Measure character count and normalize HTTP header optional whitespace before testing length or emptiness.
- **Working interpretation to evaluate:** **B** as a usability-oriented interpretation, but the exact meaning of “characters” and whether blank-only keys are accepted needs clarification.
- **Why:** JavaScript UTF-16 units, Unicode code points and UTF-8 bytes can differ; HTTP libraries also normalize whitespace differently.
- **Sentence to add:** “Validate the key after removing HTTP optional whitespace surrounding its field value, count Unicode code points for the 1–255-character limit, and reject a resulting empty value.”

### A11 — Persistent replay across process restarts (§4.2)

- **Reading A:** Keeping completed keys in an in-memory map is enough for retries while one process remains alive.
- **Reading B:** Completed keys and the exact successful response must be stored durably with the order and remain usable for at least 24 hours, across restarts and multiple instances sharing the database.
- **Working interpretation to evaluate:** **B**.
- **Why:** The contract requires storing the key/fingerprint/response in the same transaction as the order. An in-memory-only cache is neither part of that transaction nor durable for 24 hours.
- **Sentence to add:** “A successfully completed key, its canonical request fingerprint, and its exact `201` response must be committed atomically with the order in durable shared storage and replayable for at least 24 hours across process restarts.”

### A12 — Legacy deprecation and successor headers (§5)

- **Reading A:** `Deprecation` and `Sunset` are attached only to successful legacy responses, and `Link` may be attached to all `/menu/{id}` responses.
- **Reading B:** Both lifecycle headers appear on **every** legacy response, including errors; the successor `Link` appears specifically on successful `GET /menu/{id}`.
- **Working interpretation to evaluate:** **B**.
- **Why:** Section 5 explicitly mentions errors for the first two headers and limits the successor header to a successful response from that endpoint.
- **Sentence to add:** “Attach `Deprecation` and `Sunset` to every response from a legacy route, regardless of status; attach the successor-version `Link` only to `200 GET /menu/{id}`.”

### A13 — `errors` field on problem responses (§2)

- **Reading A:** Include `errors: []` on every error response, regardless of problem type.
- **Reading B:** Include `errors` only for `validation` and `unknown-menu-item`, with one entry for every problem actually identified.
- **Working interpretation to evaluate:** **B**.
- **Why:** The member table restricts `errors` to those two problem types. Other failures use `type`, `title`, `status`, and occurrence-specific or generic `detail` as specified.
- **Sentence to add:** “Omit the `errors` member on all problem types except `validation` and `unknown-menu-item`; for those two types, include one entry per detected problem.”

### A14 — Historical unit prices versus current menu prices (§3)

- **Reading A:** The server derives `unitPriceVnd` and `totalVnd` from the current menu table every time an existing order is retrieved.
- **Reading B:** Save the unit price at creation and derive the order total from those stored order-line amounts, even if the legacy API later changes menu prices.
- **Working interpretation to evaluate:** **B**.
- **Why:** The contract explicitly freezes each line's unit price at the time of placing the order.
- **Sentence to add:** “Persist each order line's original `unitPriceVnd`; later menu price updates must not change an existing order's lines or `totalVnd`.”

## 6. Student-discovered ambiguity — separate evidence requirement

**Status:** NOT PROVIDED BY THE STUDENT.

The fourteen cases in Section 5 are working candidates. **None establishes a separate student-only discovery merely by being copied into this section.** After asking the implementing agent the specified question, the student should independently identify at least one **additional** point absent from that agent's response. Do not preselect or falsely attribute it.

Use this exact structure for the authentic entry:

- **Contract section and sentence:** `[STUDENT IDENTIFIES]`
- **Reading 1:** `[STUDENT'S FIRST PLAUSIBLE READING]`
- **Reading 2:** `[STUDENT'S SECOND PLAUSIBLE READING]`
- **Student's chosen reading:** `[STUDENT DECIDES]`
- **Why:** `[CONTRACT EVIDENCE / CLIENT BEHAVIOR / COMPATIBILITY REASON]`
- **Sentence to add in a future contract version:** `[ONE PRECISE SENTENCE]`
- **How I checked it was absent from the agent's list:** `[COMPARE AGAINST THE ACTUAL SAVED AGENT ANSWER]`

## 7. Preliminary conclusions and final-reflection framework

### 7.1 What I can conclude from reading the contract

1. **Order processing is sensitive to operation order.** Header validation, JSON parsing, used-key checks, field validation, menu-item existence, and creation are not interchangeable steps.
2. **Idempotency is a data-integrity requirement, not merely a convenience header.** Correct replay needs stable JSON equivalence, the original status/body/headers, no duplicate order, durable state, and atomic commit with order creation.
3. **Pagination is a consistency requirement.** A static sorted list or ordinary offset is insufficient if new orders can arrive between requests. `nextCursor` also has exact end-of-list behavior.
4. **Compatibility has two directions.** `/v1` must follow its own problem-details and dong-unit conventions, while legacy paths must retain their previous units and error format and add only required lifecycle headers.
5. **The specification itself has open questions.** Examples include Content-Type behavior, duplicate query keys, unknown-method responses, and Unicode character-count rules. Reasonable design choices should be documented, not silently presented as uniquely mandated by the contract.

### 7.2 What a green test suite would not automatically prove

- All possible error combinations follow the specified precedence.
- Every concurrency race returns the intended in-flight response rather than creating an extra order.
- Idempotency records and cursors retain their guarantees for 24 hours or across restarts.
- All unspecified media-type and repeated-parameter cases have a single agreed interpretation.
- Future optional fields preserve both additive API compatibility and exact replay semantics.

These are review risks, **not claims that the code fails them**.

### 7.3 Final outcome — to be written from observed evidence

- **Prediction 1:** NOT VERIFIED. `[CONFIRMED / NOT CONFIRMED; EXACT TEST NAME AND SHA]`
- **Prediction 2:** NOT VERIFIED. `[CONFIRMED / NOT CONFIRMED; EXACT TEST NAME AND SHA]`
- **First contract run:** NOT VERIFIED. `[X/29; REFERENCE TO contract-run-1.txt COMMIT]`
- **Final legacy test run:** NOT VERIFIED. `[X/3; NODE VERSION AND COMMAND]`
- **Final contract test run:** NOT VERIFIED. `[X/29; REFERENCE TO contract-run-final.txt]`
- **Implementing agent's actual ambiguity answer:** NOT PROVIDED. `[DATE, TOOL, EXACT ANSWER OR FAITHFUL SUMMARY]`
- **Student's independent ambiguity:** NOT PROVIDED. `[SECTION 6 EVIDENCE]`
- **Remaining uncertainty after fixes:** `[REAL OBSERVATIONS ONLY]`

## 8. Submission and evidence cross-check

Before treating this document as a submission artifact, ensure all boxes are supported by actual files and commits:

- [ ] Personally read `CONTRACT.md` for ten minutes without AI and independently select two predictions with reasons.
- [ ] Commit those genuine student predictions **before** an agent edits `src/` (the current provisional examples do not establish this evidence).
- [ ] Save the agent's first implementation in a distinct commit.
- [ ] Capture and commit the unmodified first `npm run contract 2>&1 | tee contract-run-1.txt` before repairs.
- [ ] Replace Section 4's evidence placeholders with a separate, evidence-based entry for every failed first-run test (or the three documented guesses if the first run passes 29/29).
- [ ] Use only failing test names and contract section references in repair prompts; record exact prompts in `AI-LOG.md`.
- [ ] Ask the implementing agent the exact ambiguity question, preserve its actual answer, and record the student's explicit decisions with improved sentences.
- [ ] Add at least one genuinely independent student ambiguity not listed by the implementing agent.
- [ ] Preserve `test/` and `CONTRACT.md`; create new tables only in paired `migrations/002_*.up.sql` and `.down.sql` files.
- [ ] Verify Node >= 22.13, migrations, seed, legacy tests, and contract tests; save `contract-run-final.txt`.
- [ ] Fill `SELF_ASSESSMENT_REPORT.md` with six evidence-backed scores and a truthful total.
- [ ] Package the repository **with `.git/`**, excluding `data/` and `node_modules/`; name it `<StudentID>_<total>.zip` with a total matching the report.
