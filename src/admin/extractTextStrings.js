import { readdir, readFile, stat, writeFile } from "fs/promises";
import { join, resolve } from "path";

async function extractTextStringsToI18n(dir, locales = ["en", "uk"]) {
  const textStrings = new Set();
  const debug = true; // Увімкни/вимкни логування для дебагу

  // Список тек і файлів для ігнорування
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

  // Окрема функція для обробки вмісту файлу
  async function processFile(fullPath) {
    const content = await readFile(fullPath, "utf-8");
    const lines = content.split("\n");

    let inConsoleBlock = false;
    let inNotifyBlock = false;
    let inErrorBlock = false;
    let inBuilderBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const matches = line.match(/`[^`]*`|'[^']*'|"[^"]*"/g) || [];

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
        continue;
      }

      for (let j = 0; j < matches.length; j++) {
        const match = matches[j];
        const cleanString = match
          .slice(1, -1) // Прибираємо лапки або бек-тіки
          .replace(/\${[^}]*}/g, "") // Прибираємо ${variable}
          .trim();

        if (!cleanString) continue;

        // Форматування ключа: нижній регістр + заміна пробілів на "_"
        const formattedKey = cleanString.toLowerCase().replace(/\s+/g, "_");

        if (
          line.startsWith("//") ||
          line.includes("/*") ||
          line.includes("*/")
        ) {
          if (debug) console.log(`Ignoring comment: ${cleanString}`);
          continue;
        }
        if (line.includes("import") || line.includes("from")) {
          if (debug) console.log(`Ignoring import/from: ${cleanString}`);
          continue;
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
          continue;
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
          continue;
        }
        if (line.includes("socket.emit") || line.includes("socket.io")) {
          if (debug) console.log(`Ignoring socket event: ${cleanString}`);
          continue;
        }
        if (cleanString.match(/[a-z][A-Z]/)) {
          if (debug) console.log(`Ignoring camelCase: ${cleanString}`);
          continue;
        }
        if (line.includes("alt=") && cleanString === "card") {
          if (debug) console.log(`Ignoring alt attribute: ${cleanString}`);
          continue;
        }
        if (
          cleanString.startsWith("--") ||
          cleanString.match(/%$/) ||
          cleanString.match(/deg$/)
        ) {
          if (debug) console.log(`Ignoring CSS variable: ${cleanString}`);
          continue;
        }
        if (
          cleanString.startsWith("./") ||
          cleanString.startsWith("/") ||
          cleanString.match(/^\d+$/) ||
          cleanString.length < 2
        ) {
          if (debug) console.log(`Ignoring extra filter: ${cleanString}`);
          continue;
        }

        textStrings.add(formattedKey); // Додаємо відформатований ключ
      }
    }
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

  // Генеруємо файли для кожної мови
  for (const lng of locales) {
    const translations = {};
    textStrings.forEach(str => {
      translations[str] = lng === "en" ? str.replace(/_/g, " ") : ""; // Значення — оригінальний текст із пробілами
    });
    const outputFile = join(dir, "locales", lng, "translation.json");
    await writeFile(outputFile, JSON.stringify(translations, null, 2), "utf-8");
    console.log(`Generated ${outputFile} with ${textStrings.size} keys`);
  }
}

extractTextStringsToI18n("./src").catch(err => console.error(err));
// запустити - node src/admin/extractTextStrings.js

// Додано підтримку не тільки шаблонних літералів (`...`), а й одинарних ('...') та подвійних ("...") рядків.
// Перевірка на порожні рядки (if (cleanString)), щоб уникнути додавання порожніх значень.
