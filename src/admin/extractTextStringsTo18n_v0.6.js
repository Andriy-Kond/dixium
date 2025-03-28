import { readdir, readFile, stat, writeFile } from "fs/promises";
import { join, resolve } from "path";

async function extractTextStringsToI18n(dir, locales = ["en", "uk"]) {
  const textStrings = new Map();
  const debug = true;

  const ignoredPaths = [
    "styles",
    "admin",
    "locales",
    "services",
    "utils/generals/constants.js",
    "App.jsx",
    "index.js",
    "extractTextStringsToI18n.js",
  ].map(path => resolve(dir, path));

  async function processFile(fullPath) {
    const content = await readFile(fullPath, "utf-8");
    const lines = content.split("\n");

    let inConsoleBlock = false;
    let inNotifyBlock = false;
    let inErrorBlock = false;
    let inBuilderBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Пошук текстових літералів у лапках
      const literalMatches = line.match(/`[^`]*`|'[^']*'|"[^"]*"/g) || [];
      // Пошук тексту в JSX між тегами
      const jsxMatches = line.match(/>([^<{]+)</g) || [];

      // Обробка літералів у лапках
      for (let j = 0; j < literalMatches.length; j++) {
        const match = literalMatches[j];
        const originalString = match.slice(1, -1);
        const cleanString = originalString.replace(/\${[^}]*}/g, "").trim();

        if (!cleanString) continue;

        const formattedKey = cleanString.toLowerCase().replace(/\s+/g, "_");
        let valueWithPlaceholders = originalString;
        const placeholders = originalString.match(/\${[^}]+}/g) || [];
        placeholders.forEach(ph => {
          const varName = ph.slice(2, -1).split(".").pop();
          valueWithPlaceholders = valueWithPlaceholders.replace(
            ph,
            `{${varName}}`,
          );
        });

        if (
          !filterString(line, cleanString, {
            inConsoleBlock,
            inNotifyBlock,
            inErrorBlock,
            inBuilderBlock,
          })
        ) {
          textStrings.set(formattedKey, valueWithPlaceholders);
        }
      }

      // Обробка тексту в JSX
      for (let j = 0; j < jsxMatches.length; j++) {
        const match = jsxMatches[j];
        const originalString = match.slice(1, -1).trim();

        if (!originalString) continue;

        const formattedKey = originalString.toLowerCase().replace(/\s+/g, "_");

        if (
          !filterString(line, originalString, {
            inConsoleBlock,
            inNotifyBlock,
            inErrorBlock,
            inBuilderBlock,
          })
        ) {
          textStrings.set(formattedKey, originalString);
        }
      }

      // Перевірка багаторядкових конструкцій
      if (
        line.includes("console.") &&
        line.includes("(") &&
        !line.includes(")")
      ) {
        inConsoleBlock = true;
      }
      if (
        line.includes("Notify.") &&
        line.includes("(") &&
        !line.includes(")")
      ) {
        inNotifyBlock = true;
      }
      if (line.match(/Error\s*\(/) && !line.includes(")")) {
        inErrorBlock = true;
      }
      if (
        (line.includes("builder.query") || line.includes("builder.mutation")) &&
        line.includes("(") &&
        !line.includes(")")
      ) {
        inBuilderBlock = true;
      }

      if (
        (inConsoleBlock && line.includes(")")) ||
        (inNotifyBlock && line.includes(")")) ||
        (inErrorBlock && line.includes(")")) ||
        (inBuilderBlock && line.includes(")"))
      ) {
        inConsoleBlock = false;
        inNotifyBlock = false;
        inErrorBlock = false;
        inBuilderBlock = false;
      }
    }
  }

  // Функція для фільтрації рядків
  function filterString(
    line,
    cleanString,
    { inConsoleBlock, inNotifyBlock, inErrorBlock, inBuilderBlock },
  ) {
    if (line.startsWith("//") || line.includes("/*") || line.includes("*/")) {
      if (debug) console.log(`Ignoring comment: ${cleanString}`);
      return true;
    }
    if (line.includes("import") || line.includes("from")) {
      if (debug) console.log(`Ignoring import/from: ${cleanString}`);
      return true;
    }
    if (
      inConsoleBlock ||
      inNotifyBlock ||
      inErrorBlock ||
      line.includes("console.") ||
      line.includes("Notify.") ||
      line.match(/Error\s*\(/) ||
      line.includes("throw new Error")
    ) {
      if (debug) console.log(`Ignoring log/notify/error: ${cleanString}`);
      return true;
    }
    if (
      inBuilderBlock ||
      line.includes("url:") ||
      line.match(/\/api\//) ||
      line.includes("method:") ||
      line.includes("endpoints:") ||
      line.includes("builder.query") ||
      line.includes("builder.mutation")
    ) {
      if (debug) console.log(`Ignoring endpoint: ${cleanString}`);
      return true;
    }
    if (line.includes("socket.emit") || line.includes("socket.io")) {
      if (debug) console.log(`Ignoring socket event: ${cleanString}`);
      return true;
    }
    if (cleanString.match(/[a-z][A-Z]/)) {
      if (debug) console.log(`Ignoring camelCase: ${cleanString}`);
      return true;
    }
    if (line.includes("alt=") && cleanString === "card") {
      if (debug) console.log(`Ignoring alt attribute: ${cleanString}`);
      return true;
    }
    if (
      cleanString.startsWith("--") ||
      cleanString.match(/%$/) ||
      cleanString.match(/deg$/)
    ) {
      if (debug) console.log(`Ignoring CSS variable: ${cleanString}`);
      return true;
    }
    if (
      cleanString.startsWith("./") ||
      cleanString.startsWith("/") ||
      cleanString.match(/^\d+$/) ||
      cleanString.length < 2
    ) {
      if (debug) console.log(`Ignoring extra filter: ${cleanString}`);
      return true;
    }
    return false;
  }

  async function scanDirectory(currentDir) {
    const files = await readdir(currentDir);
    for (const file of files) {
      const fullPath = resolve(currentDir, file);
      if (
        ignoredPaths.some(
          ignored => fullPath.startsWith(ignored) || fullPath === ignored,
        )
      ) {
        if (debug) console.log(`Ignoring path: ${fullPath}`);
        continue;
      }
      const fileStat = await stat(fullPath);
      if (fileStat.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (
        fullPath.endsWith(".js") ||
        fullPath.endsWith(".jsx") ||
        fullPath.endsWith(".ts") ||
        fullPath.endsWith(".tsx")
      ) {
        await processFile(fullPath);
      }
    }
  }

  await scanDirectory(dir);

  for (const lng of locales) {
    const translations = {};
    textStrings.forEach((value, key) => {
      translations[key] = lng === "en" ? value : "";
    });
    const outputFile = join(dir, "locales", lng, "translation.json");
    await writeFile(outputFile, JSON.stringify(translations, null, 2), "utf-8");
    console.log(`Generated ${outputFile} with ${textStrings.size} keys`);
  }
}

extractTextStringsToI18n("./src").catch(err => console.error(err));
// запустити - node src/admin/extractTextStringsTo18n.js
