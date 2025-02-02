import css from "./buttons.scss";
export const Button = ({ type, text }) => {
  return (
    <>
      <button type={type} className={css.btn}>
        {text}
      </button>
    </>
  );
};
