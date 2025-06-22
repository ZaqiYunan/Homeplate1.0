import type { ImgHTMLAttributes } from "react";

export function HomeplateLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="https://placehold.co/100x100.png"
      alt="Homeplate Logo"
      {...props}
      data-ai-hint="logo plate"
    />
  );
}
