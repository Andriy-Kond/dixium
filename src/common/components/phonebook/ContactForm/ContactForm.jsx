import { AccountCircle } from "@mui/icons-material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Box, Fab, TextField } from "@mui/material";
import { useState } from "react";
import PhoneEnabledRoundedIcon from "@mui/icons-material/PhoneEnabledRounded";

export default function ContactForm({
  contact = "",
  btnText = "button",
  handleContact,
}) {
  const [name, setName] = useState(contact.name ?? "");
  const [number, setNumber] = useState(contact.number ?? "");

  const clearState = () => {
    setName("");
    setNumber("");
  };

  const modifyContact = e => {
    const { name, value } = e.currentTarget;

    switch (name) {
      case "name":
        return setName(value);

      case "number":
        return setNumber(value);

      default:
        throw new Error(`Cannot to process the case of ${name}`);
    }
  };

  return (
    <>
      <form
        onSubmit={e => {
          handleContact(e, name, number);
          clearState();
        }}>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <AccountCircle sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            label="Name"
            placeholder="Enter NAME here"
            multiline
            variant="standard"
            type="text"
            name="name"
            value={name}
            onChange={modifyContact}
            required
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <PhoneEnabledRoundedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          />
          <TextField
            id="standard-textarea"
            label="Phone"
            placeholder="Enter PHONE here"
            multiline
            variant="standard"
            type="tel"
            name="number"
            // required
            value={number}
            onChange={modifyContact}
          />
        </Box>

        <Fab color="primary" aria-label="add" type="submit">
          <AddOutlinedIcon />
        </Fab>
      </form>
    </>
  );
}
