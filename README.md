`@cloudinary/url-gen` - офіційний SDK від Cloudinary для генерації URL у React.

```
npm install @cloudinary/url-gen @cloudinary/react
```

```js
<input
  autoFocus
  ref={inputRef}
  className={css.searchGameInput}
  type="text"
  onChange={handleChange}
  placeholder="Search by number..."
  // pattern="[0-9]*" // валідація - лише цифри і порожній рядок
  // pattern="\d*" // теж лише цифри, але з арабськими у юнікоді

  inputMode="numeric" // одразу відкриє мобільну клавіатуру з цифрами на моб. пристроях
  maxLength={5} // 4 цифри + дефіс
  aria-label={t("search_game_by_number")}
/>
```

# Roles

Гравців === 3 - голосування за 1 карту.
Гравців 3-6 - голосування за 1 карту
Гравців 7-12 - голосування за 1 карту якщо режиму isSingleCardMode, інакше - за 2 карти
