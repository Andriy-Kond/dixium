import { useCallback, useEffect, useMemo, useRef } from "react";
import { getImageUrl } from "utils/generals/getImageUrl.js";

const previewSizes = [100, 200, 400, 800]; // для прев'ю
const largeSizes = [300, 600, 1200, 2400]; // для каруселі

export default function ImgGen({ className, publicId, isBig }) {
  const width = isBig ? 300 : 100; // Різні розміри для каруселі і прев’ю
  const imgRef = useRef(null);

  const imageUrl = useMemo(() => {
    return getImageUrl({ publicId, width });
  }, [publicId, width]);

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
    const sizes = isBig ? largeSizes : previewSizes;

    return sizes
      .map(w => `${getImageUrl({ publicId, width: w })} ${w}w`)
      .join(", ");
  }, [publicId, isBig]);

  const sizes = isBig
    ? "(max-width: 300px) 300px, (max-width: 768px) 600px, 1200px"
    : "(max-width: 300px) 100px, (max-width: 768px) 200px, 400px";

  // Предзавантаження великих зображень через додавання rel="preload" до link: <link rel="preload"> і href великого зображення
  useEffect(() => {
    const imgElement = imgRef.current;
    let linkElement = null;

    const handleLoad = () => {
      const currentSrc = imgElement.currentSrc;

      // Визначаємо, яке прев’ю було використано
      let selectedPreviewSize = 100; // За замовчуванням найменше
      previewSizes.forEach(size => {
        if (currentSrc.includes(`w_${size}`)) {
          selectedPreviewSize = size;
        }
      });

      // Знаходимо відповідний великий розмір
      const sizeIndex = previewSizes.indexOf(selectedPreviewSize);
      const largeSize = largeSizes[sizeIndex] || 600; // Компроміс, якщо не знайдено
      const preloadUrl = getImageUrl({ publicId, width: largeSize });

      const linkElement = document.createElement("link");
      linkElement.rel = "preload";
      linkElement.as = "image";
      linkElement.href = preloadUrl;
      document.head.appendChild(linkElement);
    };

    if (!isBig && imgElement) {
      imgElement.addEventListener("load", handleLoad);

      return () => {
        imgElement.removeEventListener("load", handleLoad);
        if (linkElement) document.head.removeChild(linkElement);
      };
    }
  }, [isBig, publicId]);

  return (
    <>
      <img
        className={className}
        ref={imgRef}
        alt={isBig ? "enlarged card" : "card"}
        src={imageUrl}
        srcSet={srcSet}
        sizes={sizes}
      />

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
    </>
  );
}

// // Якщо покластись на cloudinary, то можна прибрати srcSet:
// function ImgGen({ className, publicId, isBig }) {
//   const width = isBig ? 300 : 100;
//   const imageUrl = useMemo(
//     () => getImageUrl({ publicId, width }),
//     [publicId, width],
//   );
//   return (
//     <img
//       className={className}
//       alt={isBig ? "enlarged card" : "card"}
//       src={imageUrl}
//     />
//   );
// }

// import { useMemo } from "react";
// import { getImageUrl } from "utils/generals/getImageUrl.js";

// export default function ImgGen({ className, publicId, isBig }) {
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
