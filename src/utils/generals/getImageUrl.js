import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";

const { REACT_APP_CLOUD_NAME } = process.env;

const cld = new Cloudinary({
  cloud: { cloudName: "dixium" },
  url: { secure: true },
});

// Функція для генерації URL
export const getImageUrl = ({ publicId, width }) => {
  return cld
    .image(publicId)
    .resize(scale().width(width)) // Задати ширину
    .format("auto") // Автоматичний вибір формату (WebP, JPEG тощо)
    .delivery("q_auto") // автоматична якість
    .delivery("dpr_auto") // автоматична щільність для retina (1x, 2x, 3x)
    .toURL();
};

// Ручне визначення щільності через window.devicePixelRatio
// import { Cloudinary } from "@cloudinary/url-gen";
// import { scale } from "@cloudinary/url-gen/actions/resize";

// const cld = new Cloudinary({
//   cloud: { cloudName: "your-cloud-name" },
//   url: { secure: true },
// });

// const getImageUrl = (publicId, width, dpr = window.devicePixelRatio || 1) => {
//   return cld
//     .image(publicId)
//     .resize(scale().width(width)) // Задаємо ширину
//     .format("auto")
//     .quality("auto")
//     .delivery(`dpr_${dpr}`) // Явно задаємо щільність (наприклад, dpr_2.0)
//     .toURL();
// };
