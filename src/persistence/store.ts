import { NotImplementedError } from "../errors";
import type { PersistenceStore, StudyTrackData } from "../types";

function unimplementedStore(label: string): PersistenceStore {
  return {
    load(): StudyTrackData {
      throw new NotImplementedError(`${label}.load`);
    },
    save(data: StudyTrackData): void {
      void data;
      throw new NotImplementedError(`${label}.save`);
    },
  };
}

export function createMemoryStore(): PersistenceStore {
  return unimplementedStore("createMemoryStore");
}

export function createLocalStorageStore(storage?: Storage): PersistenceStore {
  void storage;
  return unimplementedStore("createLocalStorageStore");
}
