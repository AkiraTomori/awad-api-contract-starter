# IA#3 — My Contract Review Notes

**Course:** CSC13114 — Advanced Web Application Development (23KTPM1)

**Assignment:** IA#3 — API Contract

**Student:** Thái Minh Huy — 23127379

**Date:** 11 November 2026

**Status (updated 12 November 2026):** First implementation `4c49c10`; Gate 1 legacy tests PASS 3/3. Gate 2 evidence committed in `486588a`: first contract run PASS 29/29, zero failures. Criterion 4's three assumptions and the implementing agent's R1–R7 answer are preserved. Both prediction outcomes are assessed as **not confirmed** by the first-run evidence. Section 5.3 records seven interpretation decisions, and Section 6 discusses an additional ambiguity outside R1–R7. Gate 5 remains pending. No source edits, repairs or test reruns were performed in this documentation update.

> **Evidence note:** The student confirmed in this session that the required independent reading and the two predictions were completed before implementation. Git verifies the predictions in `fc96aaa5fa00023e57f888819984ef80a516ad5a`, before any agent source changes. The recorded first-run evidence supports the prediction outcomes described below; later verification remains pending.

## 1. Predictions to check before implementation

**Independent reading:** Student-confirmed complete on 12 November 2026 in the Gate 1 authorization message.

**Prediction commit SHA:** `fc96aaa5fa00023e57f888819984ef80a516ad5a` (12 November 2026, 00:07:38 +07:00). Both specific predictions below were already committed; `src/` and migrations still matched the starter at verification.

**Evidence status:** Predictions committed before implementation. Neither is a confirmed implementation failure.

### Prediction 1 — Idempotency checks may happen in the wrong order

- **CONTRACT.md section and exact sentence:** §4.2: “The server checks, **in this order**, and stops at the first step that fails:” Step 3 checks whether “The key has been used before” before step 4 validates order fields.
- **What I expect the agent to get wrong:** I think the agent may validate `tableId`, `items`, or current menu-item information before checking an existing `Idempotency-Key`. For a repeated key, this could return a new validation error or calculate a different response instead of replaying the original stored `201` response. If the same key is used with a different valid JSON value, it could also return `400 validation` instead of the required `422 idempotency-key-reused`.
- **Why I expect this mistake:** In many APIs, checking request fields before database operations is a natural implementation pattern. However, this contract explicitly defines a different order. I think an agent could implement all the individual checks correctly but put them in the wrong sequence, especially if validation is handled by shared middleware.
- **Outcome (assessed 12 November 2026): NOT CONFIRMED.** The preserved first run (`486588a`, `contract-run-1.txt`) passes “§4.2 the key is checked before the body”, “§4.2 a retry with the same key and body replays the first response”, and “§4.2 the same key with a different body is 422 and creates nothing”. No failing test or unexpected response was recorded. Source `4c49c10` checks a stored key before field validation (`src/v1.js`, `placeOrder`). The original prediction was a plausible risk, but this evidence does not show the mistake; it also does not prove every possible conflict of validation and replay was tested.

### Prediction 2 — Cursor pagination may not stay stable after new orders

- **CONTRACT.md section and exact sentence:** §4.4: “**Pages do not move under the client.** While a client walks the pages, orders placed after it fetched the first page do not appear on later pages, and no order appears twice or is skipped.”
- **What I expect the agent to get wrong:** I think the agent may implement pagination with `OFFSET` or a cursor that only stores the current page position. When new orders are created between the first and second page requests, the result could repeat an earlier order, skip an older order, or let a newly created order enter the ongoing pagination sequence.
- **Why I expect this mistake:** Offset pagination is simple and usually works during testing with a fixed set of rows. This API lists orders newest first, so inserting a new order changes the position of existing rows. The contract needs the original pagination walk to remain stable. I think the agent might overlook that requirement unless it keeps enough information about the first page's boundary and the current position.
- **Outcome (assessed 12 November 2026): NOT CONFIRMED.** The first-run log (`486588a`) passes “§4.4 an order placed between two pages does not shift the next page”, “§4.4 newest first; every order exactly once; default page size 20”, and “§4.4 nextCursor is null exactly when there is nothing more”. The implementation at `4c49c10` queries orders using `upper_id` and `last_id`, not `OFFSET` (`src/v1.js`, `listOrders`). No duplicate/skip/new-order leak was observed in the preserved run; durability for every 24-hour scenario is not established by that log.

## 2. Review scope and evidence status

The assignment separates three questions: **what the contract requires**, **what the agent predicted or implemented**, and **what the tests demonstrated**. Passing tests is evidence of tested behavior, not proof that every ambiguous sentence has a unique interpretation.

