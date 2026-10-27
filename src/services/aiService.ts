import { SavedProject } from "./projectStorage";

export const GEMINI_MODEL_NAME = "gemini-3.5-flash-lite";
export const USE_MOCK_AI = false; // Set to true to test UI without consuming tokens

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Stage {
  id: string;
  order: number;
  title: string;
  goal: string;
  concept: string;
  doneWhen: string[];
  testType: "io";
  testCases: TestCase[];
  hints: string[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: "single" | "multi";
  options: string[];
}

export interface ProjectBrief {
  summary: string;
  language: string;
  proficiency: string;
  scope: string;
  fromScratch: boolean;
  suggestedStageCount: number;
}

// 1. Generate Questions
export async function generateQuestions(project: SavedProject, forceRefresh: boolean = false): Promise<Question[]> {
  if (project.questions && project.questions.length > 0 && !forceRefresh) {
    return project.questions;
  }

  if (USE_MOCK_AI) {
    return [
      {
        id: "ai_q1",
        text: "What primary data storage approach do you prefer for this project?",
        type: "single",
        options: ["In-memory collections", "Local SQLite file", "External SQL Database", "No persistence needed"]
      },
      {
        id: "ai_q2",
        text: "Would you like automated unit tests included in the roadmap?",
        type: "single",
        options: ["Yes, comprehensive test suite", "Basic sanity tests only", "No tests required"]
      }
    ];
  }

  const res = await fetch("/api/ai/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: project.name,
      description: project.description,
      language: project.language,
      proficiency: project.proficiency,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to generate AI questions");
  }

  return await res.json();
}

// 2. Generate Brief
export async function generateBrief(
  project: SavedProject, 
  answers: Record<string, any>, 
  forceRefresh: boolean = false
): Promise<ProjectBrief> {
  if (project.brief && !forceRefresh) {
    return project.brief;
  }

  if (USE_MOCK_AI) {
    return {
      summary: `A robust ${project.language} application built for ${project.proficiency} developers to implement ${project.name}. Structured around clean modular architecture, automated checks, and stepwise progression.`,
      language: project.language,
      proficiency: project.proficiency,
      scope: answers.scope || "Solid CV project",
      fromScratch: answers.libraries === "build from scratch" || true,
      suggestedStageCount: 5,
    };
  }

  const res = await fetch("/api/ai/brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: project.name,
      description: project.description,
      language: project.language,
      proficiency: project.proficiency,
      answers,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to generate project brief");
  }

  return await res.json();
}

// 3. Generate Stages
export async function generateStages(project: SavedProject, forceRefresh: boolean = false): Promise<Stage[]> {
  if (project.stages && project.stages.length > 0 && !forceRefresh) {
    return project.stages;
  }

  if (USE_MOCK_AI) {
    const lang = project.language.toUpperCase();
    const projectName = project.name || "Project";
    return [
      {
        id: `stage-1-${project.id}`,
        order: 1,
        title: `Environment & Initialization (${lang})`,
        goal: `Set up the foundational workspace and verify your ${lang} runtime for ${projectName}.`,
        concept: `Understanding entry points, syntax foundations, and module loading in ${lang}.`,
        doneWhen: [
          "Workspace structure initialized successfully",
          "Main script executes without compilation or runtime errors",
          "Outputs initialization greeting"
        ],
        testType: "io",
        testCases: [
          { input: "init", expectedOutput: "Initialized Successfully" },
          { input: "version", expectedOutput: `${lang} Environment Active` }
        ],
        hints: [
          `Ensure your ${project.language} compiler or interpreter is properly configured.`,
          "Verify that your main entry point prints the exact expected greeting string."
        ]
      },
      {
        id: `stage-2-${project.id}`,
        order: 2,
        title: "Data Models & Input Parsing",
        goal: "Design core data structures and handle incoming payloads robustly.",
        concept: "State encapsulation, collection mapping, and deserialization techniques.",
        doneWhen: [
          "Core data models defined correctly",
          "Input strings parsed accurately into structured objects",
          "Malformed input handled gracefully"
        ],
        testType: "io",
        testCases: [
          { input: "parse:{\"key\":\"value\"}", expectedOutput: "Parsed: value" },
          { input: "parse:{}", expectedOutput: "Parsed: none" }
        ],
        hints: [
          "Use built-in JSON or string manipulation methods.",
          "Check for missing keys or null values before accessing properties."
        ]
      },
      {
        id: `stage-3-${project.id}`,
        order: 3,
        title: "Core Business Logic & Processing",
        goal: "Implement the primary algorithms and transformations for your project.",
        concept: "Algorithmic thinking, transformation pipelines, and conditional branching.",
        doneWhen: [
          "Primary transformation function computes expected results",
          "Loop and iteration boundaries tested",
          "State mutations verified"
        ],
        testType: "io",
        testCases: [
          { input: "process:10", expectedOutput: "Processed: 20" },
          { input: "process:25", expectedOutput: "Processed: 50" }
        ],
        hints: [
          "Break down complex logic into pure, testable helper functions.",
          "Verify your loop exit conditions and edge numeric values."
        ]
      },
      {
        id: `stage-4-${project.id}`,
        order: 4,
        title: "Error Handling & Edge Cases",
        goal: "Harden your application against invalid inputs and runtime exceptions.",
        concept: "Defensive programming, exception handling, and status reporting.",
        doneWhen: [
          "Invalid commands return clean error messages",
          "Exceptions caught and logged appropriately",
          "System state remains stable after recovery"
        ],
        testType: "io",
        testCases: [
          { input: "bad_command", expectedOutput: "Error: Unrecognized command" },
          { input: "health", expectedOutput: "Status: Healthy" }
        ],
        hints: [
          "Wrap critical execution paths in try-catch blocks or guard clauses.",
          "Ensure error messages match the exact specification expected by tests."
        ]
      },
      {
        id: `stage-5-${project.id}`,
        order: 5,
        title: "Integration, Polish & Delivery",
        goal: "Assemble all modules into a cohesive end-to-end workflow.",
        concept: "End-to-end validation, output formatting, and final review.",
        doneWhen: [
          "All modules cooperate seamlessly in sequence",
          "End-to-end integration simulation passes",
          "Final readiness signal confirmed"
        ],
        testType: "io",
        testCases: [
          { input: "run_e2e", expectedOutput: "Pipeline Complete - Success" },
          { input: "exit", expectedOutput: "Session Closed" }
        ],
        hints: [
          "Perform a complete manual walkthrough of all use cases.",
          "Ensure all project goals specified in your description are met."
        ]
      }
    ];
  }

  const res = await fetch("/api/ai/stages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: project.name,
      description: project.description,
      language: project.language,
      proficiency: project.proficiency,
      brief: project.brief,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to generate project stages");
  }

  return await res.json();
}
