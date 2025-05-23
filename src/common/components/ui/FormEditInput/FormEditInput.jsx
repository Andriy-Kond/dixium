import { useRef } from "react";
import css from "./FormEditInput.module.scss";

export default function FormEditInput({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
}) {
  const inputRef = useRef(null);
  const handleFocus = () => {
    console.log("on Focus");
    inputRef.current.classList.add(css["input-focused"]);
  };
  const handleBlur = () => {
    console.log("on Blur");

    inputRef.current.classList.remove(css["input-focused"]);
  };

  return (
    <>
      <input
        ref={inputRef}
        className={css.searchInput}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
      />
    </>
  );
}