| Evidence | Current status in this reference | What is required for a submission |
|---|---|---|
| Contract and rubric review | Independent reading confirmed by student | Contract reading |
| Two pre-implementation predictions | Section 1 predictions committed in `fc96aaa`; outcomes NOT CONFIRMED on first-run evidence | Evidence and final assessments in Sections 1, 3 and 7.3 |
| First implementation commit | `4c49c10`; legacy tests PASS 3/3, log in `docs/gate-1-legacy-test.txt` | Preserved before the first contract run |
| `contract-run-1.txt` | Preserved in `486588a3be8f22d4f91594628e63ef189a6d7a55`; unchanged on inspection | Keep the first-run evidence immutable |
| First-run failures | Zero; 29 tests passed, none failed | Three actual implementation assumptions documented in Section 4.3 instead |
| Implementing agent's ambiguity response | Recorded on 12 November 2026 in Section 5.2 in response to the exact question | Student final decisions remain pending in Section 5.3 |
| Distinct ambiguity outside R1–R7 | Section 6 presents an additional case and clarification | Independence of discovery must be confirmed separately if required |
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
- **Agent evidence update:** First-run commit `486588a` reports no failures, including the key-before-body and replay tests. In first implementation `4c49c10`, the stored-key check precedes field validation (`src/v1.js`, lines 123–128). The predicted mistake is not demonstrated by this run; the student's final assessment is pending. The output does not establish coverage of every combination of invalid fields and used keys.

### Prediction 2 — Stable cursor pagination (`CONTRACT.md` §4.4)

- **Contract reference:** §4.4, the statement that pages must not move under the client, plus newest-first ordering and the `nextCursor` rules.
- **Potential mistake to check:** An implementation agent may use an offset (`OFFSET`, page number, or equivalent) or encode only the last item ID without retaining a stable first-page boundary. This can cause newly inserted orders to move later pages, creating duplicates or skipped results.
- **Why I consider this a risk:** Offset pagination is the simplest common pattern, and a basic keyset cursor can look correct in a static database. The contract imposes a stronger requirement: the logical pagination walk must remain stable if new orders are placed after the first page. Cursor handling must also respect the `tableId` filter and the 24-hour validity rule.
- **Expected observable mistake:** An order created between page requests appears in a later page, or an earlier order is repeated or skipped because the dataset shifted. Another likely mistake is returning a non-null cursor for an empty final page.
- **Required behavior:** Return orders in descending ID order. A cursor must carry enough information to enforce the original walk's upper boundary and position, and it must work with the original filter. `nextCursor` is `null` exactly when no later page has entries; it must never lead to an empty page.
- **How to check later:** Use actual contract-run output related to pagination under inserts, cursor validity, filtering, and the last page. Record observed first-implementation behavior rather than assuming this prediction came true.
- **Agent evidence update:** First-run commit `486588a` passes “§4.4 an order placed between two pages does not shift the next page” and “§4.4 newest first; every order exactly once; default page size 20”. First implementation `4c49c10` uses stored upper/last ID boundaries (`src/v1.js`, lines 205–214). The predicted mistake is not demonstrated by this run; the student's final assessment is pending.

**Pre-implementation prediction commit:** `fc96aaa5fa00023e57f888819984ef80a516ad5a`; see Section 1.

**Post-run prediction assessment:** Prediction 1 **NOT CONFIRMED**; Prediction 2 **NOT CONFIRMED**. Both verdicts compare the original pre-implementation predictions against the first implementation `4c49c10` and immutable first-run log `486588a`, with no invented failure or extra test claim.

## 4. First-run analysis — required evidence, not hypothetical failures

**First implementation commit:** `4c49c10` — `feat: initial agent implementation of v1`. During Gate 1 the agent ran only `npm test`: PASS 3/3 on Node v26.6.0; output preserved in `docs/gate-1-legacy-test.txt`. The student's later Gate 2 contract run is recorded below; no source fixes followed. Migration up/down execution was not separately verified during Gate 1.

**First-run evidence commit:** `486588a3be8f22d4f91594628e63ef189a6d7a55` — `test: preserve first contract run before fixes`, 12 November 2026, 00:23:00 +07:00; follows first implementation commit `4c49c10`.

**Observed result:** 29 tests, 7 suites, 29 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo; duration 402.747625 ms. This is the preserved run's result, not a rerun or a final verification claim. The log itself does not record the Node version used for that run.

**Capture command specified for Gate 2:** `npm run contract 2>&1 | tee contract-run-1.txt` (not executed again during analysis or this documentation update).

The earlier scaffold predated the first run. The actual preserved output is now available in [contract-run-1.txt](contract-run-1.txt). Read-only comparison verified that it matches its evidence commit and that `src/` and migrations still match `4c49c10`. There are no failing tests to diagnose. Criterion 4 therefore uses Section 4.3's three actual implementation assumptions, rather than invented failure records.

### 4.1 Failure analysis — not applicable to this first run

