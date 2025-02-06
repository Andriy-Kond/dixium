import css from "./Chat.module.scss";

export default function Chat({ messages = [] }) {
  console.log("Chat >> messages:::", messages);
  const elements = messages.map(({ id, type, message }) => {
    const className = type === "your" ? css.yourMessage : css.userMessage;

    return (
      <p key={id} className={className}>
        {message}
      </p>
    );
  });

  return (
    <>
      <h2>Chat</h2>

      <div>{elements}</div>
    </>
  );
}
