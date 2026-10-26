# Description

StudyTrack is a standalone web application for university students to organize coursework and plan study time in one place. A student manually maintains courses, assignments, and subtasks; schedules study sessions on a weekly calendar; checks for time conflicts; tracks upcoming and overdue work; records actual study time; and reviews coursework progress and planned versus actual study time. The application focuses on individual academic planning, not university registration, grading, assignment submission, or instructor communication. The first version has one student user, stores their entered information persistently, and does not integrate with Canvas, Google Calendar, email, or other external systems.

# Goals

1. **G2 - Keep Coursework Organized:** Give students a structured view of courses, assignments, deadlines, priorities, estimated work time, statuses, and subtasks.
2. **G3 - Plan Study Time:** Let students build and adjust a weekly study schedule while preventing conflicting sessions.
3. **G4 - Complete Coursework on Time:** Help students find upcoming and overdue assignments and decide what needs attention based on course and priority.
4. **G5 - Monitor Academic Progress:** Show completed and remaining work and compare scheduled study time with recorded actual study time.

Together these support the overarching Project 1 goal, **G1 - Manage Coursework and Study Time Effectively**.

# Domain Model

## Actors

- **Student:** The sole user in the first version. Enters and manages coursework, schedules study sessions, records study time, and reviews progress.
- **StudyTrack:** The application that stores student-entered data, checks schedule conflicts, identifies deadlines and overdue work, and produces progress summaries. This is the system, not a second human actor.

## Objects

- **Course:** A student-created academic subject that groups assignments.
- **Coursework Item:** General term for work tracked in the application; assignments are coursework items.
- **Assignment:** Work belonging to a course, with a title, deadline, priority, estimated completion time, and status. It may contain subtasks.
- **Subtask:** A smaller activity belonging to one assignment.
- **Assignment Status:** An assignment's progress state: `Not Started`, `In Progress`, or `Completed`. `Overdue` is a derived condition for unfinished work past its deadline (see Rules below).
- **Priority Level:** A student-assigned indicator of assignment importance or urgency.
- **Study Session:** A scheduled period with a date, start time, end time, and associated course or assignment.
- **Weekly Schedule:** Calendar view containing the student's study sessions and coursework deadlines for a selected week.
- **Study-Time Record:** Actual time spent on a coursework item, entered by the student.
- **Progress Summary:** Aggregated assignment status, upcoming/overdue work, and planned versus actual study time; displayed on the progress dashboard.

### Relationships

- A Student manages Courses, Assignments, Study Sessions, Study-Time Records, and a Weekly Schedule.
- A Course has Assignments; an Assignment belongs to one Course and may have multiple Subtasks.
- A Study Session is linked to a Course or an Assignment. An assignment-linked session is also associated with that assignment's Course.
- A Weekly Schedule contains Study Sessions and displays relevant deadlines.
- A Study-Time Record is associated with a coursework item; the Progress Summary aggregates coursework and study-time information.

### Operational Rules

The following clarify implementation details not fully specified in Project 1. They are included to make acceptance tests reproducible while remaining within the original scope.

1. **Input and persistence:** Required values must be provided before a record is saved. Successful changes remain available after the page is reloaded. A failed operation does not change existing stored data.
2. **Assignment status:** New assignments start as `Not Started` unless another valid status is entered. The student can change status to `In Progress` or `Completed`, and can reopen completed assignments as `In Progress`. An unfinished assignment is considered **overdue** when its deadline is earlier than the current local date and time. `Overdue` is displayed as an indicator, not as a replacement for the editable progress status.
3. **Scheduling:** A Study Session must have a start time earlier than its end time. Sessions use the date and local time displayed in StudyTrack. Two sessions overlap when `new.start < existing.end` and `existing.start < new.end` on the same calendar timeline. Sessions that only touch at their endpoints do not overlap. Conflicting new or rescheduled sessions cannot be saved; the form stays editable and shows a conflict message.
4. **Course/assignment consistency:** If a session references an assignment, the assignment must belong to the selected course. A session may instead reference a course without a particular assignment.
5. **Time measurements:** Store planned and actual study durations in minutes. Planned duration comes from saved Study Sessions; actual duration comes only from student-entered Study-Time Records. Do not infer actual study time from elapsed calendar time. A recorded duration must be greater than zero.
6. **Filtering and calculations:** Course and priority filters apply to the displayed assignment list. Completed assignments are not overdue. The dashboard counts assignments, not subtasks, in assignment totals. Planned and actual study-time comparisons must use the same selected reporting period and display the units.
7. **Deletion:** The student can remove a course, assignment, subtask, or study session. When a course or assignment has dependent records, the application must show which records will be affected and require confirmation before deletion. Canceling preserves them; confirming deletes the selected item and its dependent records.

# Functional Requirements

