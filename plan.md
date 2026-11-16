# StudyTrack implementation plan

Domain-only app (no HTTP routes). Skeleton functions throw `NotImplementedError`. Baseline: **24 failing / 0 passing** (all fail at `createCourse` / unimplemented store).

## Failing tests by acceptance criterion

| Criterion | Failing tests |
| --- | --- |
| AC-001 | `test_AC001` |
| AC-002 | `test_AC002`, `test_AC002_confirm` |
| AC-003 | `test_AC003` |
| AC-004 | `test_AC004` |
| AC-005 | `test_AC005` (also covers `extra-concurrency` from `test_plan.md`) |
| AC-006 | `test_AC006` |
| AC-007 | `test_AC007` |
| AC-008 | `test_AC008` |
| AC-009 | `test_AC009` |
| AC-010 | `test_AC010`, `test_AC010_reject` |
| AC-011 | `test_AC011`, `test_AC011_week_boundary` |
| AC-012 | `test_AC012` |
| *(extras, no AC id)* | `test_extra_different_dates`, `test_extra_unknown_id`, `test_extra_reschedule_conflict`, `test_extra_invalid_priority`, `test_extra_missing_deadline`, `test_extra_empty_filter`, `test_extra_subtasks_not_counted`, `test_extra_actual_not_inferred`, `test_extra_delete_session` |

---

## Slice 1: Persist course and assignment

- **Name:** Persist course and assignment
- **Goal:** Create a course and assignment and reload them from an in-memory store (thin end-to-end path).
- **Spec sources:** Description; FR-001; Operational Rules 1–2; NFR-001; contracts Persistence Store + `createCourse` / `listCourses` / `createAssignment` / `listAssignments`; architecture Persistence Store + Coursework Manager.
- **Criteria:** AC-001
- **Tests that should turn green:** `test_AC001`
- **Skeleton to fill in:** `createMemoryStore`, `createLocalStorageStore`, `PersistenceStore.load`, `PersistenceStore.save`, `createCourse`, `listCourses`, `createAssignment`, `listAssignments`
- **Depends on:** none
- **Done when:** `test_AC001` passes; no previously passing test fails.
- **Status:** done

## Slice 2: Assignment input validation

- **Name:** Assignment input validation
- **Goal:** Reject empty required fields and priorities outside Low/Medium/High without writing.
- **Spec sources:** FR-001; Operational Rule 1; architecture priority decision; contracts `createAssignment` failures.
- **Criteria:** *(none — gap extras)*
- **Tests that should turn green:** `test_extra_invalid_priority`, `test_extra_missing_deadline`
- **Skeleton to fill in:** validation paths in `createAssignment` (same function as Slice 1)
- **Depends on:** Slice 1
- **Done when:** those two tests pass; Slice 1 tests still pass.
- **Status:** done (validation shipped with Slice 1 `createAssignment` general rules)

## Slice 3: Update assignment

- **Name:** Update assignment
- **Goal:** Change assignment fields by id and leave data unchanged when the id is unknown.
- **Spec sources:** FR-001; FR-006; Operational Rule 2; contracts `updateAssignment`.
- **Criteria:** *(partial AC-002 edit is completed with Slice 8; this slice owns the unknown-id extra)*
- **Tests that should turn green:** `test_extra_unknown_id`
- **Skeleton to fill in:** `updateAssignment`
- **Depends on:** Slice 1
- **Done when:** `test_extra_unknown_id` passes; earlier greens stay green.
- **Status:** not started

## Slice 4: Subtasks

- **Name:** Subtasks
- **Goal:** Add, rename, list, and delete subtasks under an assignment.
- **Spec sources:** FR-002; AC-003; contracts subtask functions.
- **Criteria:** AC-003
- **Tests that should turn green:** `test_AC003`
- **Skeleton to fill in:** `createSubtask`, `listSubtasks`, `updateSubtask`, `deleteSubtask`
- **Depends on:** Slice 1
- **Done when:** `test_AC003` passes; earlier greens stay green.
- **Status:** not started

