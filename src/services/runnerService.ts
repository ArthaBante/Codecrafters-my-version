export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface RunResult {
  success: boolean;
  message: string;
  failedTest?: TestCase;
  hint?: string;
}

export function runCodeCheck(
  code: string, 
  testCases: TestCase[], 
  hints: string[]
): RunResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      success: false,
      message: "Code editor is empty. Please write or paste code before submitting.",
      failedTest: testCases[0] || { input: "N/A", expectedOutput: "N/A" },
      hint: hints[0] || "Write a valid solution in the code editor."
    };
  }

  // Mock check: if code includes "fail" or "error", fail; otherwise pass
  if (trimmed.toLowerCase().includes("fail") || trimmed.toLowerCase().includes("syntaxerror")) {
    return {
      success: false,
      message: "Test execution failed on evaluation case.",
      failedTest: testCases[0] || { input: "test_input", expectedOutput: "expected" },
      hint: hints[0] || "Check your logic and review the expected output."
    };
  }

  return {
    success: true,
    message: "All test cases passed successfully!"
  };
}
