export type ErrorCode =
  | "validation_error"
  | "invalid_time_range"
  | "schedule_conflict"
  | "course_assignment_mismatch"
  | "invalid_duration"
  | "invalid_status"
  | "invalid_priority"
  | "not_found";

export class StudyTrackError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "StudyTrackError";
    this.code = code;
  }
}

export class NotImplementedError extends Error {
  readonly code = "not_implemented" as const;

  constructor(functionName: string) {
    super(`not_implemented: ${functionName}`);
    this.name = "NotImplementedError";
  }
}
