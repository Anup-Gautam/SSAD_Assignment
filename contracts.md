# StudyTrack contracts

Agreed calling interface for the modules in `architecture.md`. Signatures use the names tests and the future UI call. No function body implements a rule yet: every domain function throws `NotImplementedError` (`code: "not_implemented"`, message `not_implemented: <function>`).

`architecture.md` specifies a browser single-page app and no backend. REST routes are not part of this contract. The section at the end lists that empty set.

## Shared rules

**Injected store.** Every function that reads or writes student data takes a `PersistenceStore`. Tests pass `createMemoryStore()`. The browser UI will pass `createLocalStorageStore()`. `detectOverlap` does not take a store and must not write.

**Injected clock.** Only `listTrackedAssignments` takes a `Clock`. `clock.now()` is read in the runtime's local timezone. Deadline comparisons use the local year, month, day, hour, and minute. Seconds are ignored.

**Local strings.**

- Date: `YYYY-MM-DD`
- Time of day: `HH:mm` (24-hour)
- Deadline: `YYYY-MM-DD HH:mm`

**Identifiers.** A successful create returns a new non-empty `id`, unique among records of that kind. Callers use that id. Tests do not depend on the id format. Updates keep the same id.

**Empty store.** The first `load()` is `{ courses: [], assignments: [], subtasks: [], sessions: [], studyTimeRecords: [] }`.

**Failure type.** Domain failures throw `StudyTrackError` with `code` and `message`. A failure does not call `save`. Existing records stay as they were. There is no stored draft of a rejected session; the caller still holds the input and can submit a corrected one or stop.

**Messages.**

| Code | Message |
| --- | --- |
| `validation_error` | `Required values must be provided.` |
| `validation_error` | `Week start must be a Monday.` |
| `invalid_time_range` | `End time must be later than start time.` |
| `schedule_conflict` | `This session overlaps an existing study session.` |
| `course_assignment_mismatch` | `Choose a matching course or assignment.` |
| `invalid_duration` | `Duration must be greater than zero.` |
| `invalid_status` | `Status must be Not Started, In Progress, or Completed.` |
| `invalid_priority` | `Priority must be Low, Medium, or High.` |
| `not_found` | `Record not found.` |

A required string is missing when it is `""`. Priority is exactly `Low`, `Medium`, or `High` (architecture decision). Editable status is exactly `Not Started`, `In Progress`, or `Completed`. `Overdue` is not a status.

**Week.** `listSessions` and `getProgressSummary` take the Monday date of a Monday-start week (architecture decision). The period is that Monday through the following Sunday, inclusive. The next Monday is outside. A `weekStartDate` that is not a Monday fails with `validation_error` / `Week start must be a Monday.`

**Check order for create and reschedule of a session.**

1. Required fields (`validation_error`).
2. End time strictly after start time on that date (`invalid_time_range`).
3. The course exists. If `assignmentId` is non-null, the assignment exists (`not_found`).
4. If `assignmentId` is non-null, `assignment.courseId` equals the session's `courseId` (`course_assignment_mismatch`).
5. Overlap against other saved sessions (`schedule_conflict`). Reschedule does not compare the session with itself.
6. Save.

**Check order for recording study time.**

1. Required fields (`validation_error`).
2. `durationMinutes > 0` (`invalid_duration`).
3. The assignment exists (`not_found`).
4. Save.

**Deletion.** `previewDeleteCourse` and `previewDeleteAssignment` do not write. They are the confirmation warning. `deleteCourse` and `deleteAssignment` perform the delete and are called only after the student confirms. Cancel means not calling delete. Dependent labels:

- assignment: its title
- subtask: its title
- session: `YYYY-MM-DD HH:mm-HH:mm`
- study-time record: `YYYY-MM-DD <durationMinutes> minutes`

`deleteCourse` removes that course, its assignments, their subtasks, sessions with that `courseId` or with one of those assignments, and study-time records for those assignments. `deleteAssignment` removes that assignment, its subtasks, sessions with that `assignmentId`, and its study-time records. The course remains, including sessions linked only to the course. `deleteSubtask` and `deleteSession` remove only that one record.

