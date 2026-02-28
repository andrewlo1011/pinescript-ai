import type { ValidationResult } from "./types";

function runtimeRequire(moduleName: string): unknown {
  const req = (0, eval)("require") as (id: string) => unknown;
  return req(moduleName);
}

export function transpileValidate(code: string): ValidationResult[] {
  try {
    let transpile: ((source: string) => unknown) | undefined;
    const candidates = ["@opusaether/pine-transpiler", "pine-transpiler"];

    for (const moduleName of candidates) {
      try {
        const maybeModule = runtimeRequire(moduleName) as {
          transpile?: (source: string) => unknown;
        };
        if (typeof maybeModule?.transpile === "function") {
          transpile = maybeModule.transpile;
          break;
        }
      } catch {
        // Try next candidate package name
      }
    }

    if (!transpile) {
      return [];
    }

    const result = transpile(code);

    if (typeof result === "string" && result.length > 0) {
      return [{
        rule: "transpiler",
        status: "pass",
        message: "Code parses successfully",
      }];
    }

    return [{
      rule: "transpiler",
      status: "error",
      message: "Code contains syntax errors that prevent transpilation",
    }];
  } catch {
    // Package not installed or threw — fail open
    return [];
  }
}
