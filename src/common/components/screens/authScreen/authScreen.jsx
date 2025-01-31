import AddContact from "./AddContact";
import Filter from "./Filter";
import ContactList from "./ContactList/ContactList";

export default function authScreen() {
  return (
    <>
      <h1>Auth Scree</h1>
      <AddContact />

      <h2>Contacts</h2>
      <Filter />
      <ContactList />
    </>
  );
}
