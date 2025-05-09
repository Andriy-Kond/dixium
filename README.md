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

1. У тебе є фон у вигляді зображення. Тут треба або робити його динамічними тінями, щоб css його малював на клієнті. Якщо ти зможеш перевести це у стилі, то ок. Або ж можна залишити фон зображенням і розтягувати його на різних екранах. Невелика деформація кардинально нічого не змінить. Але у будь-якому випадку необхідно тінь під лого зробити окремим компонентом, і об'єднувати з лого на light-темі (на dark-темі його все одно не видно), щоб воно не деформувалось на різних екранах.

2. Робити написи зображеннями не найкращий варіант, бо виникають проблеми з перекладом - доведеться під кожну мову робити окреме зображення. Тому краще написи все ж зробити текстом в необхідному форматуванні. Це додасть гнучності і полегшить підтримку як мені так і тобі.

3. Не знаходжу по пошуку "Tixid / чужа гра у статусі Очікує". Мабуть це має бути компонент "Tixid / не моя гра у статусі Очікує".
4. "Стіл / не моя гра у статусі Очікує" - є перехід лише в меню. Як переходити на почату гру? Автоматично, коли хост її запустив? Що має відбутись при натисканні не хоста на кнопку "Очікує" коли гра запущена, але ще не розпочата? Тобто коли хост ще налаштовує гру? Просто блокувати її якщо гра не розпочата?

5. Спливаюче повідомлення.

- Воно в тебе завжди (error, success) помаранчеве. Можливо варо було б замінити на зелене/червоне?
- При появі воно не зникає. Наприклад, "копіювати ID" буде завжди показуватись. Навіть якщо користувач записав у буфер щось інше. І лише помилка при копіюванні змінить повідомлення - покаже "Не можу скопіювати ID". Подумай як краще зробити. Я поки дав йому таймаут 3сек. Через 3 сек воно зникає, і при повторному натисканні знов з'являється на 3 сек.
- При появі це повідомлення зсуває весь контент вниз. Це виглядає як стрибок всього контенту. Виглядає не дуже добре. А при зниканні буде ще один стрибок - в гору. Пропоную переглянути механізм появи/зникнення - або зробити повідомлення над контентом (наприклад, над полем "Tixid"), або зарезервувати це місце і просто зробити його пустим з самого початку.