| Required field | Actual evidence |
|---|---|
| **Exact failing test name** | None; zero failures |
| **Relevant failure-specific contract section / required behavior** | Not applicable; no failure diagnostic exists |
| **Observed difference / root cause** | None demonstrated by the preserved run |
| **Failure-specific ambiguity / clarification** | Not applicable; actual interpretation choices are documented separately below |
| **Repair prompt / commit / post-fix outcome** | None; no repairs or post-fix run |

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

### 4.3 Criterion 4 special case — three actual implementation assumptions

**Implementation review, 12 November 2026.** The preserved first run passed **29/29**, so the three choices below replace failure-by-failure analysis. They are the three assumptions identified in the preceding read-only agent response. They describe the code in `4c49c10`; they are not student decisions, failed tests or proof that the suite covers each edge case.

#### S1 — Unknown request fields participate in idempotency equality

- **Contract reference:** §1, “The server ignores request fields it does not know”; §4.2, “Two bodies are the same when they are equal as JSON values”, with only key order and whitespace excluded from differences.
- **Actual choice:** Ignore extra fields when constructing the order, but include all parsed fields in the fingerprint. `canonical` sorts object keys recursively and preserves arrays; `placeOrder` hashes that canonical value before order validation. A changed unknown field under a completed key returns `422 idempotency-key-reused`.
- **Implementation evidence:** [src/v1.js](src/v1.js), `canonical` (lines 28–34), fingerprinting (line 123), conflict response (lines 93–100), order construction (lines 140–160).
- **Why another reading was plausible:** “Ignores” could be read as removing unknown fields before every processing step, including fingerprinting. The agent chose the more specific whole-JSON equality rule in §4.2.
- **Evidence limit:** The first-run test `§4.2 "the same body" means the same JSON value: key order and whitespace do not matter` passed, as did changed-body rejection. The log does not reveal whether unknown-field changes or arbitrary nested values were exercised. This edge-case choice is source-confirmed, not individually proven by the test summary.

#### S2 — Parse JSON without a separate Content-Type rejection

- **Contract reference:** §4.2 lists `Content-Type: application/json` among request headers, but its numbered algorithm checks key, JSON syntax, previous key, fields, menu items and creation without a separate media-type check.
- **Actual choice:** With a valid key, attempt `JSON.parse` on the body regardless of Content-Type. Missing or different Content-Type alone does not reject otherwise valid JSON; malformed JSON returns `400 invalid-json` after the key check.
- **Implementation evidence:** [src/v1.js](src/v1.js), `placeOrder` (lines 103–128); there is no Content-Type inspection in that path or its dispatch in `src/app.js`.
- **Why another reading was plausible:** The stated header could be mandatory, but the contract does not assign a rejection status/type or a position for that rejection in its ordered checks. The agent avoided inventing another failure step.
- **Evidence limit:** The malformed-JSON and key-before-body tests passed. No test name in the preserved output establishes acceptance or rejection of missing/different Content-Type. This behavior is source-confirmed only.

#### S3 — A cursor with a different table filter is a validation error

- **Contract reference:** §4.4 says “Use a cursor with the same `tableId` it came from”, and specifies `400 validation` with `parameter: cursor` when a cursor cannot be read.
- **Actual choice:** Store the original `table_id` with each random opaque cursor. If its stored filter differs from the request's filter, including changing between all tables and one table, return `400 validation` naming `cursor`.
- **Implementation evidence:** [src/v1.js](src/v1.js), cursor lookup/filter check (lines 194–201), stored page boundaries/filter (lines 205–214); [migrations/002_v1_state.up.sql](migrations/002_v1_state.up.sql), `v1_cursors` (lines 13–19).
- **Why another reading was plausible:** The same-filter sentence could be only a client obligation, leaving server behavior on a readable mismatched cursor unspecified. The agent chose to reject it to protect the meaning of the original traversal.
- **Evidence limit:** The unreadable-cursor, insertion-stability and cross-instance cursor tests passed. Their names do not establish that a readable cursor with a mismatched filter was tested. The mismatch response is source-confirmed only.

## 5. Contract interpretations — agent answer and separate student worksheet

**Exact question answered by the implementing agent on 12 November 2026:**

> Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?

**Review status:** Section 5.1 preserves fourteen historical candidates, Section 5.2 records the implementing agent's answer, and Section 5.3 records seven interpretation decisions.

### 5.1 Historical candidates — preserved from the pre-implementation worksheet

These candidates are historical review notes, separate from the implementing agent's recorded answer. Some are explicit rules that might be misread, rather than unresolved ambiguities. Their provisional choices do not override the actual source-grounded answer in Section 5.2.

#### A1 — Unknown fields versus idempotency fingerprint (§§1, 4.2)