## Persistence Store

Browser key for `createLocalStorageStore`: `studytrack.v1`, JSON `StudyTrackData`. A missing key loads as the empty store. The optional `storage` argument defaults to the browser `localStorage`.

### createMemoryStore

- Signature: `createMemoryStore(): PersistenceStore`
- Success: returns a store whose saved state starts empty and lives in the object.
- Fails: `load` and `save` throw `NotImplementedError` in this skeleton. The implemented store does not throw for a well-typed value.
- Spec: Operational Rule 1; NFR-001; NFR-002. In-process stand-in for the same load/save contract, so tests can see that a rejected call wrote nothing.
- Injected: none.

### createLocalStorageStore

- Signature: `createLocalStorageStore(storage?: Storage): PersistenceStore`
- Success: same load/save contract, persisted under `studytrack.v1`.
- Fails: same as `createMemoryStore` in this skeleton.
- Spec: Operational Rule 1; NFR-001; NFR-002; AC-001; AC-010. Architecture persistence decision.
- Injected: `storage`, defaulting to browser `localStorage`.

### PersistenceStore.load

- Signature: `load(): StudyTrackData`
- Success: the last saved state, or the empty store.
- Fails: no domain error for an empty store.
- Spec: NFR-001. This is the read the UI does after a page reload.
- Injected: the store's own storage.

### PersistenceStore.save

- Signature: `save(data: StudyTrackData): void`
- Success: replaces the saved state. Domain functions call this only after validation succeeds.
- Fails: not called when a domain function fails.
- Spec: Operational Rule 1; NFR-001; NFR-002.
- Injected: the store's own storage.

## Coursework Manager

### createCourse

- Signature: `createCourse(input: { name: string }, store: PersistenceStore): Course`
- Success: `{ id, name }` saved. `listCourses` and `load().courses` include it.
- Fails: `validation_error` if `name` is empty. Nothing is saved.
- Spec: FR-001; Operational Rule 1; AC-001.
- Injected: `store`.

### listCourses

- Signature: `listCourses(store: PersistenceStore): Course[]`
- Success: every saved course. Order is not significant.
- Fails: does not fail when the list is empty.
- Spec: FR-001 view; AC-001; AC-002.
- Injected: `store`.

### updateCourse

- Signature: `updateCourse(courseId: string, input: { name: string }, store: PersistenceStore): Course`
- Success: same `id`, new `name`. Other records unchanged.
- Fails: `not_found` if the id is unknown. `validation_error` if `name` is empty. Stored data unchanged.
- Spec: FR-001 edit courses; Operational Rule 1.
- Injected: `store`.

### previewDeleteCourse

- Signature: `previewDeleteCourse(courseId: string, store: PersistenceStore): DeletionPreview`
- Success: `{ targetKind: "course", targetId, targetLabel: course.name, dependents }`. `dependents` lists assignments in the course, their subtasks, linked sessions, and study-time records for those assignments. Nothing is deleted.
- Fails: `not_found` if the id is unknown. Stored data unchanged.
- Spec: FR-001; Operational Rule 7; AC-002; NFR-005.
- Injected: `store`.

### deleteCourse

- Signature: `deleteCourse(courseId: string, store: PersistenceStore): void`
- Success: the course and the dependent records defined above are gone from `load()` and from the list functions.
- Fails: `not_found` if the id is unknown. Stored data unchanged.
- Spec: FR-001; Operational Rule 7; AC-002.
- Injected: `store`.

### createAssignment

- Signature: `createAssignment(input: { courseId: string, title: string, deadline: string, priority: Priority, estimatedMinutes: number, status?: AssignmentStatus }, store: PersistenceStore): Assignment`
- Success: saved assignment. Omitted `status` becomes `Not Started`. A provided valid status is stored. Returned object includes `id`, `courseId`, `title`, `deadline`, `priority`, `estimatedMinutes`, and `status`.
- Fails: `validation_error` if `title`, `deadline`, or `courseId` is empty. `invalid_priority` if priority is outside `Low` | `Medium` | `High`. `invalid_status` if `status` is present and not one of the three editable statuses. `not_found` if `courseId` is unknown. Nothing is saved.
- Spec: FR-001; Operational Rule 1; Operational Rule 2; AC-001. Priority set is the architecture decision.
- Injected: `store`.

