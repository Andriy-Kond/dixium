// ! Не підходить
// ! створює ключі такими, як текстові поля УСІ У КОДІ !!!
import { readdir, readFile, stat, writeFile } from "fs/promises";
import { join } from "path";

async function extractTextStringsToI18n(dir, locales = ["en", "uk"]) {
  const textStrings = new Set();

  async function scanDirectory(currentDir) {
    const files = await readdir(currentDir);
    for (const file of files) {
      const fullPath = join(currentDir, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (
        fullPath.endsWith(".js") ||
        fullPath.endsWith(".jsx") ||
        fullPath.endsWith(".ts") ||
        fullPath.endsWith(".tsx")
      ) {
        const content = await readFile(fullPath, "utf-8");
        const matches = content.match(/`[^`]*`|'[^']*'|"[^"]*"/g) || [];
        matches.forEach(match => {
          const cleanString = match
            .slice(1, -1)
            .replace(/\${[^}]*}/g, "")
            .trim();
          if (cleanString) {
            textStrings.add(cleanString);
          }
        });
      }
    }
  }

  await scanDirectory(dir);

  // Генеруємо файли для кожної мови
  for (const lng of locales) {
    const translations = {};
    textStrings.forEach(str => {
      translations[str] = lng === "en" ? str : ""; // Для "en" — сам рядок, для "uk" — порожньо
    });
    const outputFile = join(dir, "locales", lng, "translation.json");
    await writeFile(outputFile, JSON.stringify(translations, null, 2), "utf-8");
    console.log(`Generated ${outputFile} with ${textStrings.size} keys`);
  }
}

extractTextStringsToI18n("./src").catch(err => console.error(err));
