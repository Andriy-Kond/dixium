# For use `i18next` translating:

`npm install i18next react-i18next ` will install last version.

In project used `typescript@4.9.5`, but last version of i18next needs typescript v5 or more.

For use `i18next` with `typescript@4.9.5` you must install previous version.
For example: `npm install i18next@23.11.5 react-i18next`.

Or you can install last last version of typescript (for example `typescript@5.8.2`) for last version of `i18next`. But in this case you must reinstall and some other react packages to last version.

Check version of typescript: `npx tsc --version`.
Or check it in package-lock.json:

```
"node_modules/typescript": {
"version": "4.9.5",
...
}
```

`npm install --save-dev i18next-parser` - extract text from code by CLI
