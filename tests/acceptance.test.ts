import { expect, test } from "vitest";
import {
  createAssignment,
  createCourse,
  createSession,
  createSubtask,
  deleteCourse,
  deleteSubtask,
  getProgressSummary,
  listAssignments,
  listCourses,
  listSessions,
  listStudyTimeRecords,
  listSubtasks,
  listTrackedAssignments,
  previewDeleteAssignment,
  previewDeleteCourse,
  recordStudyTime,
  rescheduleSession,
  updateAssignment,
  updateSubtask,
} from "../src/index";
import type { AssignmentStatus } from "../src/index";
import { WEEK, MSG, byTitle, clockAt, expectFailure, freshStore, sessionKeys, titlesOf } from "./support";

test("test_AC001", () => {
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

  expect(course.id).not.toBe("");
  expect(course.name).toBe("Computer Science");
  expect(assignment.id).not.toBe("");
  expect(assignment.courseId).toBe(course.id);
  expect(assignment.title).toBe("Project 1");
  expect(assignment.deadline).toBe("2026-11-02 23:59");
  expect(assignment.priority).toBe("High");
  expect(assignment.estimatedMinutes).toBe(180);
  expect(assignment.status).toBe("Not Started");
  expect(listCourses(store)).toContainEqual(course);
  expect(listAssignments(store)).toContainEqual(assignment);

  const reloaded = store.load();
  expect(reloaded.courses).toContainEqual(course);
  expect(reloaded.assignments).toContainEqual(assignment);
});

test("test_AC002", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const created = createAssignment(
    {
      courseId: course.id,
      title: "Project 1",
      deadline: "2026-11-02 23:59",
      priority: "High",
      estimatedMinutes: 180,
    },
    store,
  );
  const updated = updateAssignment(created.id, { estimatedMinutes: 240 }, store);

  expect(updated).toEqual({
    id: created.id,
    courseId: course.id,
    title: "Project 1",
    deadline: "2026-11-02 23:59",
    priority: "High",
    estimatedMinutes: 240,
    status: "Not Started",
  });

  const preview = previewDeleteAssignment(created.id, store);
  expect(preview.targetKind).toBe("assignment");
  expect(preview.targetId).toBe(created.id);
  expect(preview.targetLabel).toBe("Project 1");
  expect(listAssignments(store)).toContainEqual(updated);
});

test("test_AC002_confirm", () => {
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
  const subtask = createSubtask({ assignmentId: assignment.id, title: "Readings" }, store);
  const session = createSession(
    {
      courseId: course.id,
      assignmentId: assignment.id,
      date: WEEK,
      startTime: "18:00",
      endTime: "19:00",
    },
    store,
  );

  const preview = previewDeleteCourse(course.id, store);
  expect(preview.targetKind).toBe("course");
  expect(preview.targetId).toBe(course.id);
  expect(preview.targetLabel).toBe("Computer Science");
  expect(preview.dependents).toHaveLength(3);
  expect(preview.dependents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: "assignment", id: assignment.id, label: "Project 1" }),
      expect.objectContaining({ kind: "subtask", id: subtask.id, label: "Readings" }),
      expect.objectContaining({ kind: "session", id: session.id, label: "2026-10-26 18:00-19:00" }),
    ]),
  );
  expect(listCourses(store)).toEqual([course]);
  expect(listAssignments(store)).toEqual([assignment]);
  expect(listSubtasks(assignment.id, store)).toEqual([subtask]);
  expect(sessionKeys(listSessions(WEEK, store))).toEqual(["2026-10-26 18:00-19:00"]);

  deleteCourse(course.id, store);

  const reloaded = store.load();
  expect(reloaded.courses).toEqual([]);
  expect(reloaded.assignments).toEqual([]);
  expect(reloaded.subtasks).toEqual([]);
  expect(reloaded.sessions).toEqual([]);
  expect(listCourses(store)).toEqual([]);
  expect(listAssignments(store)).toEqual([]);
  expectFailure(() => listSubtasks(assignment.id, store), "not_found", MSG.notFound);
});

