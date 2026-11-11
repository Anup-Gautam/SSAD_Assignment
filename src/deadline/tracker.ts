import { NotImplementedError } from "../errors";
import type {
  AssignmentFilter,
  Clock,
  PersistenceStore,
  TrackedAssignment,
} from "../types";

export function listTrackedAssignments(
  filter: AssignmentFilter,
  clock: Clock,
  store: PersistenceStore,
): TrackedAssignment[] {
  void filter;
  void clock;
  void store;
  throw new NotImplementedError("listTrackedAssignments");
}
