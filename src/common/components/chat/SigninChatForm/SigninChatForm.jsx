import { useState } from "react";

const defaultNicknameState = { name: "" };

export default function SigninChatForm({ onSubmit }) {
  const [nickname, seNickname] = useState(defaultNicknameState);

  const handleChange = e => {
    const { name, value } = e.target;
    seNickname(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ ...nickname });
    seNickname(defaultNicknameState);
  };

  return (
    <>
      <h2>Signin Chat Form</h2>

      <form action="" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" name="Name" onChange={handleChange} />
        </label>

        <button type="submit">Send</button>
      </form>
    </>
  );
}
