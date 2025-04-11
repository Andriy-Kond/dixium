import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";

const { REACT_APP_CLOUD_NAME } = process.env;

const cld = new Cloudinary({
  cloud: { cloudName: "dixium" },
  url: { secure: true },
});

// Функція для генерації URL
export const getImageUrl = ({
  publicId,
  width,
  dpr = window.devicePixelRatio || 1,
}) => {
  // console.log(" width:::", width);
  // console.log(" dpr:::", dpr);

  return (
    cld
      .image(publicId)
      .resize(scale().width(width)) // Задати ширину
      .format("auto") // Автоматичний вибір формату (WebP, JPEG тощо)
      .delivery("q_auto") // автоматична якість
      // .delivery("dpr_auto") // dpr_auto - автоматична щільність для retina (1x, 2x, 3x) !Не потрібно для веб-додатків, бо ширина задається у компоненті ImgGen, який дозволяє браузеру обирати необхідне зображення під різні типи і розміри дисплеїв. Але потрібно для натівних додатків (React-native)! Але тоді базову ширину краще передавати базово. Наприклад, 100 для прев’ю, 300 для каруселі, без srcSet e ImgGen
      .toURL()
  );
};

// // Ручне визначення щільності через window.devicePixelRatio
// export const getImageUrl_ = ({
//   publicId,
//   width,
//   dpr = window.devicePixelRatio || 1,
// }) => {
//   console.log(" dpr:::", dpr);
//   return (
//     cld
//       .image(publicId)
//       .resize(scale().width(width)) // Задаємо ширину - створить ширину 2400px для dpr3.0 і 600px для dpr1.0 автоматично. Тож, можливо замість .delivery(`dpr_${dpr}.0`) треба використовувати .delivery(`dpr_auto`)
//       .format("auto")
//       .quality("auto")
//       // .delivery("q_auto")
//       .delivery(`dpr_${dpr}.0`) // Явно задаємо щільність (наприклад, dpr_2.0)
//       .toURL()
//   );
// };
