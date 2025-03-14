import css from "./Mask.module.scss";

export default function Mask({ rotation = "30", top = "50", left = "50" }) {
  return (
    <>
      <div className={css.mask}>
        <div
          className={css.card}
          style={{
            "--rotation": `${rotation}deg`,
            "--topOffset": `${top}%`,
            "--leftOffset": `${left}%`,
          }}></div>
      </div>
    </>
  );
}
