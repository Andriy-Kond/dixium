import { useSelector } from "react-redux";
import {
  useDeleteContactMutation,
  useGetAllContactsQuery,
} from "features/contacts/contactsSlice";
import { selectFilters } from "app/selectors";
import { useState } from "react";
import Modal from "common/components/phonebook/Modal";
import EditContact from "common/components/phonebook/EditContact";
import { Button, ButtonGroup } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function ContactList() {
  const { data: contacts, isFetching } = useGetAllContactsQuery("", {
    // pollingInterval: 3000,
    // skip: false,
    refetchOnMountOrArgChange: true,
    // refetchOnFocus: true,
  });

  const [deleteContact] = useDeleteContactMutation();
  const filter = useSelector(selectFilters);

  const [contactForEdit, setContactForEdit] = useState();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const toggleModal = contact => {
    setIsOpenModal(prevState => !prevState);
    setContactForEdit(contact);
  };

  const removeContact = contactId => deleteContact(contactId);

  const visibleContacts = contacts?.filter(contact => {
    return contact.name
      .toLocaleLowerCase()
      .includes(filter.toLocaleLowerCase());
  });

  return (
    <>
      {!isFetching && (
        <ul>
          {visibleContacts?.map(contact => {
            return (
              <li key={contact.id}>
                <p>
                  {contact.name}: {contact.number}
                </p>

                <ButtonGroup variant="text" aria-label="Basic button group">
                  <Button
                    onClick={() => {
                      toggleModal(contact);
                    }}>
                    <EditIcon />
                  </Button>

                  <Button onClick={() => removeContact(contact.id)}>
                    <DeleteIcon />
                  </Button>
                </ButtonGroup>
              </li>
            );
          })}
        </ul>
      )}
      {isOpenModal && (
        <Modal toggleModal={toggleModal}>
          <EditContact contact={contactForEdit} toggleModal={toggleModal} />
        </Modal>
      )}
    </>
  );
}