## Slice 5: Schedule happy path

- **Name:** Schedule happy path
- **Goal:** Create, list for a Monday week, and reschedule a non-conflicting course-only session.
- **Spec sources:** FR-003; FR-004; Operational Rules 3–4; AC-004; contracts Schedule Manager + `detectOverlap` (no-overlap case).
- **Criteria:** AC-004
- **Tests that should turn green:** `test_AC004`
- **Skeleton to fill in:** `createSession`, `listSessions`, `rescheduleSession`, `detectOverlap` (enough for non-overlap / self-exclude on reschedule)
- **Depends on:** Slice 1
- **Done when:** `test_AC004` passes; earlier greens stay green.
- **Status:** not started

## Slice 6: Session time range

- **Name:** Session time range
- **Goal:** Reject sessions whose end is not strictly after start; accept adjacent and one-minute sessions.
- **Spec sources:** FR-003; FR-004; Operational Rule 3; AC-006; contracts session check order step 2.
- **Criteria:** AC-006
- **Tests that should turn green:** `test_AC006`
- **Skeleton to fill in:** time-range checks in `createSession` (and shared helpers used by reschedule)
- **Depends on:** Slice 5
- **Done when:** `test_AC006` passes; earlier greens stay green.
- **Status:** not started

## Slice 7: Session conflicts

- **Name:** Session conflicts
- **Goal:** Detect same-date overlaps, refuse to save them, and allow different dates and endpoint contact.
- **Spec sources:** FR-003; FR-004; Operational Rule 3; NFR-002; NFR-005; AC-005; `extra-different-dates`; `extra-concurrency`.
- **Criteria:** AC-005
- **Tests that should turn green:** `test_AC005`, `test_extra_different_dates`
- **Skeleton to fill in:** `detectOverlap` (full rule); overlap branch in `createSession`
- **Depends on:** Slice 5 (adjacent to Slice 6)
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

## Slice 8: Course/assignment link consistency

- **Name:** Course/assignment link consistency
- **Goal:** Reject a session whose assignment does not belong to the chosen course; accept a matching pair.
- **Spec sources:** FR-003; Operational Rule 4; AC-012; contracts session check order steps 3–4.
- **Criteria:** AC-012
- **Tests that should turn green:** `test_AC012`
- **Skeleton to fill in:** consistency checks in `createSession`
- **Depends on:** Slice 5
- **Done when:** `test_AC012` passes; earlier greens stay green.
- **Status:** not started

## Slice 9: Reschedule conflict and delete session

- **Name:** Reschedule conflict and delete session
- **Goal:** Leave a session unchanged when a reschedule overlaps another; remove a session without deleting its course.
- **Spec sources:** FR-003; FR-004; Operational Rule 7; `extra-reschedule-conflict`; `extra-delete-session`.
- **Criteria:** *(none — gap extras)*
- **Tests that should turn green:** `test_extra_reschedule_conflict`, `test_extra_delete_session`
- **Skeleton to fill in:** overlap exclude-self in `rescheduleSession`; `deleteSession`
- **Depends on:** Slices 5 and 7
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

## Slice 10: Edit and cascade delete coursework

- **Name:** Edit and cascade delete coursework
- **Goal:** Edit an assignment, preview dependents without deleting, and cascade-delete a course after confirm.
- **Spec sources:** FR-001; Operational Rule 7; NFR-005; AC-002.
- **Criteria:** AC-002
- **Tests that should turn green:** `test_AC002`, `test_AC002_confirm`
- **Skeleton to fill in:** `previewDeleteAssignment`, `previewDeleteCourse`, `deleteCourse`, `deleteAssignment`, `updateCourse` (FR-001 edit courses; no dedicated test)
- **Depends on:** Slices 1, 3, 4, 5 (confirm scenario needs subtask + session)
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

## Slice 11: Deadlines and filters

