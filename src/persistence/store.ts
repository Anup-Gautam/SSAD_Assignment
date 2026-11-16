import type { PersistenceStore, StudyTrackData } from "../types";

const LOCAL_STORAGE_KEY = "studytrack.v1";

function emptyData(): StudyTrackData {
  return {
    courses: [],
    assignments: [],
    subtasks: [],
    sessions: [],
    studyTimeRecords: [],
  };
}

function cloneData(data: StudyTrackData): StudyTrackData {
  return {
    courses: data.courses.map((course) => ({ ...course })),
    assignments: data.assignments.map((assignment) => ({ ...assignment })),
    subtasks: data.subtasks.map((subtask) => ({ ...subtask })),
    sessions: data.sessions.map((session) => ({ ...session })),
    studyTimeRecords: data.studyTimeRecords.map((record) => ({ ...record })),
  };
}

export function createMemoryStore(): PersistenceStore {
  let state = emptyData();
  return {
    load(): StudyTrackData {
      return cloneData(state);
    },
    save(data: StudyTrackData): void {
      state = cloneData(data);
    },
  };
}

export function createLocalStorageStore(storage?: Storage): PersistenceStore {
  const backend = storage ?? localStorage;
  return {
    load(): StudyTrackData {
      const raw = backend.getItem(LOCAL_STORAGE_KEY);
      if (raw === null) {
        return emptyData();
      }
      return cloneData(JSON.parse(raw) as StudyTrackData);
    },
    save(data: StudyTrackData): void {
      backend.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloneData(data)));
    },
  };
}
