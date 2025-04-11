import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPreloadUrl,
  addPreviewId,
  setHasPreloaded,
} from "redux/game/localPersonalSlice.js";
import { selectPreloadImg } from "redux/selectors.js";
import { getImageUrl } from "utils/generals/getImageUrl.js";

const previewSizes = [100, 200, 400, 800]; // для прев'ю
const largeSizes = [300, 600, 1200, 2400]; // для каруселі

function determineLargeSize(currentSrc) {
  if (!currentSrc) {
    // Якщо currentSrc не визначений
    console.log("currentSrc is null, defaulting to 600");
    return 600; // компроміс, якщо currentSrc відсутній
  }

  const sizeIndex = previewSizes.findIndex(size =>
    currentSrc.includes(`w_${size}`),
  );
  return sizeIndex !== -1 ? largeSizes[sizeIndex] : 600; // Якщо не знайдено, повертаємо 600 як компроміс
}

export default function ImgGen({ className, publicId, isBig, isNeedPreload }) {
  const dispatch = useDispatch();
  const { loadedPreviews, totalPreviews, preloadUrls, hasPreloaded } =
    useSelector(selectPreloadImg);

  const width = isBig ? 300 : 100; // Різні розміри для каруселі і прев’ю
  const imgRef = useRef(null);
  const linksRef = useRef([]); // Зберігаємо всі <link> для очищення

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

  // Додаємо publicId до списку прев’ю-зображень
  useEffect(() => {
    if (isNeedPreload) {
      dispatch(addPreviewId(publicId));
    }
  }, [
    publicId,
    isNeedPreload,
    dispatch,
    hasPreloaded,
    preloadUrls,
    totalPreviews,
    loadedPreviews,
  ]);

  // Додаємо слухач для відстеження завантаження прев'ю
  useEffect(() => {
    const imgElement = imgRef.current;
    if (isNeedPreload && imgElement) {
      const handleLoad = () => {
        const currentSrc = imgElement.currentSrc;
        if (currentSrc) {
          const largeSize = determineLargeSize(currentSrc);
          // const preloadUrl = getImageUrl({ publicId, width: largeSize });
          const preloadUrl = `${getImageUrl({
            publicId,
            width: largeSize,
          })}?t=${Date.now()}`;

          // dispatch(addPreloadUrl(preloadUrl));
          dispatch(addPreloadUrl({ url: preloadUrl, publicId }));
        }
      };

      const handleError = err => {
        dispatch(addPreloadUrl(`error: ${err}`)); // Помітка про помилку
      };

      imgElement.addEventListener("load", handleLoad);
      imgElement.addEventListener("error", handleError);
      return () => {
        imgElement.removeEventListener("load", handleLoad);
        imgElement.removeEventListener("error", handleError);
      };
    }
  }, [isNeedPreload, dispatch, publicId]);

  // Предзавантаження великих зображень, коли всі прев'ю готові (через додавання link з rel="preload" до document.head)
  useEffect(() => {
    console.log("isNeedPreload:::", isNeedPreload);

    console.log("hasPreloaded:::", hasPreloaded);
    console.log("preloadUrls:::", preloadUrls);
    console.log("totalPreviews:::", totalPreviews);
    console.log("loadedPreviews:::", loadedPreviews);
    if (
      isNeedPreload &&
      loadedPreviews === totalPreviews &&
      totalPreviews > 0 &&
      !hasPreloaded
    ) {
      console.log("Починаю рендерити великі зображення");
      // linksRef.current.forEach(link => document.head.removeChild(link)); // Очищаємо старі link якщо змінилась довжина масиву карток (додана, чи видалена картка)

      // На випадок великої кількості зображень у preloadUrls треба завантажити їх лише перші 10:
      preloadUrls.slice(0, 10).forEach(preloadUrl => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = preloadUrl;
        link.fetchpriority = "high"; // now in Chrome only
        link.crossorigin = "anonymous"; // для усунення проблеми з sec-fetch-mode: no-cors
        link.onerror = () =>
          console.log(`Failed to preload image: ${preloadUrl}`); // Обробка помилок
        document.head.appendChild(link);
        linksRef.current.push(link); // Зберігаємо для очищення
      });
      console.log(" preloadUrls.slice >> linksRef:::", linksRef.current);

      dispatch(setHasPreloaded()); // Помічаємо, що передзавантаження виконано
    }

    return () => {
      linksRef.current.forEach(link => document.head.removeChild(link));
      linksRef.current = [];
    };
  }, [
    dispatch,
    hasPreloaded,
    isNeedPreload,
    loadedPreviews,
    preloadUrls,
    totalPreviews,
  ]);

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
      />
    </>
  );
}
