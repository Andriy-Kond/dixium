import { useMemo } from "react";
import { getImageUrl } from "utils/generals/getImageUrl.js";

export default function ImbGen({ className, publicId, isBig }) {
  const width = isBig ? 300 : 100; // Різні розміри для каруселі і прев’ю

  const imageUrl = useMemo(() => {
    return getImageUrl({ publicId, width });
  }, [publicId, width]); // Залежності: publicId і width

  // const srcSetBig = useMemo(() => {
  //   return `${getImageUrl({ publicId, width: 300 })} 300w,
  //           ${getImageUrl({ publicId, width: 600 })} 600w,
  //           ${getImageUrl({ publicId, width: 1200 })} 1200w`;
  // }, [publicId]); // Залежність тільки від publicId, якщо width фіксований

  // const srcSetPreview = useMemo(() => {
  //   return `${getImageUrl({ publicId, width: 100 })} 100w,
  //           ${getImageUrl({ publicId, width: 200 })} 200w,
  //           ${getImageUrl({ publicId, width: 400 })} 400w`;
  // }, [publicId]); // Залежність тільки від publicId, якщо width фіксований

  const srcSet = useMemo(() => {
    const sizes = isBig
      ? [300, 600, 1200, 2400] // Для каруселі
      : [100, 200, 400, 800]; // Для прев'ю
    return sizes
      .map(w => `${getImageUrl({ publicId, width: w })} ${w}w`)
      .join(", ");
  }, [publicId, isBig]);

  const sizes = isBig
    ? "(max-width: 300px) 300px, (max-width: 768px) 600px, 1200px"
    : "(max-width: 300px) 100px, (max-width: 768px) 200px, 400px";

  return (
    <>
      {/* {isBig ? (
        <img
          className={className}
          alt="enlarged card"
          src={imageUrl} // Базовий розмір
          // Доступні розміри зображень:
          // srcSet={srcSetBig}
          srcSet={srcSet}
          // підказує браузеру, який розмір зображення потрібен залежно від ширини в'юпорту
          // sizes="(max-width: 300px) 300px, (max-width: 768px) 600px, 1200px"
          sizes={sizes}
        />
      ) : (
        <img
          className={className}
          alt="card"
          src={imageUrl}
          // srcSet={srcSetPreview}
          srcSet={srcSet}
          // sizes="(max-width: 320px) 100px, (max-width: 768px) 200px, 400px"
          sizes={sizes}
        />
      )} */}

      <img
        className={className}
        alt={isBig ? "enlarged card" : "card"}
        src={imageUrl}
        srcSet={srcSet}
        sizes={sizes}
      />
    </>
  );
}

// import { useMemo } from "react";
// import { getImageUrl } from "utils/generals/getImageUrl.js";

// export default function ImbGen({ className, publicId, isBig }) {
//   const width = isBig ? 300 : 100; // Різні розміри для каруселі і прев’ю

//   const imageUrl = useMemo(() => {
//     return getImageUrl({ publicId, width });
//   }, [publicId, width]); // Залежності: publicId і width

//   const srcSetBig = useMemo(() => {
//     return `${getImageUrl({ publicId, width: 300 })} 300w,
//             ${getImageUrl({ publicId, width: 600 })} 600w,
//             ${getImageUrl({ publicId, width: 1200 })} 1200w`;
//   }, [publicId]); // Залежність тільки від publicId, якщо width фіксований

//   const srcSetPreview = useMemo(() => {
//     return `${getImageUrl({ publicId, width: 100 })} 100w,
//             ${getImageUrl({ publicId, width: 200 })} 200w,
//             ${getImageUrl({ publicId, width: 400 })} 400w`;
//   }, [publicId]); // Залежність тільки від publicId, якщо width фіксований

//   return (
//     <>
//       {isBig ? (
//         <img
//           className={className}
//           alt="enlarged card"
//           src={getImageUrl({ publicId, width: 300 })} // Базовий розмір
//           // Доступні розміри зображень:
//           srcSet={`
//           ${getImageUrl({ publicId, width: 300 })} 300w,
//           ${getImageUrl({ publicId, width: 600 })} 600w,
//           ${getImageUrl({ publicId, width: 1200 })} 1200w`}
//           // підказує браузеру, який розмір зображення потрібен залежно від ширини в'юпорту
//           sizes="(max-width: 300px) 300px, (max-width: 768px) 600px, 1200px"
//         />
//       ) : (
//         <img
//           className={className}
//           alt="card"
//           src={getImageUrl({ publicId, width: 100 })} // Базовий розмір
//           // Доступні розміри зображень:
//           srcSet={`
//             ${getImageUrl({ publicId, width: 100 })} 100w,
//             ${getImageUrl({ publicId, width: 200 })} 200w,
//             ${getImageUrl({ publicId, width: 400 })} 400w`}
//           // підказує браузеру, який розмір зображення потрібен залежно від ширини в'юпорту
//           sizes="(max-width: 320px) 100px, (max-width: 768px) 200px, 400px"
//         />
//       )}
//     </>
//   );
// }
