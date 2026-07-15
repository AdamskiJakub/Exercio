import Image, { ImageProps } from "next/image";
import logoSrc from "public/logo.svg";

export function Logo(
  props: Omit<ImageProps, "src" | "alt" | "width" | "height">,
) {
  return <Image src={logoSrc} alt="Exercio logo" {...props} />;
}
