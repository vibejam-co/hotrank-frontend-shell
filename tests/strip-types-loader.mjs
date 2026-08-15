import {stat} from "node:fs/promises";
import {fileURLToPath, pathToFileURL} from "node:url";

const repositoryRoot = new URL("../", import.meta.url);

async function resolveFile(candidate) {
  const candidates = [candidate, `${candidate}.ts`, `${candidate}.tsx`, `${candidate}.js`, `${candidate}.jsx`, `${candidate}/index.ts`, `${candidate}/index.tsx`, `${candidate}/index.js`];
  for (const value of candidates) {
    try {
      const info = await stat(fileURLToPath(new URL(value, repositoryRoot)));
      if (info.isFile()) return new URL(value, repositoryRoot);
    } catch {}
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = await resolveFile(specifier.slice(2));
    if (resolved) return nextResolve(pathToFileURL(fileURLToPath(resolved)).href, context);
  }
  if (specifier.startsWith(".") && !/[.][a-z]+$/i.test(specifier)) {
    const resolved = await resolveFile(new URL(specifier, context.parentURL).pathname);
    if (resolved) return nextResolve(pathToFileURL(fileURLToPath(resolved)).href, context);
  }
  return nextResolve(specifier, context);
}
