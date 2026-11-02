# StudyTrack Architecture

## 1. Overview

StudyTrack is a single-page browser application that lets one student manage coursework, plan weekly study sessions, and review progress. The UI talks to a small set of domain modules that validate and mutate an in-browser persistent store; there is no server, authentication layer, or external integration in this version.

## 2. Modules

| Module | Responsibility | May depend on | Required by |
| --- | --- | --- | --- |
| Web UI | Present coursework, weekly calendar, and progress views; collect student input; show validation, conflict, and deletion-confirmation messages. | Coursework Manager, Schedule Manager, Deadline Tracker, Study-Time Recorder, Progress Aggregator | Description (web application); NFR-008; AC pages/views |
| Persistence Store | Load and save the student's data so successful writes survive a page reload; reject incomplete writes so a failed operation leaves prior data unchanged. | — | Operational Rule 1; NFR-001; NFR-002; AC-001; AC-010 |
| Coursework Manager | Create, read, update, and delete courses, assignments, and subtasks, including status changes; when deleting, load dependent records from the store, warn, and cascade only after confirmation. | Persistence Store | FR-001; FR-002; Operational Rule 2 (status); Operational Rule 7; AC-001; AC-002; AC-003; AC-008 |
| Schedule Manager | Create, view, reschedule, and delete study sessions on the weekly calendar; enforce start-before-end, course/assignment link consistency, and same-date sessions. | Persistence Store, Conflict Detector, Coursework Manager | FR-003; Operational Rules 3–4; AC-004; AC-006; AC-012 |
| Conflict Detector | Decide whether a proposed session overlaps any existing session under Operational Rule 3; report conflict without mutating storage. | — | FR-004; Operational Rule 3; AC-005; AC-006 |
| Deadline Tracker | Classify assignments as upcoming or overdue using local date/time and apply course and priority filters to the assignment list. | Coursework Manager | FR-005; Operational Rules 2 and 6; AC-007 |
| Study-Time Recorder | Create and persist actual study-time records with duration greater than zero; never infer duration from calendar elapsed time. | Persistence Store, Coursework Manager | FR-007; Operational Rule 5; AC-010 |
| Progress Aggregator | Count completed vs remaining assignments and total planned vs actual study minutes for the selected reporting week. | Coursework Manager, Schedule Manager, Study-Time Recorder | FR-006; FR-008; Operational Rules 5–6; NFR-004; NFR-009; AC-008; AC-009; AC-011 |

## 3. Request flow

### Primary scenario: Reject an overlapping session (AC-005; FR-003, FR-004)

1. The student opens the weekly calendar view in the **Web UI**.
2. The **Web UI** asks the **Schedule Manager** for sessions in the selected week; the **Schedule Manager** reads them from the **Persistence Store**.
3. The student enters a new session (for example Monday 18:30–19:30) and submits it.
4. The **Schedule Manager** checks that start time is earlier than end time and that course/assignment links are consistent (Operational Rules 3–4). If those checks fail, the flow stops with a validation message and no write (AC-006 / AC-012 paths).
5. The **Schedule Manager** asks the **Conflict Detector** whether the proposal overlaps any existing stored session (`new.start < existing.end` and `existing.start < new.end`; endpoints-only touch is not a conflict).
6. The **Conflict Detector** reports an overlap with the existing Monday 18:00–19:00 session.
7. The **Schedule Manager** does **not** call the **Persistence Store** to write the proposal (**NFR-002**).
8. The **Web UI** shows a conflict message, keeps the proposed session editable, and leaves the weekly schedule unchanged so the student can correct the times and resubmit or cancel (**AC-005**; **NFR-005**).

### Secondary scenario: Persist coursework (AC-001; FR-001)

1. The student creates a course and assignment on the coursework page (**Web UI**).
2. The **Coursework Manager** requires the fields needed by FR-001 / Operational Rule 1 and defaults status to `Not Started` when unset (Operational Rule 2).
3. On success, the **Coursework Manager** writes through the **Persistence Store**.
4. After reload, the **Web UI** / **Coursework Manager** read the same records from the **Persistence Store** (**NFR-001**).

## 4. Design decisions

| Decision | Reason |
| --- | --- |
| TypeScript + React (Vite) single-page app in the browser | Satisfies Description / **NFR-008** (standalone web application) with one client codebase; preference for a common student-project stack. |
| Persist all domain data in `localStorage` as structured JSON | **NFR-001** / Operational Rule 1 / AC-001 / AC-010 require durability across reload; **NFR-006** and **NFR-007** allow a local-only store with no server or external sync. |
| No authentication or user accounts in v1 | Description and Actors define one student; **NFR-007**; listed as open in Scope and Decisions to Confirm — resolved as “none.” |
| Priority values are exactly `Low`, `Medium`, `High` | Scope and Decisions to Confirm gives this example; needed so FR-005 / AC-007 filters are testable. |
| Subtasks have a title (and assignment parent) only — no independent completion status | Scope and Decisions to Confirm; Operational Rule 6 counts assignments, not subtasks, for dashboard totals (**AC-009**). |
| A study session must lie on a single local calendar date (no midnight-crossing sessions) | Keeps Operational Rule 3 overlap checks on one timeline per AC-005/AC-006; midnight crossing is left open in Scope and Decisions to Confirm — resolved here to simplify enforcement in **Schedule Manager**. |
| Week view and reporting period both use a Monday-start calendar week | Preference (not mandated by the spec). **FR-008** / Operational Rule 6 require the same selected reporting period for planned and actual totals; Monday-start makes that period identical to the weekly schedule selection. |
| “Current local date and time” comes from the browser’s local clock | Operational Rule 2 and AC-007 pin overdue behavior to local date/time; **Deadline Tracker** is where this is enforced. |
| Daylight-saving transitions: use the browser `Date` timeline as-is; no special DST bridging | Preference / known limit. Spec leaves DST open; design does not invent extra rules. |
| Planned duration = sum of saved session lengths in minutes; actual duration = sum of student-entered study-time records only | Operational Rule 5; **FR-007**; **FR-008**; **AC-011**. Enforced in **Progress Aggregator** and **Study-Time Recorder**. |
| Cascade delete: warn with dependent record list; confirm deletes dependents; cancel preserves all | Operational Rule 7; **AC-002**. Enforced in **Coursework Manager** (and **Schedule Manager** for session-only deletes). |
| Maximum field lengths: course/assignment/subtask titles ≤ 100 characters; optional notes ≤ 500 | Preference (Scope and Decisions to Confirm lists max lengths as open). Not required by an AC; soft client-side limits only. |

