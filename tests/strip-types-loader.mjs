import {stat} from "node:fs/promises";
import {fileURLToPath, pathToFileURL} from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !/[.][a-z]+$/i.test(specifier)) {
    const candidate = new URL(`${specifier}.ts`, context.parentURL);
    try {
      await stat(fileURLToPath(candidate));
      return nextResolve(pathToFileURL(fileURLToPath(candidate)).href, context);
    } catch {}
  }
  return nextResolve(specifier, context);
}
