import { createSocialImage, alt, contentType, size } from "./social-image";

export { alt, contentType, size };

export default async function Image() {
  return createSocialImage();
}
