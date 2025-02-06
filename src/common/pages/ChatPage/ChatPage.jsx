import { nanoid } from "@reduxjs/toolkit";
import Chat from "common/components/chat/Chat";
import ChatForm from "common/components/chat/ChatForm";
import SigninChatForm from "common/components/chat/SigninChatForm";
import { useCallback, useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";

//% Connection to backend (to web-socket server)
const URL = process.env.REACT_APP_BASE_URL; // address of web-socket server
// для тестів:
// REACT_APP_BASE_URL=http://localhost:3001
// для деплоя:
// REACT_APP_BASE_URL=https://m3-full-rest-api-project-decorator-full.onrender.com
const socket = io.connect(URL);

export default function ChatPage() {
  const [nickName, setNickName] = useState("");
  const [messages, setMessages] = useState([]); // array of messages (this user and other users)

  //% Hang event listener of events "chat-message" (messages from other users)
  useEffect(() => {
    const handleChatMessage = message => {
      setMessages(prevState => {
        const newMessage = {
          id: nanoid(),
          type: "user",
          message,
        };

        return [newMessage, ...prevState];
      });
    };

    socket.on("chat-message", handleChatMessage);

    // Remove listener before next render:
    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, []);

  const addNickname = useCallback(name => {
    setNickName(name);
  }, []);

  const addMessage = useCallback(({ message }) => {
    setMessages(prevState => {
      const newMessage = {
        id: nanoid(),
        type: "your",
        message,
      };
      return [newMessage, ...prevState];
    });

    socket.emit("chat-message", message); // Frontend sending message to backend:
  }, []);

  return (
    <>
      <h2>Chat Page</h2>
      {!nickName && <SigninChatForm onSubmit={addNickname} />}
      {nickName && <ChatForm onSubmit={addMessage} />}
      {nickName && <Chat messages={messages} />}
    </>
  );
}