## Coursework Management

**FR-001: Manage Courses and Assignments (MVP; G2)**  
As a student, I want to add, view, edit, and delete courses and assignments, including assignment deadlines, priorities, estimated completion times, and status, so that I can keep my coursework organized.

**FR-002: Break Assignments into Subtasks (G2)**  
As a student, I want to add, view, edit, and delete smaller subtasks within an assignment so that I can manage large assignments in smaller steps.

## Weekly Study Planning

**FR-003: Schedule and Reschedule Study Sessions (MVP; G3)**  
As a student, I want to create, view, reschedule, and delete study sessions linked to courses or assignments on a weekly calendar so that I can plan my study time effectively.

**FR-004: Detect Study Session Conflicts (G3)**  
The system must check new and rescheduled study sessions against existing sessions before saving. If a proposed session overlaps, it must not be saved, and the student must receive a conflict message and be able to correct or cancel the proposal.

## Deadlines and Priorities

**FR-005: Track Deadlines and Filter Assignments (MVP; G4)**  
As a student, I want to view upcoming and overdue assignments and filter them by course or priority so that I can identify work that needs attention and complete coursework on time.

## Progress Monitoring

**FR-006: Update and View Coursework Progress (G5)**  
As a student, I want to update assignment status and see completed and remaining assignments in a progress dashboard so that I can monitor my academic progress.

**FR-007: Record Actual Study Time (G5)**  
As a student, I want to record the actual time I spend studying for coursework so that I can monitor my study activity.

**FR-008: Compare Planned and Actual Study Time (G5)**  
The system must total scheduled study-session durations and actual study-time records for the same reporting period and show both values in the progress dashboard so the student can compare them.

# Acceptance Criteria

Each scenario has a unique ID and references the functional requirements it checks. Scenarios beyond the original overlapping-session scenario were added to cover the remainder of the requirements.

## AC-001: Create and Persist Coursework (FR-001)

```gherkin
Feature: Manage courses and assignments
  Scenario: Create a course and an assignment
    Given the student is on the coursework page
    When the student creates a course named "Computer Science"
    And adds an assignment named "Project 1" to that course
    And sets a deadline of "2026-11-02 23:59", priority "High", and estimated time of 180 minutes
    And saves the assignment
    Then the assignment appears under "Computer Science" with the entered information
    And the assignment status is "Not Started"
    And the course and assignment remain visible after the page is reloaded
```

## AC-002: Edit and Delete Coursework (FR-001)

```gherkin
Feature: Maintain coursework
  Scenario: Edit an assignment and cancel deletion
    Given the course "Computer Science" contains an assignment named "Project 1"
    When the student edits its estimated completion time to 240 minutes
    And saves the assignment
    Then the assignment displays an estimated completion time of 240 minutes
    When the student requests deletion of "Project 1"
    And cancels the deletion confirmation
    Then "Project 1" remains in the course

  Scenario: Confirm deletion of a course with dependent records
    Given a course contains an assignment with a subtask and a linked study session
    When the student requests deletion of that course
    Then StudyTrack warns that the assignment, subtask, and session will also be deleted
    When the student confirms deletion
    Then the course and those dependent records are no longer present
```

## AC-003: Manage Subtasks (FR-002)

```gherkin
Feature: Break assignments into subtasks
  Scenario: Create and update subtasks
    Given the assignment "Project 1" exists
    When the student adds subtasks "Research" and "Draft"
    Then both subtasks appear under "Project 1"
    When the student renames "Draft" to "Write report"
    And deletes "Research"
    Then only "Write report" remains in the assignment's subtask list
```

## AC-004: Schedule and Reschedule a Session (FR-003, FR-004)

```gherkin
Feature: Weekly study planning
  Scenario: Create a nonconflicting session and reschedule it
    Given the student has a course named "Computer Science"
    And no study session exists on Monday from 18:00 to 19:00
    When the student creates a session for "Computer Science" on Monday from 18:00 to 19:00
    Then the saved session appears in the weekly calendar
    When the student changes that session to Monday from 19:00 to 20:00
    And saves the change
    Then the calendar shows the session from 19:00 to 20:00
    And the earlier 18:00 to 19:00 session no longer appears
```

## AC-005: Reject an Overlapping Session (FR-003, FR-004)

```gherkin
Feature: Schedule a study session without overlapping an existing session
  Scenario: Student attempts to schedule an overlapping study session
    Given the student has a study session scheduled from 18:00 to 19:00 on Monday
    And the student is viewing the weekly calendar
    When the student attempts to create another study session from 18:30 to 19:30 on Monday
    Then StudyTrack detects that the new session overlaps the existing session
    And StudyTrack does not add the conflicting session to the weekly schedule
    And StudyTrack displays a conflict message
    And the proposed session remains editable
    And the student can change its time and submit it again or cancel
```

