import { NotImplementedError } from "../errors";
import type {
  PersistenceStore,
  RecordStudyTimeInput,
  StudyTimeFilter,
  StudyTimeRecord,
} from "../types";

export function recordStudyTime(
  input: RecordStudyTimeInput,
  store: PersistenceStore,
): StudyTimeRecord {
  void input;
  void store;
  throw new NotImplementedError("recordStudyTime");
}

export function listStudyTimeRecords(
  filter: StudyTimeFilter | undefined,
  store: PersistenceStore,
): StudyTimeRecord[] {
  void filter;
  void store;
  throw new NotImplementedError("listStudyTimeRecords");
}
