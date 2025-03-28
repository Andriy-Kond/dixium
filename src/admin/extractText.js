import { readdir, readFile, stat, writeFile } from "fs/promises";
import { join } from "path";

async function extractText(dir, outputFile = "text_strings.json") {
  const textStrings = new Set(); // Унікальні рядки

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
        const matches = content.match(/`[^`]*`/g); // Знайти всі шаблонні літерали
        if (matches) {
          matches.forEach(match => {
            // Видаляємо бек-тіки та обрізаємо змінні типу ${...}
            const cleanString = match
              .slice(1, -1) // Прибираємо `
              .replace(/\${[^}]*}/g, ""); // Прибираємо ${variable}
            if (cleanString.trim()) {
              textStrings.add(cleanString.trim());
            }
          });
        }
      }
    }
  }

  await scanDirectory(dir);
  const result = Array.from(textStrings).sort();
  await writeFile(outputFile, JSON.stringify(result, null, 2), "utf-8");
  console.log(
    `Found ${result.length} unique text strings. Saved to ${outputFile}`,
  );
}

extractText("./src").catch(err => console.error(err));
// запустити - node src/admin/extractText.js
