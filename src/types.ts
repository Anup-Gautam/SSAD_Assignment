export type Priority = "Low" | "Medium" | "High";

export type AssignmentStatus = "Not Started" | "In Progress" | "Completed";

export interface Course {
  id: string;
  name: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  deadline: string;
  priority: Priority;
  estimatedMinutes: number;
  status: AssignmentStatus;
}

export interface Subtask {
  id: string;
  assignmentId: string;
  title: string;
}

export interface StudySession {
  id: string;
  courseId: string;
  assignmentId: string | null;
  date: string;
  startTime: string;
  endTime: string;
}

export interface StudyTimeRecord {
  id: string;
  assignmentId: string;
  date: string;
  durationMinutes: number;
}

export interface StudyTrackData {
  courses: Course[];
  assignments: Assignment[];
  subtasks: Subtask[];
  sessions: StudySession[];
  studyTimeRecords: StudyTimeRecord[];
}

export interface DeletionDependent {
  kind: "assignment" | "subtask" | "session" | "studyTimeRecord";
  id: string;
  label: string;
}

export interface DeletionPreview {
  targetKind: "course" | "assignment";
  targetId: string;
  targetLabel: string;
  dependents: DeletionDependent[];
}

export interface TrackedAssignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  deadline: string;
  priority: Priority;
  status: AssignmentStatus;
  estimatedMinutes: number;
  overdue: boolean;
  upcoming: boolean;
}

export interface ProgressSummary {
  completedCount: number;
  remainingCount: number;
  plannedMinutes: number;
  actualMinutes: number;
  actualMinusPlannedMinutes: number;
  unit: "minutes";
  comparisonLabel: "study-time information";
}

export interface SessionInterval {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface OverlapResult {
  overlap: boolean;
  conflictingSessionIds: string[];
}

export interface Clock {
  now(): Date;
}

export interface PersistenceStore {
  load(): StudyTrackData;
  save(data: StudyTrackData): void;
}

export interface CreateCourseInput {
  name: string;
}

export interface UpdateCourseInput {
  name: string;
}

export interface CreateAssignmentInput {
  courseId: string;
  title: string;
  deadline: string;
  priority: Priority;
  estimatedMinutes: number;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentInput {
  title?: string;
  deadline?: string;
  priority?: Priority;
  estimatedMinutes?: number;
  status?: AssignmentStatus;
}

export interface CreateSubtaskInput {
  assignmentId: string;
  title: string;
}

export interface UpdateSubtaskInput {
  title: string;
}

export interface CreateSessionInput {
  courseId: string;
  assignmentId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
}

export interface RescheduleSessionInput {
  date?: string;
  startTime?: string;
  endTime?: string;
  courseId?: string;
  assignmentId?: string | null;
}

export interface AssignmentFilter {
  courseId?: string;
  priority?: Priority;
}

export interface RecordStudyTimeInput {
  assignmentId: string;
  date: string;
  durationMinutes: number;
}

export interface StudyTimeFilter {
  assignmentId?: string;
}
