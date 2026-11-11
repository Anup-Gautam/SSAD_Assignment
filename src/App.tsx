import { useState } from "react";
import { CourseworkPage, ProgressPage, WeeklyCalendarPage } from "./ui/views";

type View = "coursework" | "calendar" | "progress";

export function App() {
  const [view, setView] = useState<View>("coursework");

  return (
    <main>
      <h1>StudyTrack</h1>
      <nav aria-label="Primary">
        <button type="button" onClick={() => setView("coursework")} aria-current={view === "coursework" ? "page" : undefined}>
          Coursework
        </button>
        <button type="button" onClick={() => setView("calendar")} aria-current={view === "calendar" ? "page" : undefined}>
          Weekly calendar
        </button>
        <button type="button" onClick={() => setView("progress")} aria-current={view === "progress" ? "page" : undefined}>
          Progress
        </button>
      </nav>
      {view === "coursework" && <CourseworkPage />}
      {view === "calendar" && <WeeklyCalendarPage />}
      {view === "progress" && <ProgressPage />}
    </main>
  );
}