test("test_AC003", () => {
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
  const research = createSubtask({ assignmentId: assignment.id, title: "Research" }, store);
  const draft = createSubtask({ assignmentId: assignment.id, title: "Draft" }, store);

  expect(titlesOf(listSubtasks(assignment.id, store))).toEqual(["Draft", "Research"]);

  const renamed = updateSubtask(draft.id, { title: "Write report" }, store);
  expect(renamed.id).toBe(draft.id);
  expect(renamed.assignmentId).toBe(assignment.id);
  expect(renamed.title).toBe("Write report");
  deleteSubtask(research.id, store);

  expect(listSubtasks(assignment.id, store)).toEqual([renamed]);
  expect(listAssignments(store)).toContainEqual(assignment);
});

test("test_AC004", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([]);

  const created = createSession(
    { courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" },
    store,
  );
  expect(created.assignmentId).toBeNull();
  expect(sessionKeys(listSessions(WEEK, store))).toEqual(["2026-10-26 18:00-19:00"]);

  const moved = rescheduleSession(created.id, { startTime: "19:00", endTime: "20:00" }, store);
  expect(moved.id).toBe(created.id);
  expect(moved.date).toBe(WEEK);
  expect(moved.startTime).toBe("19:00");
  expect(moved.endTime).toBe("20:00");
  expect(sessionKeys(listSessions(WEEK, store))).toEqual(["2026-10-26 19:00-20:00"]);
});

test("test_AC005", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  createSession({ courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" }, store);

  expectFailure(
    () =>
      createSession({ courseId: course.id, date: WEEK, startTime: "18:30", endTime: "19:30" }, store),
    "schedule_conflict",
    MSG.conflict,
  );
  expect(sessionKeys(listSessions(WEEK, store))).toEqual(["2026-10-26 18:00-19:00"]);

  expectFailure(
    () =>
      createSession({ courseId: course.id, date: WEEK, startTime: "18:59", endTime: "19:30" }, store),
    "schedule_conflict",
    MSG.conflict,
  );
  expect(sessionKeys(listSessions(WEEK, store))).toEqual(["2026-10-26 18:00-19:00"]);

  createSession({ courseId: course.id, date: WEEK, startTime: "19:00", endTime: "20:00" }, store);
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-26 19:00-20:00",
  ]);
});

test("test_AC006", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  createSession({ courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" }, store);
  createSession({ courseId: course.id, date: WEEK, startTime: "19:00", endTime: "20:00" }, store);
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-26 19:00-20:00",
  ]);

  expectFailure(
    () =>
      createSession({ courseId: course.id, date: WEEK, startTime: "19:00", endTime: "18:00" }, store),
    "invalid_time_range",
    MSG.time,
  );
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-26 19:00-20:00",
  ]);

  expectFailure(
    () =>
      createSession({ courseId: course.id, date: WEEK, startTime: "21:00", endTime: "21:00" }, store),
    "invalid_time_range",
    MSG.time,
  );
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-26 19:00-20:00",
  ]);

  createSession({ courseId: course.id, date: WEEK, startTime: "21:00", endTime: "21:01" }, store);
  expect(sessionKeys(listSessions(WEEK, store))).toEqual([
    "2026-10-26 18:00-19:00",
    "2026-10-26 19:00-20:00",
    "2026-10-26 21:00-21:01",
  ]);
});

