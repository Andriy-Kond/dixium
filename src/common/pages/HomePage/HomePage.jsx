export default function HomePage() {
  return (
    <>
      <h2>Home Page</h2>
      <p>Welcome to the Phonebook App</p>
    </>
  );
}

// ^ Забрати матеріал по id на окремій сторінці, якщо це потрібно:
// const { materialId } = useParams();
// const { data: material, isLoading } = useFetchTaskByIdQuery(materialId);

// ^ Опції хуків запиту:
// & Щоб хук запускався лише тоді коли є реальний materialId треба передати об'єкт налаштувань. В ньому є skip - коли він true хук не буде робити запити:
// const { data: material, isLoading } = useFetchTaskByIdQuery(materialId, {
//   skip: materialId === "",
// або:
//   skip: !materialId
// });

// & Якщо треба робити запит через певний час, то є опція pollingInterval (наприклад, для сповіщення користувача):
// const { data: material, isLoading } = useFetchTaskByIdQuery(materialId, {
//   skip: !materialId,
//   pollingInterval: 3000, // буде робити запит раз у 3 секунди
//   refetchOnFocus, // Робить refetch при перемиканні на іншу сторінку і назад. Щоб працювало обов'язково у store.js додати рядок: setupListeners(store.dispatch);
//   refetchOnReconnect, // Робить refetch при втраті і повторному встановленні зв'язку. Щоб працювало обов'язково у store.js додати рядок: setupListeners(store.dispatch);
// });
