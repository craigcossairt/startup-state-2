import path from "node:path";

export function repoRoot(): string {
  return process.cwd();
}

export function dataPath(...parts: string[]): string {
  return path.join(repoRoot(), "data", ...parts);
}
