import { readdir, readFile, stat, writeFile } from "fs/promises";
import { join } from "path";

async function extractTextStringsTo18n(dir, locales = ["en", "uk"]) {
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
        // Розбиваємо файл на рядки для точнішого аналізу контексту
        const lines = content.split("\n");

        for (const line of lines) {
          // Знайти всі текстові рядки у рядку
          const matches = line.match(/`[^`]*`|'[^']*'|"[^"]*"/g) || [];
          matches.forEach(match => {
            const cleanString = match
              .slice(1, -1) // Прибираємо лапки або бек-тіки
              .replace(/\${[^}]*}/g, "") // Прибираємо ${variable}
              .trim();

            if (!cleanString) return; // Пропускаємо порожні рядки

            // 1. Ігноруємо коментарі
            if (
              line.trim().startsWith("//") ||
              line.includes("/*") ||
              line.includes("*/")
            ) {
              return;
            }

            // 2. Ігноруємо імпорти (перевіряємо наявність "import" у рядку)
            if (line.includes("import")) {
              return;
            }

            // 3. Ігноруємо логи та повідомлення (console, Notify, Error)
            if (
              line.includes("console.") ||
              line.includes("Notify.") ||
              line.match(/Error\s*\(/) ||
              line.includes("throw new Error")
            ) {
              return;
            }

            // 4. Ігноруємо ендпоінти (url у об’єктах типу { url: ... })
            if (
              line.includes("url:") ||
              line.match(/\/api\//) || // Типові ендпоінти з /api/
              line.includes("method:") || // Частина конфігурації запиту
              line.includes("endpoints:") // Ігноруємо саму декларацію endpoints
            ) {
              return;
            }

            // Додаткові фільтри (можна розширити за потреби)
            if (
              cleanString.startsWith("./") || // Ігноруємо шляхи, які залишились
              cleanString.startsWith("/") || // Абсолютні шляхи
              cleanString.match(/^\d+$/) || // Чисті числа
              cleanString.length < 2 // Дуже короткі рядки (наприклад, "a")
            ) {
              return;
            }

            textStrings.add(cleanString);
          });
        }
      }
    }
  }

  await scanDirectory(dir);

  // Генеруємо файли для кожної мови
  for (const lng of locales) {
    const translations = {};
    textStrings.forEach(str => {
      translations[str] = lng === "en" ? str : "";
    });
    const outputFile = join(dir, "locales", lng, "translation.json");
    await writeFile(outputFile, JSON.stringify(translations, null, 2), "utf-8");
    console.log(`Generated ${outputFile} with ${textStrings.size} keys`);
  }
}

extractTextStringsTo18n("./src").catch(err => console.error(err));
// запустити - node src/admin/extractTextStringsTo18n.js

// Ігнорування коментарів (// і /*...*/):

//     Перевіряємо, чи рядок починається з // або містить /* чи */. Якщо так, пропускаємо всі текстові рядки в цьому рядку.

// Ігнорування імпортів:

//     Замість перевірки лише на ./ ми перевіряємо наявність слова import у рядку. Це покриває як import "./file.js", так і import { LOBBY } from "utils/generals/constants.js", і навіть import "@dnd-kit/core".

// Ігнорування логів і повідомлень:

//     Додано перевірки на:
//         console. (включає console.log, console.warn, тощо).
//         Notify. (включає Notify.failure, Notify.success, тощо).
//         Error( і throw new Error (для обробки помилок типу Error("The game is ${game}")).

// Ігнорування ендпоінтів:

//     Фільтруємо рядки, які:
//         Містять url: (типова частина конфігурації запиту).
//         Містять /api/ (характерно для ендпоінтів).
//         Містять method: (ще одна ознака конфігурації запиту).
//         Містять endpoints: (щоб уникнути назви секції).

// Додаткові фільтри:

//     Ігноруємо:
//         Рядки, що починаються з ./ або / (шляхи, які могли проскочити).
//         Чисті числа (наприклад, "123").
//         Дуже короткі рядки (менше 2 символів), щоб уникнути сміття типу "a".
