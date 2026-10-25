# ProjectForge - New Project Creator

ProjectForge helps users build custom coding projects step-by-step. This implementation delivers the standalone "New project" page with robust draft autosaving, inline form validation, and multi-project localStorage persistence.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Application Name**: ProjectForge
> - **Visual Theme**: Sleek Developer Dark (Deep charcoal neutral canvas, cyan/indigo accent highlights, and monospace typography touches for metadata).
> - **Core Scope**: Single pristine "New project" view with Project Name, expanding Project Description textarea, inline validation errors, multi-project localStorage array persistence, and live draft autosaving.

---

## 1. Overview & Core Concept

- **What It Does**: A focused project intake page where developers specify what they want to build, capturing rich natural-language descriptions before the upcoming follow-up question flow.
- **Key Value**: Ensures users never lose their progress through reliable draft autosaving, while appending structured project records to a local project collection (`projectforge_projects`).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. User opens the app directly on the New Project page.
  2. As they type into Project Name and Project Description, inputs are automatically saved as a live draft in `localStorage` (`projectforge_draft`).
  3. Clicking "Continue" validates that both fields are populated. If empty, inline error messages display directly beneath the respective empty field(s).
  4. Upon success, a new project record (`id` generated via `crypto.randomUUID()`) is appended to the `projectforge_projects` array in `localStorage`, the draft is cleared, and a success confirmation displays: *"Project saved. Follow-up questions are coming soon."* with a button to start another project or view saved projects.
- **Visual Identity & Theme**:
  - *Aesthetic*: Developer-centric dark mode (`bg-slate-950` / `bg-slate-900` surfaces, crisp typography, indigo/cyan accent buttons).
  - *Typography*: Clean sans-serif display/body font with monospace (`font-mono`) accents for helper hints and timestamps.

---

## 3. Key Product Decisions & Architecture

- **Modular Storage (`src/services/projectStorage.ts`)**: Encapsulates all localStorage operations (`saveProject`, `getProjects`, `getDraft`, `saveDraft`, `clearDraft`). Appends new projects to `projectforge_projects` without overwriting existing entries.
- **Extensible Status**: `type ProjectStatus = "Described";` defined cleanly in types so additional workflow stages can be appended easily later.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      App.tsx                           │
│  (New Project Form State & View Switcher / Success)    │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│  src/services/projectStorage  │ │ src/components/...   │
│  - saveProject(p) (Append)    │ │ - Header (Branding)  │
│  - getDraft() / saveDraft()   │ │ - ProjectForm        │
│  - clearDraft()               │ │ - SuccessScreen      │
└───────────────────────────────┘ └──────────────────────┘
```

- **Data Model**:
  ```ts
  export type ProjectStatus = "Described";

  export interface SavedProject {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    status: ProjectStatus;
  }

  export interface ProjectDraft {
    name: string;
    description: string;
    updatedAt: string;
  }
  ```
