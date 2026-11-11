import { NotImplementedError } from "../errors";
import type { PersistenceStore, ProgressSummary } from "../types";

export function getProgressSummary(
  weekStartDate: string,
  store: PersistenceStore,
): ProgressSummary {
  void weekStartDate;
  void store;
  throw new NotImplementedError("getProgressSummary");
}