### listAssignments

- Signature: `listAssignments(store: PersistenceStore): Assignment[]`
- Success: every saved assignment, unfiltered. Order is not significant.
- Fails: does not fail when the list is empty.
- Spec: FR-001 view; AC-001; AC-002.
- Injected: `store`.

### updateAssignment

- Signature: `updateAssignment(assignmentId: string, input: { title?: string, deadline?: string, priority?: Priority, estimatedMinutes?: number, status?: AssignmentStatus }, store: PersistenceStore): Assignment`
- Success: same `id`. Only provided fields change. Status may move among `Not Started`, `In Progress`, and `Completed`, including Completed back to In Progress.
- Fails: `not_found` if the id is unknown. `invalid_priority`, `invalid_status`, or `validation_error` (empty `title` or `deadline` when that field is provided) for a bad field. Stored data unchanged, including status.
- Spec: FR-001; FR-006; Operational Rule 2; AC-002; AC-008.
- Injected: `store`.

### previewDeleteAssignment

- Signature: `previewDeleteAssignment(assignmentId: string, store: PersistenceStore): DeletionPreview`
- Success: `{ targetKind: "assignment", targetId, targetLabel: title, dependents }`. Dependents are its subtasks, sessions with that `assignmentId`, and its study-time records. Course-only sessions are not dependents. Nothing is deleted.
- Fails: `not_found` if the id is unknown. Stored data unchanged.
- Spec: FR-001; Operational Rule 7; AC-002; NFR-005.
- Injected: `store`.

### deleteAssignment

- Signature: `deleteAssignment(assignmentId: string, store: PersistenceStore): void`
- Success: the assignment and the dependents above are removed. The course remains.
- Fails: `not_found` if the id is unknown. Stored data unchanged.
- Spec: FR-001; Operational Rule 7.
- Injected: `store`.

### createSubtask

- Signature: `createSubtask(input: { assignmentId: string, title: string }, store: PersistenceStore): Subtask`
- Success: `{ id, assignmentId, title }` saved. Subtasks have no status.
- Fails: `validation_error` if `title` or `assignmentId` is empty. `not_found` if the assignment does not exist. Nothing is saved.
- Spec: FR-002; Operational Rule 1; AC-003. Architecture: title and parent only.
- Injected: `store`.

### listSubtasks

- Signature: `listSubtasks(assignmentId: string, store: PersistenceStore): Subtask[]`
- Success: subtasks whose `assignmentId` matches. Order is not significant. An existing assignment with no subtasks returns `[]`.
- Fails: `not_found` if the assignment does not exist.
- Spec: FR-002 view; AC-003.
- Injected: `store`.

### updateSubtask

- Signature: `updateSubtask(subtaskId: string, input: { title: string }, store: PersistenceStore): Subtask`
- Success: same `id` and `assignmentId`, new `title`.
- Fails: `not_found` if the id is unknown. `validation_error` if `title` is empty. Stored data unchanged.
- Spec: FR-002; AC-003.
- Injected: `store`.

### deleteSubtask

- Signature: `deleteSubtask(subtaskId: string, store: PersistenceStore): void`
- Success: that subtask is gone. The assignment remains.
- Fails: `not_found` if the id is unknown. Stored data unchanged.
- Spec: FR-002; Operational Rule 7; AC-003.
- Injected: `store`.

## Schedule Manager

Session duration in minutes is the end minute-of-day minus the start minute-of-day. There is no second date, so a session cannot cross midnight (architecture decision). `assignmentId` omitted or `null` links the session to the course only.

### createSession

- Signature: `createSession(input: { courseId: string, assignmentId?: string | null, date: string, startTime: string, endTime: string }, store: PersistenceStore): StudySession`
- Success: saved session `{ id, courseId, assignmentId: string | null, date, startTime, endTime }`. It appears in `listSessions` for the Monday week that contains `date`.
- Fails: see the session check order. Nothing is saved. The input is not stored.
- Spec: FR-003; FR-004; Operational Rules 3 and 4; AC-004; AC-005; AC-006; AC-012.
- Injected: `store`. Uses `detectOverlap` before save. No clock.

