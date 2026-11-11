import { expect } from "vitest";
import { createMemoryStore, StudyTrackError } from "../src/index";
import type { Clock, ErrorCode, PersistenceStore, StudySession } from "../src/index";

export const WEEK = "2026-10-26";

export const MSG = {
  conflict: "This session overlaps an existing study session.",
  time: "End time must be later than start time.",
  duration: "Duration must be greater than zero.",
  mismatch: "Choose a matching course or assignment.",
  required: "Required values must be provided.",
  status: "Status must be Not Started, In Progress, or Completed.",
  priority: "Priority must be Low, Medium, or High.",
  notFound: "Record not found.",
} as const;

export function freshStore(): PersistenceStore {
  return createMemoryStore();
}

export function clockAt(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
): Clock {
  return {
    now() {
      return new Date(year, monthIndex, day, hour, minute, 0, 0);
    },
  };
}

export function expectFailure(run: () => unknown, code: ErrorCode, message: string): void {
  let caught: unknown;
  try {
    run();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(StudyTrackError);
  const failure = caught as StudyTrackError;
  expect(failure.code).toBe(code);
  expect(failure.message).toBe(message);
}

export function sessionKeys(sessions: StudySession[]): string[] {
  return sessions.map((session) => `${session.date} ${session.startTime}-${session.endTime}`).sort();
}

export function titlesOf(items: { title: string }[]): string[] {
  return items.map((item) => item.title).sort();
}

export function byTitle<T extends { title: string }>(items: T[], title: string): T {
  const found = items.find((item) => item.title === title);
  expect(found, title).toBeDefined();
  return found as T;
}