test("test_AC007", () => {
  const store = freshStore();
  const clock = clockAt(2026, 9, 26, 12, 0);
  const history = createCourse({ name: "History" }, store);
  const science = createCourse({ name: "Science" }, store);
  createAssignment(
    {
      courseId: history.id,
      title: "Essay",
      deadline: "2026-10-25 23:59",
      priority: "High",
      estimatedMinutes: 60,
    },
    store,
  );
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
  createAssignment(
    {
      courseId: history.id,
      title: "Quiz",
      deadline: "2026-10-24 23:59",
      priority: "High",
      estimatedMinutes: 60,
      status: "Completed",
    },
    store,
  );
  createAssignment(
    {
      courseId: history.id,
      title: "Due minute before",
      deadline: "2026-10-26 11:59",
      priority: "Low",
      estimatedMinutes: 60,
    },
    store,
  );
  createAssignment(
    {
      courseId: history.id,
      title: "Due at clock",
      deadline: "2026-10-26 12:00",
      priority: "Low",
      estimatedMinutes: 60,
    },
    store,
  );

  const listed = listTrackedAssignments({}, clock, store);
  const essay = byTitle(listed, "Essay");
  const lab = byTitle(listed, "Lab");
  const quiz = byTitle(listed, "Quiz");
  expect(essay.overdue).toBe(true);
  expect(essay.upcoming).toBe(false);
  expect(essay.status).toBe("Not Started");
  expect(lab.overdue).toBe(false);
  expect(lab.upcoming).toBe(true);
  expect(quiz.overdue).toBe(false);
  expect(quiz.upcoming).toBe(false);
  expect(quiz.status).toBe("Completed");

  const justInside = byTitle(listed, "Due minute before");
  const justOutside = byTitle(listed, "Due at clock");
  expect(justInside.overdue).toBe(true);
  expect(justInside.upcoming).toBe(false);
  expect(justOutside.overdue).toBe(false);
  expect(justOutside.upcoming).toBe(true);

  const filtered = listTrackedAssignments({ courseId: history.id, priority: "High" }, clock, store);
  expect(titlesOf(filtered)).toEqual(["Essay", "Quiz"]);
  expect(titlesOf(filtered)).not.toContain("Lab");
});

test("test_AC008", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const created = createAssignment(
    {
      courseId: course.id,
      title: "Project 1",
      deadline: "2026-12-01 23:59",
      priority: "Medium",
      estimatedMinutes: 180,
    },
    store,
  );
  expect(created.status).toBe("Not Started");

  const inProgress = updateAssignment(created.id, { status: "In Progress" }, store);
  expect(inProgress.status).toBe("In Progress");
  expect(getProgressSummary(WEEK, store)).toMatchObject({
    completedCount: 0,
    remainingCount: 1,
    plannedMinutes: 0,
    actualMinutes: 0,
    actualMinusPlannedMinutes: 0,
    unit: "minutes",
  });

  const completed = updateAssignment(created.id, { status: "Completed" }, store);
  expect(completed.status).toBe("Completed");
  expect(getProgressSummary(WEEK, store)).toMatchObject({
    completedCount: 1,
    remainingCount: 0,
  });

  const reopened = updateAssignment(created.id, { status: "In Progress" }, store);
  expect(reopened.status).toBe("In Progress");
  expect(getProgressSummary(WEEK, store)).toMatchObject({
    completedCount: 0,
    remainingCount: 1,
  });

  expectFailure(
    () => updateAssignment(created.id, { status: "Overdue" as AssignmentStatus }, store),
    "invalid_status",
    MSG.status,
  );
  expect(listAssignments(store)[0]?.status).toBe("In Progress");
  expect(getProgressSummary(WEEK, store)).toMatchObject({
    completedCount: 0,
    remainingCount: 1,
  });
});

test("test_AC009", () => {
  const store = freshStore();
  const course = createCourse({ name: "Computer Science" }, store);
  const base = {
    courseId: course.id,
    deadline: "2026-12-01 23:59",
    priority: "Medium" as const,
    estimatedMinutes: 60,
  };
  createAssignment({ ...base, title: "Done", status: "Completed" }, store);
  const started = createAssignment({ ...base, title: "Started" }, store);
  updateAssignment(started.id, { status: "In Progress" }, store);
  createAssignment({ ...base, title: "Waiting" }, store);

  expect(getProgressSummary(WEEK, store)).toEqual({
    completedCount: 1,
    remainingCount: 2,
    plannedMinutes: 0,
    actualMinutes: 0,
    actualMinusPlannedMinutes: 0,
    unit: "minutes",
    comparisonLabel: "study-time information",
  });
});

test("test_AC010", () => {
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
  const record = recordStudyTime(
    { assignmentId: assignment.id, date: WEEK, durationMinutes: 45 },
    store,
  );

  expect(record.assignmentId).toBe(assignment.id);
  expect(record.date).toBe(WEEK);
  expect(record.durationMinutes).toBe(45);
  expect(record.id).not.toBe("");
  expect(listStudyTimeRecords({ assignmentId: assignment.id }, store)).toContainEqual(record);
  expect(store.load().studyTimeRecords).toContainEqual(record);
});