### listSessions

- Signature: `listSessions(weekStartDate: string, store: PersistenceStore): StudySession[]`
- Success: saved sessions whose `date` is inside that Monday-start week. Order is not significant. An empty week returns `[]`.
- Fails: `validation_error` / `Week start must be a Monday.` when `weekStartDate` is not a Monday.
- Spec: FR-003 view; AC-004; AC-005.
- Injected: `store`.

### rescheduleSession

- Signature: `rescheduleSession(sessionId: string, input: { date?: string, startTime?: string, endTime?: string, courseId?: string, assignmentId?: string | null }, store: PersistenceStore): StudySession`
- Success: same `id`. Omitted fields stay. The previous time is no longer stored.
- Fails: `not_found` if the session id is unknown, then the same checks as create against the merged session. On failure the saved session stays at its previous values. No second session is created.
- Spec: FR-003; FR-004; Operational Rules 3 and 4; AC-004.
- Injected: `store`. Uses `detectOverlap`, excluding this session's id. No clock.

### deleteSession

- Signature: `deleteSession(sessionId: string, store: PersistenceStore): void`
- Success: that session is gone. Courses, assignments, and study-time records remain.
- Fails: `not_found` if the id is unknown. Stored data unchanged.
- Spec: FR-003; Operational Rule 7.
- Injected: `store`.

## Conflict Detector

### detectOverlap

- Signature: `detectOverlap(proposed: { id?: string, date: string, startTime: string, endTime: string }, existing: { id?: string, date: string, startTime: string, endTime: string }[]): { overlap: boolean, conflictingSessionIds: string[] }`
- Success: `overlap` is true when some existing interval has the same `date` and `proposed.start < existing.end` and `existing.start < proposed.end`, using minutes of that day. Endpoint contact is not an overlap. A different date is not an overlap. `conflictingSessionIds` lists the `id` values of overlapping existing intervals that have an id. If `proposed` end is not after `proposed` start, the result is `{ overlap: false, conflictingSessionIds: [] }` and this function does not throw.
- Fails: this function does not throw `StudyTrackError` and does not write.
- Spec: FR-004; Operational Rule 3; AC-005; AC-006.
- Injected: none.

## Deadline Tracker

### listTrackedAssignments

- Signature: `listTrackedAssignments(filter: { courseId?: string, priority?: Priority }, clock: Clock, store: PersistenceStore): TrackedAssignment[]`
- Success: one item per assignment that matches every provided filter field (course and priority are AND). Omitted filter fields do not constrain. Each item is `{ id, courseId, courseName, title, deadline, priority, status, estimatedMinutes, overdue, upcoming }`.
  - `overdue` is true only when `status !== "Completed"` and the deadline's local minute is earlier than `clock.now()`'s local minute.
  - `upcoming` is true only when `status !== "Completed"` and the deadline's local minute is greater than or equal to the clock's local minute.
  - A completed assignment has both flags false.
  - A filter that matches nothing returns `[]` and does not throw.
  - Order is not significant.
- Fails: does not fail for an empty match. `invalid_priority` is not used here; a filter uses the `Priority` type.
- Spec: FR-005; Operational Rules 2 and 6; AC-007; NFR-003.
- Injected: `clock`, `store`.

## Study-Time Recorder

Actual minutes come only from these records. Session length is not copied into a study-time record.

### recordStudyTime

- Signature: `recordStudyTime(input: { assignmentId: string, date: string, durationMinutes: number }, store: PersistenceStore): StudyTimeRecord`
- Success: `{ id, assignmentId, date, durationMinutes }` saved. Any finite number greater than zero is accepted. The record is still in `load()` after a later read.
- Fails: `validation_error` if `assignmentId` or `date` is empty or `durationMinutes` is missing. `invalid_duration` if `durationMinutes` is not greater than zero (`0` and negative values). `not_found` if the assignment does not exist. Nothing is saved.
- Spec: FR-007; Operational Rule 5; AC-010; NFR-001; NFR-002.
- Injected: `store`. No clock. The student supplies `date`.