- **Name:** Deadlines and filters
- **Goal:** Mark overdue/upcoming from a local clock and filter by course and priority, including empty results.
- **Spec sources:** FR-005; Operational Rules 2 and 6; NFR-003; AC-007; `extra-empty-filter`.
- **Criteria:** AC-007
- **Tests that should turn green:** `test_AC007`, `test_extra_empty_filter`
- **Skeleton to fill in:** `listTrackedAssignments`
- **Depends on:** Slice 1
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

## Slice 12: Record study time

- **Name:** Record study time
- **Goal:** Save positive actual durations and reject nonpositive ones without writing.
- **Spec sources:** FR-007; Operational Rule 5; NFR-001; NFR-002; AC-010.
- **Criteria:** AC-010
- **Tests that should turn green:** `test_AC010`, `test_AC010_reject`
- **Skeleton to fill in:** `recordStudyTime`, `listStudyTimeRecords`
- **Depends on:** Slice 1
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

## Slice 13: Progress counts and status

- **Name:** Progress counts and status
- **Goal:** Transition editable statuses, reject `Overdue` as a status, and count completed vs remaining assignments (not subtasks).
- **Spec sources:** FR-001; FR-006; Operational Rules 2 and 6; NFR-004; AC-008; AC-009; `extra-subtasks-not-counted`.
- **Criteria:** AC-008, AC-009
- **Tests that should turn green:** `test_AC008`, `test_AC009`, `test_extra_subtasks_not_counted`
- **Skeleton to fill in:** status validation in `updateAssignment`; `getProgressSummary` assignment counts and labels
- **Depends on:** Slices 1, 3, 4 (subtasks extra), 12 optional for zero time fields
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

## Slice 14: Planned versus actual study time

- **Name:** Planned versus actual study time
- **Goal:** Sum in-week session minutes and study-time records, including week boundaries, without inferring actual from sessions.
- **Spec sources:** FR-007; FR-008; Operational Rules 5–6; NFR-004; NFR-009; AC-011; `extra-actual-not-inferred`.
- **Criteria:** AC-011
- **Tests that should turn green:** `test_AC011`, `test_AC011_week_boundary`, `test_extra_actual_not_inferred`
- **Skeleton to fill in:** planned/actual math in `getProgressSummary`; Monday week validation
- **Depends on:** Slices 5, 12, 13
- **Done when:** those tests pass; earlier greens stay green.
- **Status:** not started

---

## Coverage check

| Item | Slice |
| --- | --- |
| AC-001 … AC-012 | 1, 10, 4, 5, 7, 6, 11, 13, 13, 12, 14, 8 |
| All 24 named tests | Assigned above |
| `extra-concurrency` | Via `test_AC005` in Slice 7 (no separate test file case) |
| `extra-precedence` | No test call (`test_plan.md`); listed under Test issues |

### Criterion or test that fits no slice

- None for AC-001–AC-012 or the 24 executable tests.
- `extra-precedence`: no executable test (documented gap only).

### Function or route that no slice fills

- **REST routes:** none in contracts (N/A).
- **UI pages** (`CourseworkPage`, `WeeklyCalendarPage`, `ProgressPage`): presentation shell only; no failing domain test requires them. Left for a later UI wiring task outside this domain plan.
- **`updateCourse` / `deleteAssignment`:** filled in Slice 10 for FR-001 completeness even though no dedicated test calls them.

## Design questions

- None required to start Slices 1–2. Later slices may ask whether `getProgressSummary` should share a week-bounds helper with `listSessions` (preference only; both already require Monday-start in contracts).

## Test issues

- `extra-precedence` has no call by design (`test_plan.md`); not a wrong test.
- No test appears to contradict `spec.md` / `contracts.md` for Slices 1–2.

## Review notes

- Slices are backlog-sized: one thin persist path, then validation, then schedule rules split so overlap vs time-range vs mismatch failures isolate one cause.
- No slice depends on a later slice.
- Every AC and every failing test name appears in exactly one slice.

**Next action:** Implement Slice 1 “Persist course and assignment”; make `test_AC001` pass first.