## AC-006: Validate Time Boundaries (FR-003, FR-004)

```gherkin
Feature: Validate study-session times
  Scenario: Adjacent sessions do not conflict
    Given a session exists on Monday from 18:00 to 19:00
    When the student creates another session on Monday from 19:00 to 20:00
    Then the second session is saved without a conflict

  Scenario: End time is not after start time
    Given the student is creating a study session
    When the student submits a start time of 19:00 and an end time of 18:00 on the same date
    Then StudyTrack displays a time validation message
    And the session is not saved
```

## AC-007: Upcoming, Overdue, and Filtered Work (FR-005)

```gherkin
Feature: Track deadlines and priorities
  Scenario: Show and filter assignments
    Given the current local date and time is "2026-10-26 12:00"
    And "Essay" is an unfinished High priority assignment for "History" due "2026-10-25 23:59"
    And "Lab" is an unfinished Low priority assignment for "Science" due "2026-10-28 23:59"
    And "Quiz" is a completed High priority assignment for "History" due "2026-10-24 23:59"
    When the student opens the assignments view
    Then "Essay" is shown as overdue
    And "Lab" is shown as upcoming
    And "Quiz" is not shown as overdue
    When the student filters by course "History" and priority "High"
    Then "Essay" and "Quiz" appear in the filtered assignment list
    And "Lab" does not appear
```

## AC-008: Update Assignment Status (FR-001, FR-006)

```gherkin
Feature: Update coursework progress
  Scenario: Complete and reopen an assignment
    Given "Project 1" has status "Not Started"
    When the student changes its status to "In Progress"
    And then changes its status to "Completed"
    Then the dashboard counts "Project 1" as completed and not remaining
    When the student reopens "Project 1" as "In Progress"
    Then the dashboard counts it as remaining and not completed
```

## AC-009: Display Progress Summary (FR-006)

```gherkin
Feature: View coursework progress
  Scenario: Count completed and remaining assignments
    Given the student has three assignments
    And one assignment is "Completed"
    And two assignments are "In Progress" or "Not Started"
    When the student opens the progress dashboard
    Then the dashboard shows 1 completed assignment
    And the dashboard shows 2 remaining assignments
```

## AC-010: Record Actual Study Time (FR-007)

```gherkin
Feature: Record time spent studying
  Scenario: Save an actual study-time record
    Given the student has an assignment named "Project 1"
    When the student records 45 minutes of actual study time for "Project 1" on Monday
    Then the 45-minute record is saved under "Project 1"
    And it remains available after the page is reloaded

  Scenario: Reject a nonpositive duration
    Given the student is entering an actual study-time record
    When the student enters 0 minutes and tries to save
    Then StudyTrack displays a duration validation message
    And no study-time record is created
```

## AC-011: Compare Planned and Actual Time (FR-008, FR-007)

```gherkin
Feature: Compare planned and actual study time
  Scenario: Show time totals for the selected week
    Given the student has two saved sessions of 60 and 30 minutes during the selected week
    And has actual study-time records of 45 and 30 minutes during that week
    When the student opens the progress dashboard for that week
    Then the planned study time is shown as 90 minutes
    And the actual study time is shown as 75 minutes
    And the dashboard shows that actual study time is 15 minutes less than planned
    And the displayed comparison is labeled as study-time information, not a performance grade
```

## AC-012: Keep Session Links Consistent (FR-003)

```gherkin
Feature: Link study sessions to coursework
  Scenario: Reject a mismatched assignment and course
    Given "Project 1" belongs to the course "Computer Science"
    And the student is creating a session linked to "History"
    When the student selects "Project 1" as that session's assignment
    And attempts to save the session
    Then StudyTrack does not save the inconsistent session
    And StudyTrack asks the student to choose a matching course or assignment
```

## Traceability

| Requirement | Goal | Acceptance criteria |
| --- | --- | --- |
| FR-001 | G2 | AC-001, AC-002, AC-008 |
| FR-002 | G2 | AC-003 |
| FR-003 | G3 | AC-004, AC-005, AC-006, AC-012 |
| FR-004 | G3 | AC-004, AC-005, AC-006 |
| FR-005 | G4 | AC-007 |
| FR-006 | G5 | AC-008, AC-009 |
| FR-007 | G5 | AC-010, AC-011 |
| FR-008 | G5 | AC-011 |

## Scope and Decisions to Confirm

Project 1 leaves certain details open. They are deliberately not presented as established requirements here: exact priority choices (for example Low/Medium/High), maximum input lengths, account authentication approach for the single student, whether study sessions can cross midnight, handling of daylight-saving transitions, precise default calendar week start, and whether subtasks have independent completion status. These choices should be settled before implementation and can be added to this specification without expanding StudyTrack's core features.
