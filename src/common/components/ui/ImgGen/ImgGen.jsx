import { useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";

import { addPreloadUrl } from "redux/game/localPersonalSlice.js";
import { getImageUrl } from "utils/generals/getImageUrl.js";

const previewSizes = [100, 200, 400, 800]; // для прев'ю
const largeSizes = [300, 600, 1200, 2400]; // для каруселі

function determineLargeSize(currentSrc) {
  if (!currentSrc) {
    // Якщо currentSrc не визначений
    // console.log("currentSrc is null, defaulting to 600");
    return 600; // компроміс, якщо currentSrc відсутній
  }

  const sizeIndex = previewSizes.findIndex(size =>
    currentSrc.includes(`w_${size}`),
  );
  return sizeIndex !== -1 ? largeSizes[sizeIndex] : 600; // Якщо не знайдено, повертаємо 600 як компроміс
}

export default function ImgGen({ className, publicId, isBig, isNeedPreload }) {
  const dispatch = useDispatch();

  const width = isBig ? 300 : 100; // Різні розміри для каруселі і прев’ю
  const imgRef = useRef(null);

  // Для зображення за замовчуванням (src у img)
  const imageUrl = useMemo(
    () => getImageUrl({ publicId, width }),
    [publicId, width],
  );

  // Для srcSet у img
  const srcSet = useMemo(() => {
    const widthSizes = isBig ? largeSizes : previewSizes;
    return widthSizes
      .map(w => `${getImageUrl({ publicId, width: w })} ${w}w`)
      .join(", ");
  }, [isBig, publicId]);

  // Для sizes у img
  const sizes = isBig
    ? "(max-width: 320px) 300px, (max-width: 768px) 600px, 1200px"
    : "(max-width: 320px) 100px, (max-width: 768px) 200px, 400px";

  // Відстежуємо завантаження прев’ю
  useEffect(() => {
    const imgElement = imgRef.current;
    if (isNeedPreload && imgElement) {
      const handleLoad = () => {
        const currentSrc = imgElement.currentSrc;
        if (currentSrc) {
          const largeSize = determineLargeSize(currentSrc);
          const preloadUrl = getImageUrl({ publicId, width: largeSize });
          dispatch(addPreloadUrl({ url: preloadUrl, publicId }));
        }
      };
      imgElement.addEventListener("load", handleLoad);
      return () => imgElement.removeEventListener("load", handleLoad);
    }
  }, [isNeedPreload, dispatch, publicId]);

  return (
    <>
      <img
        className={className}
        ref={imgRef}
        alt={isBig ? "enlarged card" : "card"}
        src={imageUrl}
        srcSet={srcSet}
        sizes={sizes}
        fetchpriority={isBig ? "high" : "auto"}
        loading="lazy"
      />
    </>
  );
}
