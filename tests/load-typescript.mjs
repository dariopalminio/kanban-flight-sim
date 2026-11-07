import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const cache = new Map();
const identity = (source) => source;

// Run source assertions with the installed compiler, without adding a test dependency.
export function loadTypescript(filename, transform = identity) {
  filename = path.resolve(filename);
  if (transform !== identity) cache.delete(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const source = transform(fs.readFileSync(filename, "utf8"));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  cache.set(filename, module);
  const nativeRequire = createRequire(filename);
  const require = (specifier) => {
    const target = path.resolve(path.dirname(filename), specifier);
    for (const extension of [".ts", ".tsx"]) {
      if (specifier.startsWith(".") && fs.existsSync(target + extension)) {
        return loadTypescript(target + extension);
      }
    }
    return nativeRequire(specifier);
  };
  new Function("require", "module", "exports", outputText)(require, module, module.exports);
  return module.exports;
}
