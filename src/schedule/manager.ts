import { NotImplementedError } from "../errors";
import type {
  CreateSessionInput,
  PersistenceStore,
  RescheduleSessionInput,
  StudySession,
} from "../types";

export function createSession(
  input: CreateSessionInput,
  store: PersistenceStore,
): StudySession {
  void input;
  void store;
  throw new NotImplementedError("createSession");
}

export function listSessions(weekStartDate: string, store: PersistenceStore): StudySession[] {
  void weekStartDate;
  void store;
  throw new NotImplementedError("listSessions");
}

export function rescheduleSession(
  sessionId: string,
  input: RescheduleSessionInput,
  store: PersistenceStore,
): StudySession {
  void sessionId;
  void input;
  void store;
  throw new NotImplementedError("rescheduleSession");
}

export function deleteSession(sessionId: string, store: PersistenceStore): void {
  void sessionId;
  void store;
  throw new NotImplementedError("deleteSession");
}
