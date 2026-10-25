import { Stage } from "./aiService";

export type ProjectLanguage = "python" | "java" | "javascript";
export type ProjectProficiency = "beginner" | "intermediate" | "advanced";
export type ProjectStatus = "described" | "questions" | "brief" | "planned" | "in_progress" | "completed";

export interface SavedProject {
  id: string;
  userId: string;
  name: string;
  language: ProjectLanguage;
  proficiency: ProjectProficiency;
  description: string;
  status: ProjectStatus;
  currentStage: number; // Index or stage number
  stages?: Stage[];
  passedStages?: string[]; // IDs of passed stages
  createdAt: string;
}

export interface ProjectDraft {
  name: string;
  description: string;
  language: ProjectLanguage | null;
  proficiency: ProjectProficiency | null;
  updatedAt: string;
}

const PROJECTS_KEY = "projectforge_projects";
const DRAFT_KEY = "projectforge_draft";

export function getProjects(userId?: string): SavedProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed: any[] = JSON.parse(raw);
    const normalized: SavedProject[] = parsed.map((p) => ({
      id: p.id || crypto.randomUUID(),
      userId: p.userId || "guest-user",
      name: p.name || "Untitled Project",
      language: p.language || "python",
      proficiency: p.proficiency || "intermediate",
      description: p.description || "",
      status: p.status || "described",
      currentStage: typeof p.currentStage === "number" ? p.currentStage : 0,
      stages: p.stages || [],
      passedStages: p.passedStages || [],
      createdAt: p.createdAt || new Date().toISOString(),
    }));

    if (userId) {
      return normalized.filter((p) => p.userId === userId);
    }
    return normalized;
  } catch (err) {
    console.error("Failed to load projects from localStorage", err);
    return [];
  }
}

export function getProjectById(id: string): SavedProject | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(
  input: {
    name: string;
    description: string;
    language: ProjectLanguage;
    proficiency: ProjectProficiency;
  },
  userId: string = "guest-user"
): SavedProject {
  const projects = getProjects();
  const newProject: SavedProject = {
    id: crypto.randomUUID(),
    userId,
    name: input.name.trim(),
    description: input.description.trim(),
    language: input.language,
    proficiency: input.proficiency,
    status: "described",
    currentStage: 0,
    stages: [],
    passedStages: [],
    createdAt: new Date().toISOString(),
  };
  
  const updatedProjects = [newProject, ...projects];
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  clearDraft();
  return newProject;
}

export function updateProject(updatedProject: SavedProject): void {
  try {
    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  } catch (err) {
    console.error("Failed to update project", err);
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getProjects();
    const updated = projects.filter((p) => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete project from localStorage", err);
  }
}

export function getDraft(): ProjectDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || "",
      description: parsed.description || "",
      language: parsed.language || null,
      proficiency: parsed.proficiency || null,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to load draft from localStorage", err);
    return null;
  }
}

export function saveDraft(draft: {
  name: string;
  description: string;
  language: ProjectLanguage | null;
  proficiency: ProjectProficiency | null;
}): void {
  try {
    const payload: ProjectDraft = {
      name: draft.name,
      description: draft.description,
      language: draft.language,
      proficiency: draft.proficiency,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to save draft to localStorage", err);
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error("Failed to clear draft from localStorage", err);
  }
}
