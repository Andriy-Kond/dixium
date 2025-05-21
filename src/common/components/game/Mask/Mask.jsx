import css from "./Mask.module.scss";

export default function Mask({
  rotation = "0",
  top = "0",
  left = "0",
  translate = "0",
  position = "relative",
}) {
  return (
    <>
      <div className={css.mask}>
        <div
          className={css.card}
          style={{
            "--rotation": `${rotation}deg`,
            "--topOffset": `${top}%`,
            "--leftOffset": `${left}%`,
            "--translate": `-${translate}%`,
            "--position": `${position}`,
          }}>
          <span>TIXID</span>
        </div>
      </div>
    </>
  );
}