- **Reading A:** Unknown request fields are ignored both when placing an order and when deciding whether two keyed requests have the same body.
- **Reading B:** Unknown fields do not influence order creation, but they still count as part of the JSON body when checking for a different request under the same key.
- **Working interpretation to evaluate:** **B**. Section 4.2 defines body equivalence by JSON-value equality and says differences other than object-key order and whitespace matter.
- **Why:** Ignoring an extra field for business processing is separate from treating two raw client requests as equivalent. A server should not silently redefine the stated fingerprint rule.
- **Sentence to add to a future contract revision:** “Idempotency body comparison includes every parsed JSON field, including fields otherwise ignored by order creation; only object-member order and insignificant JSON whitespace are ignored.”

#### A2 — Missing or non-JSON Content-Type (§4.2)

- **Reading A:** The stated `Content-Type: application/json` header is required; missing, different, or parameterized values must be rejected.
- **Reading B:** The server may accept a parseable JSON body with a compatible media type such as `application/json; charset=utf-8`; the numbered validation sequence does not specify a separate Content-Type rejection step.
- **Working interpretation to evaluate:** **B**, provisionally, because the explicit ordered failure algorithm has no Content-Type step, while the contract clearly requires JSON syntax. This is a **specification gap**, not a proven test expectation.
- **Why:** The contract should state a status and problem type if it intends to reject a syntactically valid JSON body based only on its media type.
- **Sentence to add:** “A POST request may use `application/json` with an optional UTF-8 charset parameter; if a JSON body is supplied without that media type, the server [explicitly define accept/reject and the error type].”
- **Decision needing specification-owner confirmation:** The bracketed behavior cannot be resolved definitively from the current text.

#### A3 — Retry with an old key and an invalid body (§4.2)

- **Reading A:** Validate all order fields before determining whether a used key has a replay or conflict.
- **Reading B:** For syntactically valid JSON, check the used key and body equality before field validation.
- **Working interpretation to evaluate:** **B**. The numbered sequence is explicit: key, JSON syntax, prior key, field validation, menu-item existence, creation.
- **Why:** An identical replay must return the stored result, and a reused key with a changed JSON value must fail even if new fields would also be invalid.
- **Sentence to add:** “After successful JSON parsing, check any existing idempotency record before validating body fields or checking menu-item existence; an identical completed request is replayed without revalidation.”

#### A4 — Order-line duplicates (§§3, 4.2)

- **Reading A:** Multiple lines referring to the same menu item should be merged into a single line with the summed quantity.
- **Reading B:** Multiple lines remain separate and in the original order because the contract has no uniqueness constraint.
- **Working interpretation to evaluate:** **B**.
- **Why:** The resource section explicitly preserves client line order and calculates totals over all lines; merging would silently change the response shape.
- **Sentence to add:** “Repeated `menuItemId` values are permitted in different order lines and must not be consolidated or reordered.”

#### A5 — Validation error enumeration (§§2, 4.2)

- **Reading A:** Return one error for the first invalid field, or one summary error for each category.
- **Reading B:** Collect a separate entry for each invalid field that can be identified from the parsed input, using precise JSON Pointers.
- **Working interpretation to evaluate:** **B**.
- **Why:** The contract requires an entry for every problem found, not just the first. If a container such as `items` is not an array, it is not meaningful to invent errors for nonexistent child paths.
- **Sentence to add:** “Report one `errors` entry for each independently invalid field that can be evaluated; when a parent field has the wrong type, report that parent rather than hypothetical missing descendants.”

#### A6 — Missing/invalid path ID and unknown method (§§2, 4.1, 4.3)

- **Reading A:** An invalid path ID produces `400 validation`; an unsupported method on an otherwise known `/v1` path produces `405`.
- **Reading B:** A missing or non-positive-integer resource ID produces `404 not-found`, and a `/v1` route not specified by the contract also uses the specified `404` problem response.
- **Working interpretation to evaluate:** **B** for invalid IDs, because §2 is explicit. For unknown methods, **B is provisional** because method-not-allowed behavior is not separately defined.
- **Why:** The contract directly equates invalid resource IDs with not found, but does not fully describe route-method mismatches.
- **Sentence to add:** “An invalid `{id}` always returns a `404 not-found` problem; unsupported methods on `/v1` endpoints return [explicitly choose `404` or `405` and define the body].”

#### A7 — Cursor value and filter binding (§4.4)

- **Reading A:** A syntactically readable cursor can be reused with any `tableId`; the server applies the new filter.
- **Reading B:** The cursor is tied to the original filter; using it with a different `tableId` is invalid.
- **Working interpretation to evaluate:** **B**, with `400 validation` and `parameter: cursor` for a mismatch.
- **Why:** The text directs clients to use a cursor with the same `tableId`. Reusing a position from a different filtered list can skip rows or violate stable traversal.
- **Sentence to add:** “A cursor is bound to the `tableId` filter used when it was issued; a different filter or an unreadable cursor returns `400 validation` with `parameter: cursor`.”

#### A8 — Cursor snapshot, insertion and last-page behavior (§4.4)

