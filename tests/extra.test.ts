import { expect, test } from "vitest";
import {
  createAssignment,
  createCourse,
  createSession,
  createSubtask,
  deleteSession,
  getProgressSummary,
  listAssignments,
  listCourses,
  listSessions,
  listTrackedAssignments,
  rescheduleSession,
  updateAssignment,
} from "../src/index";
import type { Priority } from "../src/index";
import { WEEK, MSG, clockAt, expectFailure, freshStore, sessionKeys } from "./support";

test("test_extra_different_dates", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  createSession({ courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" }, store);
  createSession(
    { courseId: course.id, date: "2026-10-27", startTime: "18:30", endTime: "19:30" },
    store,
  );

  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-27 18:30-19:30",
  ]);
});

test("test_extra_unknown_id", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const assignment = createAssignment(
    {
      courseId: course.id,
      title: "Project 1",
      deadline: "2026-11-02 23:59",
      priority: "High",
      estimatedMinutes: 180,
    },
    store,
  );

  expectFailure(
    () => updateAssignment("missing-assignment", { estimatedMinutes: 240 }, store),
    "not_found",
    MSG.notFound,
  );
  expect(listAssignments(store)).toEqual([assignment]);

  const updated = updateAssignment(assignment.id, { estimatedMinutes: 240 }, store);
  expect(updated.estimatedMinutes).toBe(240);
  expect(updated.id).toBe(assignment.id);
});

test("test_extra_reschedule_conflict", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const first = createSession(
    { courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" },
    store,
  );
  createSession({ courseId: course.id, date: WEEK, startTime: "20:00", endTime: "21:00" }, store);

  expectFailure(
    () => rescheduleSession(first.id, { startTime: "20:30", endTime: "21:30" }, store),
    "schedule_conflict",
    MSG.conflict,
  );
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-26 20:00-21:00",
  ]);

  const moved = rescheduleSession(first.id, { startTime: "19:00", endTime: "20:00" }, store);
  expect(moved.id).toBe(first.id);
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 19:00-20:00",
    "2026-10-26 20:00-21:00",
  ]);
});

test("test_extra_invalid_priority", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const fields = {
    courseId: course.id,
    title: "Project 1",
    deadline: "2026-11-02 23:59",
    estimatedMinutes: 180,
  };

  expectFailure(
    () => createAssignment({ ...fields, priority: "Urgent" as Priority }, store),
    "invalid_priority",
    MSG.priority,
  );
  expect(listAssignments(store)).toEqual([]);

  for (const priority of ["High", "Medium", "Low"] as const) {
    const saved = createAssignment({ ...fields, priority }, store);
    expect(saved.priority).toBe(priority);
    expect(saved.title).toBe("Project 1");
  }
  expect(listAssignments(store).map((assignment) => assignment.priority).sort()).toEqual([
    "High",
    "Low",
    "Medium",
  ]);
});

test("test_extra_missing_deadline", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const fields = {
    courseId: course.id,
    title: "Project 1",
    priority: "High" as const,
    estimatedMinutes: 180,
  };

  expectFailure(
    () => createAssignment({ ...fields, deadline: "" }, store),
    "validation_error",
    MSG.required,
  );
  expect(listAssignments(store)).toEqual([]);

  const saved = createAssignment({ ...fields, deadline: "2026-11-02 23:59" }, store);
  expect(saved.deadline).toBe("2026-11-02 23:59");
  expect(listAssignments(store)).toHaveLength(1);
});

test("test_extra_empty_filter", () => {
  const store = freshStore();
  const clock = clockAt(2026, 9, 26, 12, 0);
  const history = createCourse({ name: "History" }, store);
  const science = createCourse({ name: "Science" }, store);
  createAssignment(
    {
      courseId: science.id,
      title: "Lab",
      deadline: "2026-10-28 23:59",
      priority: "Low",
      estimatedMinutes: 60,
    },
    store,
  );

  expect(listTrackedAssignments({ courseId: history.id, priority: "High" }, clock, store)).toEqual([]);

  const matched = listTrackedAssignments({ courseId: science.id, priority: "Low" }, clock, store);
  expect(matched.map((item) => item.title)).toEqual(["Lab"]);
});

test("test_extra_subtasks_not_counted", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const assignment = createAssignment(
    {
      courseId: course.id,
      title: "Project 1",
      deadline: "2026-12-01 23:59",
      priority: "High",
      estimatedMinutes: 60,
    },
    store,
  );
  createSubtask({ assignmentId: assignment.id, title: "Research" }, store);
  createSubtask({ assignmentId: assignment.id, title: "Draft" }, store);

  const summary = getProgressSummary(WEEK, store);
  expect(summary.completedCount).toBe(0);
  expect(summary.remainingCount).toBe(1);
  expect(summary.plannedMinutes).toBe(0);
  expect(summary.actualMinutes).toBe(0);
  expect(summary.actualMinusPlannedMinutes).toBe(0);
  expect(summary.unit).toBe("minutes");
});

test("test_extra_actual_not_inferred", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  createSession({ courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" }, store);

  expect(getProgressSummary(WEEK, store)).toEqual({
    completedCount: 0,
    remainingCount: 0,
    plannedMinutes: 60,
    actualMinutes: 0,
    actualMinusPlannedMinutes: -60,
    unit: "minutes",
    comparisonLabel: "study-time information",
  });
});

test("test_extra_delete_session", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const session = createSession(
    { courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" },
    store,
  );

  deleteSession(session.id, store);

  expect(listSessions(WEEK, store)).toEqual([]);
  expect(listCourses(store)).toEqual([course]);
});
