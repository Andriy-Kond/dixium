// ES6:
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

async function findTextFields(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      await findTextFields(fullPath);
    } else if (fullPath.endsWith(".js") || fullPath.endsWith(".tsx")) {
      const content = await readFile(fullPath, "utf-8");
      const matches = content.match(/`[^`]*\${[^`]*}`/g);
      if (matches) {
        console.log(`File: ${fullPath}`);
        matches.forEach(match => console.log(`Found: ${match}`));
      }
    }
  }
}

// Запуск скрипту (node findTextFields.js)
findTextFields("./src").catch(err => console.error(err));

// Скріпт просканує всі .js і .tsx файли у папці src і виведе знайдені шаблонні літерали типу `Text: ${variable}`.

// // ES5:
// const fs = require("fs").promises;
// const path = require("path");

// async function findTextFields(dir) {
//   const files = await fs.readdir(dir);
//   for (const file of files) {
//     const fullPath = path.join(dir, file);
//     const stat = await fs.stat(fullPath);
//     if (stat.isDirectory()) {
//       await findTextFields(fullPath);
//     } else if (fullPath.endsWith(".js") || fullPath.endsWith(".tsx")) {
//       const content = await fs.readFile(fullPath, "utf-8");
//       const matches = content.match(/`[^`]*\${[^`]*}`/g);
//       if (matches) {
//         console.log(`File: ${fullPath}`);
//         matches.forEach(match => console.log(`Found: ${match}`));
//       }
//     }
//   }
// }

// findTextFields("./src");
