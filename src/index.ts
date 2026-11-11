export { NotImplementedError, StudyTrackError } from "./errors";
export type { ErrorCode } from "./errors";

export {
  createCourse,
  createAssignment,
  createSubtask,
  deleteAssignment,
  deleteCourse,
  deleteSubtask,
  listAssignments,
  listCourses,
  listSubtasks,
  previewDeleteAssignment,
  previewDeleteCourse,
  updateAssignment,
  updateCourse,
  updateSubtask,
} from "./coursework/manager";

export { detectOverlap } from "./conflict/detector";
export { listTrackedAssignments } from "./deadline/tracker";
export { createLocalStorageStore, createMemoryStore } from "./persistence/store";
export { getProgressSummary } from "./progress/aggregator";
export {
  createSession,
  deleteSession,
  listSessions,
  rescheduleSession,
} from "./schedule/manager";
export { listStudyTimeRecords, recordStudyTime } from "./studyTime/recorder";

export type {
  Assignment,
  AssignmentFilter,
  AssignmentStatus,
  Clock,
  Course,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateSessionInput,
  CreateSubtaskInput,
  DeletionDependent,
  DeletionPreview,
  OverlapResult,
  PersistenceStore,
  Priority,
  ProgressSummary,
  RecordStudyTimeInput,
  RescheduleSessionInput,
  SessionInterval,
  StudySession,
  StudyTimeFilter,
  StudyTimeRecord,
  StudyTrackData,
  Subtask,
  TrackedAssignment,
  UpdateAssignmentInput,
  UpdateCourseInput,
  UpdateSubtaskInput,
} from "./types";
