import { NotImplementedError, StudyTrackError } from "../errors";
import type {
  Assignment,
  AssignmentStatus,
  Course,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateSubtaskInput,
  DeletionPreview,
  PersistenceStore,
  Priority,
  Subtask,
  UpdateAssignmentInput,
  UpdateCourseInput,
  UpdateSubtaskInput,
} from "../types";

const PRIORITIES: readonly Priority[] = ["Low", "Medium", "High"];
const STATUSES: readonly AssignmentStatus[] = ["Not Started", "In Progress", "Completed"];

function newId(): string {
  return crypto.randomUUID();
}

export function createCourse(input: CreateCourseInput, store: PersistenceStore): Course {
  if (input.name === "") {
    throw new StudyTrackError("validation_error", "Required values must be provided.");
  }
  const data = store.load();
  const course: Course = { id: newId(), name: input.name };
  data.courses.push(course);
  store.save(data);
  return course;
}

export function listCourses(store: PersistenceStore): Course[] {
  return store.load().courses;
}

export function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
  store: PersistenceStore,
): Course {
  void courseId;
  void input;
  void store;
  throw new NotImplementedError("updateCourse");
}

export function previewDeleteCourse(courseId: string, store: PersistenceStore): DeletionPreview {
  void courseId;
  void store;
  throw new NotImplementedError("previewDeleteCourse");
}

export function deleteCourse(courseId: string, store: PersistenceStore): void {
  void courseId;
  void store;
  throw new NotImplementedError("deleteCourse");
}

export function createAssignment(
  input: CreateAssignmentInput,
  store: PersistenceStore,
): Assignment {
  if (input.courseId === "" || input.title === "" || input.deadline === "") {
    throw new StudyTrackError("validation_error", "Required values must be provided.");
  }
  if (!PRIORITIES.includes(input.priority)) {
    throw new StudyTrackError("invalid_priority", "Priority must be Low, Medium, or High.");
  }
  if (input.status !== undefined && !STATUSES.includes(input.status)) {
    throw new StudyTrackError(
      "invalid_status",
      "Status must be Not Started, In Progress, or Completed.",
    );
  }

  const data = store.load();
  const course = data.courses.find((item) => item.id === input.courseId);
  if (!course) {
    throw new StudyTrackError("not_found", "Record not found.");
  }

  const assignment: Assignment = {
    id: newId(),
    courseId: input.courseId,
    title: input.title,
    deadline: input.deadline,
    priority: input.priority,
    estimatedMinutes: input.estimatedMinutes,
    status: input.status ?? "Not Started",
  };
  data.assignments.push(assignment);
  store.save(data);
  return assignment;
}

export function listAssignments(store: PersistenceStore): Assignment[] {
  return store.load().assignments;
}

export function updateAssignment(
  assignmentId: string,
  input: UpdateAssignmentInput,
  store: PersistenceStore,
): Assignment {
  const data = store.load();
  const index = data.assignments.findIndex((item) => item.id === assignmentId);
  if (index < 0) {
    throw new StudyTrackError("not_found", "Record not found.");
  }

  if (input.title !== undefined && input.title === "") {
    throw new StudyTrackError("validation_error", "Required values must be provided.");
  }
  if (input.deadline !== undefined && input.deadline === "") {
    throw new StudyTrackError("validation_error", "Required values must be provided.");
  }
  if (input.priority !== undefined && !PRIORITIES.includes(input.priority)) {
    throw new StudyTrackError("invalid_priority", "Priority must be Low, Medium, or High.");
  }
  if (input.status !== undefined && !STATUSES.includes(input.status)) {
    throw new StudyTrackError(
      "invalid_status",
      "Status must be Not Started, In Progress, or Completed.",
    );
  }

  const current = data.assignments[index]!;
  const updated: Assignment = {
    ...current,
    title: input.title ?? current.title,
    deadline: input.deadline ?? current.deadline,
    priority: input.priority ?? current.priority,
    estimatedMinutes: input.estimatedMinutes ?? current.estimatedMinutes,
    status: input.status ?? current.status,
  };
  data.assignments[index] = updated;
  store.save(data);
  return updated;
}

export function previewDeleteAssignment(
  assignmentId: string,
  store: PersistenceStore,
): DeletionPreview {
  void assignmentId;
  void store;
  throw new NotImplementedError("previewDeleteAssignment");
}

export function deleteAssignment(assignmentId: string, store: PersistenceStore): void {
  void assignmentId;
  void store;
  throw new NotImplementedError("deleteAssignment");
}

export function createSubtask(input: CreateSubtaskInput, store: PersistenceStore): Subtask {
  void input;
  void store;
  throw new NotImplementedError("createSubtask");
}

export function listSubtasks(assignmentId: string, store: PersistenceStore): Subtask[] {
  void assignmentId;
  void store;
  throw new NotImplementedError("listSubtasks");
}

export function updateSubtask(
  subtaskId: string,
  input: UpdateSubtaskInput,
  store: PersistenceStore,
): Subtask {
  void subtaskId;
  void input;
  void store;
  throw new NotImplementedError("updateSubtask");
}

export function deleteSubtask(subtaskId: string, store: PersistenceStore): void {
  void subtaskId;
  void store;
  throw new NotImplementedError("deleteSubtask");
}