- **Reading A:** Any cursor that fetches older IDs is good enough; new orders may still affect the page boundary or be visible to later pages.
- **Reading B:** The page walk retains a fixed initial upper bound and an advancing position, so new orders do not appear and old orders are not duplicated or skipped.
- **Working interpretation to evaluate:** **B**.
- **Why:** The “pages do not move” rule and the `null`-if-and-only-if-no-more rule are stronger than a simple offset or naive next-page token.
- **Sentence to add:** “Each `nextCursor` must preserve the first page's maximum visible order ID, the last returned position, and the original filter; return `null` when no matching orders remain beyond that position.”

#### A9 — Multiple occurrences of one query parameter (§4.4)

- **Reading A:** For `?limit=10&limit=20`, silently use the first value or the last value.
- **Reading B:** Reject repeated scalar pagination/filter parameters as ambiguous input.
- **Working interpretation to evaluate:** **B**, provisionally.
- **Why:** The specification describes one integer value for each parameter, but it does not say how duplicate query keys are handled. Silent selection can depend on framework behavior.
- **Sentence to add:** “Each of `tableId`, `limit`, and `cursor` may occur at most once; repeated occurrences return `400 validation` naming that parameter.”

#### A10 — Header value length and whitespace (§4.2)

- **Reading A:** Measure the `Idempotency-Key` using UTF-8 bytes and treat surrounding whitespace as part of the key.
- **Reading B:** Measure character count and normalize HTTP header optional whitespace before testing length or emptiness.
- **Working interpretation to evaluate:** **B** as a usability-oriented interpretation, but the exact meaning of “characters” and whether blank-only keys are accepted needs clarification.
- **Why:** JavaScript UTF-16 units, Unicode code points and UTF-8 bytes can differ; HTTP libraries also normalize whitespace differently.
- **Sentence to add:** “Validate the key after removing HTTP optional whitespace surrounding its field value, count Unicode code points for the 1–255-character limit, and reject a resulting empty value.”

#### A11 — Persistent replay across process restarts (§4.2)

- **Reading A:** Keeping completed keys in an in-memory map is enough for retries while one process remains alive.
- **Reading B:** Completed keys and the exact successful response must be stored durably with the order and remain usable for at least 24 hours, across restarts and multiple instances sharing the database.
- **Working interpretation to evaluate:** **B**.
- **Why:** The contract requires storing the key/fingerprint/response in the same transaction as the order. An in-memory-only cache is neither part of that transaction nor durable for 24 hours.
- **Sentence to add:** “A successfully completed key, its canonical request fingerprint, and its exact `201` response must be committed atomically with the order in durable shared storage and replayable for at least 24 hours across process restarts.”

#### A12 — Legacy deprecation and successor headers (§5)

- **Reading A:** `Deprecation` and `Sunset` are attached only to successful legacy responses, and `Link` may be attached to all `/menu/{id}` responses.
- **Reading B:** Both lifecycle headers appear on **every** legacy response, including errors; the successor `Link` appears specifically on successful `GET /menu/{id}`.
- **Working interpretation to evaluate:** **B**.
- **Why:** Section 5 explicitly mentions errors for the first two headers and limits the successor header to a successful response from that endpoint.
- **Sentence to add:** “Attach `Deprecation` and `Sunset` to every response from a legacy route, regardless of status; attach the successor-version `Link` only to `200 GET /menu/{id}`.”

#### A13 — `errors` field on problem responses (§2)

- **Reading A:** Include `errors: []` on every error response, regardless of problem type.
- **Reading B:** Include `errors` only for `validation` and `unknown-menu-item`, with one entry for every problem actually identified.
- **Working interpretation to evaluate:** **B**.
- **Why:** The member table restricts `errors` to those two problem types. Other failures use `type`, `title`, `status`, and occurrence-specific or generic `detail` as specified.
- **Sentence to add:** “Omit the `errors` member on all problem types except `validation` and `unknown-menu-item`; for those two types, include one entry per detected problem.”

#### A14 — Historical unit prices versus current menu prices (§3)

- **Reading A:** The server derives `unitPriceVnd` and `totalVnd` from the current menu table every time an existing order is retrieved.
- **Reading B:** Save the unit price at creation and derive the order total from those stored order-line amounts, even if the legacy API later changes menu prices.
- **Working interpretation to evaluate:** **B**.
- **Why:** The contract explicitly freezes each line's unit price at the time of placing the order.
- **Sentence to add:** “Persist each order line's original `unitPriceVnd`; later menu price updates must not change an existing order's lines or `totalVnd`.”

### 5.2 Implementing agent's actual answer

> Which sentences of CONTRACT.md could be read two ways, and what did you choose for each?

