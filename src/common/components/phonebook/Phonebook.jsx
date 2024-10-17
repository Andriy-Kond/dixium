import AddContact from "./AddContact";
import Filter from "./Filter";
import ContactList from "./ContactList/ContactList";

function ImageFinder() {
  return (
    <>
      <h1>Phonebook</h1>
      <AddContact />

      <h2>Contacts</h2>
      <Filter />
      <ContactList />
    </>
  );
}

export default ImageFinder;
