import { NotImplementedError } from "../errors";
import type {
  Assignment,
  Course,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateSubtaskInput,
  DeletionPreview,
  PersistenceStore,
  Subtask,
  UpdateAssignmentInput,
  UpdateCourseInput,
  UpdateSubtaskInput,
} from "../types";

export function createCourse(input: CreateCourseInput, store: PersistenceStore): Course {
  void input;
  void store;
  throw new NotImplementedError("createCourse");
}

export function listCourses(store: PersistenceStore): Course[] {
  void store;
  throw new NotImplementedError("listCourses");
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
  void input;
  void store;
  throw new NotImplementedError("createAssignment");
}

export function listAssignments(store: PersistenceStore): Assignment[] {
  void store;
  throw new NotImplementedError("listAssignments");
}

export function updateAssignment(
  assignmentId: string,
  input: UpdateAssignmentInput,
  store: PersistenceStore,
): Assignment {
  void assignmentId;
  void input;
  void store;
  throw new NotImplementedError("updateAssignment");
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