**Answer by Codex, 12 November 2026:** I identified the following plausible alternative readings or unspecified consequences. My choices describe the first implementation, not a proposed code change. Explicit requirements such as key-before-field validation, historical prices and stable pages are not ambiguities merely because an implementation could get them wrong.

#### R1 — Ignoring unknown fields versus comparing entire JSON bodies (§§1, 4.2)

- **Sentences:** “The server ignores request fields it does not know”; “Two bodies are the same when they are equal as JSON values”.
- **Reading A:** Remove unknown fields before both order processing and idempotency comparison.
- **Reading B:** Ignore them for order construction but retain them for whole-JSON equality.
- **My actual choice:** **B**, because §4.2 specifically defines equality; `canonical` includes all parsed object members (`src/v1.js`, lines 28–34, 123). See S1 for evidence limits.

#### R2 — Content-Type requirement and the ordered checks (§4.2)

- **Sentence:** “Request headers: `Content-Type: application/json` and `Idempotency-Key`”, read alongside the numbered validation sequence.
- **Reading A:** Reject a missing or non-JSON media type, despite the omitted failure step/status.
- **Reading B:** Apply the stated key and JSON checks without adding a separate media-type error.
- **My actual choice:** **B**: parse the body without inspecting Content-Type (`src/v1.js`, lines 103–128). The consequence for a missing/different header is underspecified. See S2.

#### R3 — Consequence of a readable cursor with a changed filter (§4.4)

- **Sentence:** “Use a cursor with the same `tableId` it came from.”
- **Reading A:** This constrains the client only; the server's mismatch response is unspecified.
- **Reading B:** Treat a readable cursor with another filter as invalid input.
- **My actual choice:** **B**, using `400 validation` and `parameter: cursor`; I bind the stored cursor to its original filter (`src/v1.js`, lines 194–201). The status for this specific mismatch is an interpretation. See S3.

#### R4 — Repeated occurrences of query parameters (§4.4)

- **Sentence/table entry:** “Query parameters, all optional”, followed by one scalar rule each for `tableId`, `limit` and `cursor`.
- **Reading A:** Multiple occurrences may be accepted by selecting one value.
- **Reading B:** The scalar parameter may occur only once; repetitions are invalid.
- **My actual choice:** **B**, to avoid silently choosing between values; `getAll(name).length !== 1` reports `validation` for the named parameter (`src/v1.js`, lines 181–200). The contract does not explicitly state parameter multiplicity; the first-run output does not establish this case's coverage.

#### R5 — Error pointer for a non-object order line (§§2, 4.2)

- **Sentences:** Section 2 requires one entry “per problem found”; §4.2 lists the fields `items[i].menuItemId` and `items[i].qty` and requires every broken field to be listed.
- **Reading A:** A non-object line represents two missing/invalid child fields, so report both child pointers.
- **Reading B:** Report the invalid parent line once, because child-field validation cannot meaningfully proceed on a non-object.
- **My actual choice:** **B**: return a single `/items/{i}` error for that line and continue validating other lines (`src/v1.js`, lines 48–58). The parent-versus-children reporting granularity is not specified. The passing general validation test does not reveal whether it exercised this case.

#### R6 — Unsupported methods on otherwise known paths (§§2, 4.1–4.4)

- **Sentence:** Section 2 assigns `not-found` to “no such `/v1` path”, while §4 lists specific method/path pairs.
- **Reading A:** A known path with an unsupported method needs a separate method-not-allowed response, whose problem slug/status the contract does not define.
- **Reading B:** A request outside the specified method/path pairs uses the existing `404 not-found` response.
- **My actual choice:** **B**, through the fallback in `handleV1` (`src/v1.js`, lines 219–239), to use the defined error vocabulary. This concerns method mismatches; invalid resource IDs are explicitly `404` and are not an unresolved choice. The unknown-path test's name does not establish unsupported-method coverage.

#### R7 — Meaning of key length in characters (§4.2)

- **Sentence:** The key is “a string of 1 to 255 characters”.
- **Reading A:** Count Unicode code points in the string received by the application.
- **Reading B:** Count encoded bytes or JavaScript UTF-16 units.
- **My actual choice:** **A**, using `[...key].length` for the upper bound (`src/v1.js`, lines 104–106). The handler does not explicitly trim the key; it uses the header value supplied by Node. This is narrower than historical candidate A10's proposed whitespace normalization. Character units and whitespace treatment are not fully specified, and the first-run output does not establish Unicode boundary coverage.

**Evidence boundary:** All seven choices are source-confirmed in `4c49c10`. The preserved suite reports 29/29 overall; it does not enumerate requests/assertions for these specific edge cases. No new experiments were run to expand that evidence.

### 5.3 Seven final interpretation decisions

The following decisions compare each reading with the wording of `CONTRACT.md`. The proposed sentences are for a future contract revision only; the frozen `CONTRACT.md` remains unchanged.

#### R1 — Unknown fields and idempotency equality (§§1, 4.2)

