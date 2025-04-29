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

Питання:

1. У тебе є фон у вигляді зображення. Треба його якось зробити у вигляді динамічного створення - щоб на різних девайсах він виглядав більш-менш однаково. Для цього треба тінь від логотипу зробити окремим елементом, або об'єднати його з логотипом. А всі інші стилі (затемнення по кутах) робити динамічно через shadow-layers