### listStudyTimeRecords

- Signature: `listStudyTimeRecords(filter: { assignmentId?: string } | undefined, store: PersistenceStore): StudyTimeRecord[]`
- Success: saved records. When `assignmentId` is set, only that assignment's records. `undefined` returns all. Order is not significant. No records returns `[]`.
- Fails: does not fail when the list is empty.
- Spec: FR-007 view; AC-010.
- Injected: `store`.

## Progress Aggregator

### getProgressSummary

- Signature: `getProgressSummary(weekStartDate: string, store: PersistenceStore): ProgressSummary`
- Success:
  - `completedCount`: assignments whose status is `Completed`. Subtasks are not counted. The count is not limited to the week.
  - `remainingCount`: assignments whose status is `Not Started` or `In Progress`.
  - `plannedMinutes`: sum of saved session durations whose `date` falls in the week. Rejected sessions contribute nothing.
  - `actualMinutes`: sum of saved study-time `durationMinutes` whose `date` falls in the week. Sessions do not contribute.
  - `actualMinusPlannedMinutes`: `actualMinutes - plannedMinutes`. Negative means actual is less than planned.
  - `unit`: `"minutes"`.
  - `comparisonLabel`: `"study-time information"`.
- Fails: `validation_error` / `Week start must be a Monday.` when `weekStartDate` is not a Monday.
- Spec: FR-006; FR-008; FR-007; Operational Rules 5 and 6; NFR-004; NFR-009; AC-008; AC-009; AC-011.
- Injected: `store`. The week is the argument, not a clock.

## Web UI

The pages are the presentation entry points from `architecture.md`. They collect input, call the functions above, and show `StudyTrackError.message` for a rejection, including keeping a rejected session's input on screen. This skeleton only renders the three views so the Vite app can start. The components do not call domain functions and do not throw.

| Component | Intended calls | Spec |
| --- | --- | --- |
| `CourseworkPage(): JSX.Element` | Coursework Manager | FR-001; FR-002; AC-001; AC-002; AC-003; NFR-008 |
| `WeeklyCalendarPage(): JSX.Element` | Schedule Manager | FR-003; FR-004; AC-004; AC-005; AC-006; AC-012; NFR-008 |
| `ProgressPage(): JSX.Element` | Deadline Tracker, Study-Time Recorder, Progress Aggregator | FR-005; FR-006; FR-007; FR-008; AC-007 through AC-011; NFR-008 |

Injected when wired: `createLocalStorageStore()` and a clock `{ now: () => new Date() }` for `listTrackedAssignments`. Neither is wired in the skeleton.

## Requirement entry points

| Requirement | Entry points |
| --- | --- |
| FR-001 | `createCourse`, `listCourses`, `updateCourse`, `previewDeleteCourse`, `deleteCourse`, `createAssignment`, `listAssignments`, `updateAssignment`, `previewDeleteAssignment`, `deleteAssignment` |
| FR-002 | `createSubtask`, `listSubtasks`, `updateSubtask`, `deleteSubtask` |
| FR-003 | `createSession`, `listSessions`, `rescheduleSession`, `deleteSession` |
| FR-004 | `detectOverlap`, called by `createSession` and `rescheduleSession` |
| FR-005 | `listTrackedAssignments` |
| FR-006 | `updateAssignment`, `getProgressSummary` |
| FR-007 | `recordStudyTime`, `listStudyTimeRecords` |
| FR-008 | `getProgressSummary` |
| NFR-001 | `PersistenceStore.load`, `PersistenceStore.save`, successful creates |
| NFR-002 | failure paths above, which do not save |
| NFR-008 | `CourseworkPage`, `WeeklyCalendarPage`, `ProgressPage` |

No other public domain functions are part of this contract.

## REST APIs

None.

`architecture.md` §1 and §5 require a browser app with `localStorage` and no server. Adding HTTP routes would add a module the architecture does not list. The runnable app is the Vite development server, which serves the page shell. It does not expose JSON routes. Domain calls that are not implemented throw `NotImplementedError` in process; they do not return HTTP 501.