test("test_AC010_reject", () => {
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
  recordStudyTime({ assignmentId: assignment.id, date: WEEK, durationMinutes: 45 }, store);

  expectFailure(
    () => recordStudyTime({ assignmentId: assignment.id, date: WEEK, durationMinutes: 0 }, store),
    "invalid_duration",
    MSG.duration,
  );
  expect(listStudyTimeRecords(undefined, store).map((record) => record.durationMinutes)).toEqual([45]);

  expectFailure(
    () => recordStudyTime({ assignmentId: assignment.id, date: WEEK, durationMinutes: -1 }, store),
    "invalid_duration",
    MSG.duration,
  );
  expect(listStudyTimeRecords(undefined, store).map((record) => record.durationMinutes)).toEqual([45]);

  recordStudyTime({ assignmentId: assignment.id, date: WEEK, durationMinutes: 1 }, store);
  expect(
    listStudyTimeRecords(undefined, store)
      .map((record) => record.durationMinutes)
      .sort((left, right) => left - right),
  ).toEqual([1, 45]);
});

test("test_AC011", () => {
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
  createSession({ courseId: course.id, date: WEEK, startTime: "18:00", endTime: "19:00" }, store);
  createSession(
    { courseId: course.id, date: "2026-10-27", startTime: "18:00", endTime: "18:30" },
    store,
  );
  recordStudyTime({ assignmentId: assignment.id, date: WEEK, durationMinutes: 45 }, store);
  recordStudyTime({ assignmentId: assignment.id, date: "2026-10-27", durationMinutes: 30 }, store);

  expect(getProgressSummary(WEEK, store)).toEqual({
    completedCount: 0,
    remainingCount: 1,
    plannedMinutes: 90,
    actualMinutes: 75,
    actualMinusPlannedMinutes: -15,
    unit: "minutes",
    comparisonLabel: "study-time information",
  });
});

test("test_AC011_week_boundary", () => {
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
  createSession(
    { courseId: course.id, date: "2026-11-01", startTime: "10:00", endTime: "11:00" },
    store,
  );
  createSession(
    { courseId: course.id, date: "2026-11-02", startTime: "10:00", endTime: "11:00" },
    store,
  );
  recordStudyTime({ assignmentId: assignment.id, date: "2026-11-01", durationMinutes: 30 }, store);
  recordStudyTime({ assignmentId: assignment.id, date: "2026-11-02", durationMinutes: 45 }, store);

  expect(getProgressSummary(WEEK, store)).toEqual({
    completedCount: 0,
    remainingCount: 1,
    plannedMinutes: 60,
    actualMinutes: 30,
    actualMinusPlannedMinutes: -30,
    unit: "minutes",
    comparisonLabel: "study-time information",
  });
});

test("test_AC012", () => {
  const store = freshStore();
  const computerScience = createCourse({ name: "Computer Science" }, store);
  const history = createCourse({ name: "History" }, store);
  const assignment = createAssignment(
    {
      courseId: computerScience.id,
      title: "Project 1",
      deadline: "2026-11-02 23:59",
      priority: "High",
      estimatedMinutes: 180,
    },
    store,
  );

  expectFailure(
    () =>
      createSession(
        {
          courseId: history.id,
          assignmentId: assignment.id,
          date: WEEK,
          startTime: "18:00",
          endTime: "19:00",
        },
        store,
      ),
    "course_assignment_mismatch",
    MSG.mismatch,
  );
  expect(listSessions(WEEK, store)).toEqual([]);

  const saved = createSession(
    {
      courseId: computerScience.id,
      assignmentId: assignment.id,
      date: WEEK,
      startTime: "18:00",
      endTime: "19:00",
    },
    store,
  );
  expect(saved.courseId).toBe(computerScience.id);
  expect(saved.assignmentId).toBe(assignment.id);
  expect(listSessions(WEEK, store)).toEqual([saved]);
});
