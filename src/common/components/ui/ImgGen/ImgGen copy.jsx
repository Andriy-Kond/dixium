import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLoadedPreview } from "redux/game/localPersonalSlice.js";
import { selectPreloadImg } from "redux/selectors.js";
import { getImageUrl } from "utils/generals/getImageUrl.js";

const previewSizes = [100, 200, 400, 800]; // для прев'ю
const largeSizes = [300, 600, 1200, 2400]; // для каруселі

function determineLargeSize(currentSrc) {
  // Визначаємо, яке прев’ю було використано
  let selectedPreviewSize = 100; // За замовчуванням найменше
  previewSizes.forEach(size => {
    if (currentSrc.includes(`w_${size}`)) {
      selectedPreviewSize = size;
    }
  });

  // Знаходимо відповідний великий розмір
  const sizeIndex = previewSizes.indexOf(selectedPreviewSize);
  return largeSizes[sizeIndex] || 600; // Компроміс, якщо не знайдено
}

export default function ImgGen({ className, publicId, isBig }) {
  const dispatch = useDispatch();
  const { loadedPreviews, totalPreviews, previews } =
    useSelector(selectPreloadImg);

  const width = isBig ? 300 : 100; // Різні розміри для каруселі і прев’ю
  const imgRef = useRef(null);

  const imageUrl = useMemo(() => {
    return getImageUrl({ publicId, width });
  }, [publicId, width]);

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
  // useEffect(() => {
  //   const imgElement = imgRef.current;
  //   let linkElement = null;

  //   const handleLoad = () => {
  //     const currentSrc = imgElement.currentSrc;

  //     // Визначаємо, яке прев’ю було використано
  //     let selectedPreviewSize = 100; // За замовчуванням найменше
  //     previewSizes.forEach(size => {
  //       if (currentSrc.includes(`w_${size}`)) {
  //         selectedPreviewSize = size;
  //       }
  //     });

  //     // Знаходимо відповідний великий розмір
  //     const sizeIndex = previewSizes.indexOf(selectedPreviewSize);
  //     const largeSize = largeSizes[sizeIndex] || 600; // Компроміс, якщо не знайдено
  //     const preloadUrl = getImageUrl({ publicId, width: largeSize });

  //     linkElement = document.createElement("link");
  //     linkElement.rel = "preload";
  //     linkElement.as = "image";
  //     linkElement.href = preloadUrl;
  //     document.head.appendChild(linkElement);
  //   };

  //   if (!isBig && imgElement) {
  //     imgElement.addEventListener("load", handleLoad);

  //     return () => {
  //       imgElement.removeEventListener("load", handleLoad);
  //       if (linkElement) document.head.removeChild(linkElement);
  //     };
  //   }
  // }, [isBig, publicId]);

  useEffect(() => {
    const imgElement = imgRef.current;

    const handleLoad = () => {
      const currentSrc = imgElement.currentSrc;
      dispatch(addLoadedPreview({ publicId, currentSrc }));
    };

    if (!isBig && imgElement) {
      imgElement.addEventListener("load", handleLoad);

      return () => imgElement.removeEventListener("load", handleLoad);
    }
  }, [isBig, publicId, dispatch]);

  // Предзавантаження великих зображень через додавання rel="preload" до link: <link rel="preload"> і href великого зображення
  useEffect(() => {
    let linkElement = null;

    if (!isBig && loadedPreviews === totalPreviews && totalPreviews > 0) {
      previews.forEach(({ publicId, currentSrc }) => {
        const largeSize = determineLargeSize(currentSrc);
        const preloadUrl = getImageUrl({ publicId, width: largeSize });

        linkElement = document.createElement("link");
        linkElement.rel = "preload";
        linkElement.as = "image";
        linkElement.href = preloadUrl;
        document.head.appendChild(linkElement);
      });
    }

    return () => {
      if (linkElement) document.head.removeChild(linkElement);
    };
  }, [isBig, loadedPreviews, totalPreviews, previews]);

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
    </>
  );
}
