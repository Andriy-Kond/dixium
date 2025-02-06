import { useState } from "react";

const defaultMessage = { message: "" };

export default function ChatForm({ onSubmit }) {
  const [message, setMessage] = useState(defaultMessage);

  const handleChange = e => {
    const { name, value } = e.target;
    setMessage(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!message.message.trim()) return; // Not allow empty messages
    onSubmit({ ...message });
    setMessage(defaultMessage);
  };

  return (
    <>
      <h2>Chat Form</h2>

      <form action="" onSubmit={handleSubmit}>
        <label>
          Message
          <input type="text" name="message" onChange={handleChange} />
        </label>

        <button type="submit">Send</button>
      </form>
    </>
  );
}