- **Reading A:** Strip unknown request fields before order handling **and** before comparing a reused key's body.
- **Reading B:** Ignore unknown fields while creating the order, but compare the entire parsed JSON body, including those fields, for idempotency.
- **Chosen:** **B.**
- **Reason:** §4.2 specifically defines equal bodies as equal JSON values and exempts only object-key order and whitespace. If an unknown field changes, the two JSON values differ even though both may create the same-looking order. This is also how `canonical` works in `4c49c10`.
- **Future clarification:** “Unknown request fields do not affect order creation, but every JSON member, including unknown members, participates in idempotency-body equality.”

#### R2 — Content-Type versus the prescribed check order (§4.2)

- **Reading A:** Reject a missing or non-JSON `Content-Type` header before accepting an otherwise valid JSON body.
- **Reading B:** Treat `Content-Type: application/json` as the documented request format; apply the enumerated key, JSON-syntax and body checks without inventing a separate media-type rejection.
- **Chosen:** **B**, for this version's error behavior.
- **Reason:** The ordered procedure lists neither a Content-Type check nor its error slug or precedence. Adding one would make the specified first-failing-step order unpredictable. This is an underspecified requirement, not a claim that all Content-Types are equally desirable.
- **Future clarification:** “For `POST /v1/orders`, the server parses the body as JSON regardless of the supplied Content-Type and does not reject a request solely because that header is absent or different.”

#### R3 — Reusing a cursor under another table filter (§4.4)

- **Reading A:** The same-`tableId` instruction is advice to clients; the response for a readable cursor paired with another filter is unspecified.
- **Reading B:** The cursor is bound to the filter used to issue it, so changing the filter is invalid.
- **Chosen:** **B.**
- **Reason:** The cursor represents a position within one filtered walk. Reinterpreting that position under another filter could skip orders, defeating “pages do not move”.
- **Future clarification:** “If a cursor is used with a `tableId` different from the one used when it was issued, including switching between a filtered and unfiltered list, return `400 validation` with `parameter: cursor`.”

#### R4 — Repeated query parameter names (§4.4)

- **Reading A:** For `?limit=10&limit=20`, use one value (first or last) and continue.
- **Reading B:** Reject duplicate occurrences of a scalar parameter.
- **Chosen:** **B.**
- **Reason:** The contract defines one value per parameter. First-versus-last selection depends on a framework convention the client cannot safely assume.
- **Future clarification:** “Each of `tableId`, `limit` and `cursor` may occur at most once; repeating one returns `400 validation` with that parameter's name.”

#### R5 — Validation pointers for a non-object order line (§§2, 4.2)

- **Reading A:** A primitive or null `items[i]` has invalid `menuItemId` and `qty` children, so report two child pointers.
- **Reading B:** Report a single error on `/items/i` because there is no object whose child fields can be examined.
- **Chosen:** **B.**
- **Reason:** Section 2 asks for one entry per actual problem; a line of the wrong type is one identifiable structural problem. Reporting imaginary child fields overstates what was parsed, while other valid line objects can still be checked.
- **Future clarification:** “If an `items` element is not an object, report one `validation` error pointing to `/items/{i}` and do not invent errors for its nonexistent child fields.”

#### R6 — Method mismatch on a known path (§§2, 4.1–4.4)

- **Reading A:** Return `405 Method Not Allowed` for an unsupported HTTP method on a known path.
- **Reading B:** Treat any method/path pair not listed as an unsupported `/v1` route and return `404 not-found`.
- **Chosen:** **B** under this frozen contract.
- **Reason:** §2 supplies an exhaustive problem-slug/status table, but no `405` entry. Returning `405` would require a new error definition, whereas `404 not-found` can use the existing contract vocabulary. A future version could define `405` explicitly.
- **Future clarification:** “Any `/v1` request whose method and path do not match an endpoint defined in this contract returns the `404 not-found` problem, even if the path exists for another method.”

#### R7 — Length of an Idempotency-Key (§4.2)

- **Reading A:** Count Unicode code points in the header value received by the application.
- **Reading B:** Count UTF-8 bytes or JavaScript UTF-16 code units.
- **Chosen:** **A.**
- **Reason:** The contract says “characters”, not bytes. Code points are a clearer cross-language rule for non-ASCII values than a JavaScript-specific code-unit count. The implementation uses `[...key].length` for the maximum and relies on Node's delivered header string; this is not evidence that every Unicode header can traverse HTTP unchanged.
- **Future clarification:** “Measure the 1–255-character Idempotency-Key limit in Unicode code points of the header value delivered after HTTP header parsing; do not measure UTF-8 bytes or UTF-16 code units.”

## 6. Additional ambiguity outside R1–R7 — unknown query parameters

