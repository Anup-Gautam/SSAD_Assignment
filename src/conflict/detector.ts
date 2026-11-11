import { NotImplementedError } from "../errors";
import type { OverlapResult, SessionInterval } from "../types";

export function detectOverlap(
  proposed: SessionInterval,
  existing: SessionInterval[],
): OverlapResult {
  void proposed;
  void existing;
  throw new NotImplementedError("detectOverlap");
}