## 5. Constraints and known limits

### Implementation constraints

- Language and framework: TypeScript and React (Vite).
- Delivery: browser single-page application; no backend service in v1.
- Persistence: browser `localStorage` only.
- Hosting / cost: free local development; no paid cloud services required.
- Integrations: none (**NFR-006**).
- Users: one local student; no login (**NFR-007**).

### What this design does not handle

- Multi-device sync or backup beyond the single browser profile that owns `localStorage`.
- Multi-student accounts, roles, or concurrent editors.
- Server-side authoritative time or shared clocks.
- Import/export with Canvas, Google Calendar, or email.
- Sessions that span midnight or custom academic calendars with non-Monday week starts (unless the Monday-start preference is changed).
- Subtask-level progress metrics.
- Cleared site data / private browsing: wiping browser storage loses the student’s data (**NFR-001** holds only while storage remains).

### If requirements grew

| Growth | What would change |
| --- | --- |
| Multiple students or login | Add an identity module and replace anonymous `localStorage` with per-user server storage. |
| Cross-device sync | Introduce a backend API and migrate **Persistence Store** off the browser. |
| LMS / calendar integrations | New adapter modules; would expand beyond **NFR-006** / Non-Goals. |
| Midnight-spanning sessions | Relax the same-date rule in **Schedule Manager** and extend **Conflict Detector** across date boundaries. |
| Instructor features or grading | Out of Non-Goals; would need new modules and a revised domain model. |

## 6. Out of scope

Copied from the spec’s Non-Goals:

1. University course registration or enrollment systems.
2. Grading, grade calculation, or official academic evaluation.
3. Assignment submission to instructors or learning management systems.
4. Instructor or peer communication.
5. Integration with Canvas, Google Calendar, email, or other external systems.
6. Multi-student accounts, authentication providers, or shared schedules (beyond the single local student in v1).
7. Inferring actual study time from elapsed calendar time without a student-entered study-time record (Operational Rule 5).

## 7. Spec issues

None that block this architecture. The following remain preferences rather than contradictions, already recorded in Design decisions:

- Exact priority labels, max lengths, week-start day, midnight-crossing sessions, DST policy, and subtask completion status were open in Scope and Decisions to Confirm; this document resolves them without expanding features.
- The spec does not define a numeric performance budget (for example max latency for conflict checks). No performance module or cache was added.

## 8. Acceptance criterion coverage (architecture review)

Review of every acceptance criterion against this design. No criterion lacks a home; no module lacks a criterion or NFR that needs it; preference-labeled decisions are called out in §4.

| Acceptance criterion | Module(s) that enforce it |
| --- | --- |
| AC-001 Create and persist coursework | Coursework Manager, Persistence Store, Web UI |
| AC-002 Edit / delete / cascade confirm | Coursework Manager, Persistence Store, Web UI |
| AC-003 Manage subtasks | Coursework Manager, Persistence Store, Web UI |
| AC-004 Schedule and reschedule session | Schedule Manager, Conflict Detector, Persistence Store, Web UI |
| AC-005 Reject overlapping session | Conflict Detector, Schedule Manager, Web UI (no Persistence Store write) |
| AC-006 Adjacent OK; invalid time order rejected | Conflict Detector (adjacency), Schedule Manager (start before end), Web UI |
| AC-007 Upcoming, overdue, filters | Deadline Tracker, Coursework Manager, Web UI |
| AC-008 Status update reflected on dashboard | Coursework Manager (status write), Progress Aggregator (counts) |
| AC-009 Completed vs remaining counts | Progress Aggregator |
| AC-010 Record actual study time / reject ≤ 0 | Study-Time Recorder, Persistence Store, Web UI |
| AC-011 Planned vs actual for selected week | Progress Aggregator (uses Schedule Manager sessions and Study-Time Recorder records) |
| AC-012 Course/assignment link consistency | Schedule Manager (with Coursework Manager data), Web UI |

| Check | Result |
| --- | --- |
| Criterion with no home | None |
| Module no criterion/NFR needs | None — each module maps to FR/NFR/AC in §2 |
| Decision reason not tracing to spec | Only rows marked **preference** in §4 (React/Vite stack, Monday week start, title length caps, DST-as-browser-Date) |