This case is distinct from R1–R7 in §5.2. **Independent discovery (student-confirmed, 12 November 2026):** I identified the ambiguity about unknown query-parameter names myself while reviewing the contract, then checked that it was absent from the implementing agent's R1–R7 answer. This provenance is recorded from my own confirmation; it is not presented as independently observable tool evidence.

- **Contract section and sentence:** §1: “The server ignores request fields it does not know.” §4.4: “Query parameters, all optional”, followed by the rules for `tableId`, `limit` and `cursor`; “A value outside these rules is `400 validation` with `parameter` set to its name.”
- **Reading 1:** Unknown query parameters such as `?debug=true` are ignored. The validation rules apply to the three **known** query parameters, while §1 favors tolerance of unknown request data.
- **Reading 2:** The table is an exhaustive allowlist. An unknown query name is itself outside the rules and returns `400 validation` with `parameter: debug`.
- **Chosen reading:** **Reading 1 — ignore unknown query parameters.**
- **Why:** §4.4 explicitly defines validation constraints for each of the three recognized names but not a prohibition on extra names. Ignoring extras is consistent with §1's tolerance of unknown request fields and supports clients that may append incidental parameters. This is a choice where the wording does not directly settle whether “request fields” includes query parameters.
- **Sentence to add in a future contract version:** “`GET /v1/orders` ignores query parameters other than `tableId`, `limit` and `cursor`; an unknown query parameter alone does not cause a validation error.”
- **Why this is distinct from R1–R7:** §5.2 R1 concerns **unknown JSON body fields**, R4 concerns **duplicate known query parameters**, and R2–R3/R5–R7 concern other topics. None of R1–R7 specifies treatment of **unknown query parameter names**. The current `listOrders` implementation reads only the three known names and therefore ignores extras; the first-run log has no named test covering this specific choice.

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

- **Prediction 1:** **NOT CONFIRMED** by first run `486588a` (29/29); passing cases include “§4.2 the key is checked before the body”, “§4.2 a retry with the same key and body replays the first response” and “§4.2 the same key with a different body is 422 and creates nothing”. Original source `4c49c10` checks prior keys before field validation. No failing response was recorded.
- **Prediction 2:** **NOT CONFIRMED** by first run `486588a`; “§4.4 an order placed between two pages does not shift the next page”, “§4.4 newest first; every order exactly once; default page size 20” and “§4.4 nextCursor is null exactly when there is nothing more” passed. Original source `4c49c10` uses ID boundaries, not offset.
- **First contract run:** PASS 29/29, zero failures; `contract-run-1.txt` commit `486588a`. Criterion 4 special-case assumptions documented in Section 4.3; not a final verification run.
- **Final legacy test run:** NOT VERIFIED. `[X/3; NODE VERSION AND COMMAND]`
- **Final contract test run:** NOT VERIFIED. `[X/29; REFERENCE TO contract-run-final.txt]`
- **Implementing agent's ambiguity answer:** Recorded on 12 November 2026, Codex, §5.2. Seven selected readings, reasons and proposed clarifications appear in §5.3.
- **Additional ambiguity outside R1–R7:** §6 addresses unknown query-parameter names, presents two readings and proposes a clarification. The student has confirmed this was their own independent finding, absent from the agent's R1–R7 list.
- **Remaining uncertainty after fixes:** `[REAL OBSERVATIONS ONLY]`

## 8. Submission and evidence cross-check

Before treating this document as a submission artifact, ensure all boxes are supported by actual files and commits:

- [x] Read `CONTRACT.md` independently for ten minutes and select two predictions with reasons (student confirmation).
- [x] Commit those student predictions **before** an agent edits `src/` (`fc96aaa`; sequence verified from Git).
- [x] Save the agent's first implementation in a distinct commit (`4c49c10`).
- [x] Capture and commit the first contract-run evidence before repairs (`486588a`; file unchanged on inspection; student confirms this is the first run).
- [x] Replace Section 4's failure placeholders using the 29/29 special case: three actual assumptions in Section 4.3.
- [ ] Use only failing test names and contract section references in repair prompts; record exact prompts in `AI-LOG.md`.
- [x] Ask the implementing agent the exact ambiguity question and preserve its actual answer; §5.3 contains seven decisions, reasons and clarification sentences.
- [x] Document an additional ambiguity independently found by the student: §6 covers unknown query-parameter names, with student-confirmed provenance and a comparison against the agent's R1–R7 answer.
- [ ] Preserve `test/` and `CONTRACT.md`; create new tables only in paired `migrations/002_*.up.sql` and `.down.sql` files.
- [ ] Verify Node >= 22.13, migrations, seed, legacy tests, and contract tests; save `contract-run-final.txt`.
- [ ] Fill `SELF_ASSESSMENT_REPORT.md` with six evidence-backed scores and a truthful total.
- [ ] Package the repository **with `.git/`**, excluding `data/` and `node_modules/`; name it `<StudentID>_<total>.zip` with a total matching the report.
