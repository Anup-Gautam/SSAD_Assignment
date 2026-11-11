# SSAD_Assignment

StudyTrack is a single-student browser application for coursework and study time. This repository contains the specification, architecture, calling contracts, test plan, a TypeScript skeleton with no business logic, and the acceptance tests.

The architecture has no backend. Domain functions throw `not_implemented` until they are implemented. Data is intended to live in browser `localStorage`.

## Commands

```bash
npm install
npm test
npm run dev
```

`npm test` runs the Vitest acceptance tests. `npm run dev` starts the skeleton at http://localhost:5173.
