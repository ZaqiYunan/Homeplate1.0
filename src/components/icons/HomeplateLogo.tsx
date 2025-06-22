import type { SVGProps } from "react";

export function HomeplateLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-label="Homeplate Logo"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Plate */}
        <circle cx="50" cy="50" r="25" />

        {/* Fork on the left */}
        <g transform="rotate(-15 25 50)">
          <path d="M25 65 V 35" />
          <path d="M20 35 V 25 C 20 20, 25 20, 25 25 V 35" />
          <path d="M30 35 V 25 C 30 20, 25 20, 25 25 V 35" />
        </g>

        {/* Spoon on the right */}
        <g transform="rotate(15 75 50)">
          <path d="M75 65 V 40" />
          <path d="M75 40 C 82 40, 82 30, 75 30 C 68 30, 68 40, 75 40 Z" fill="currentColor"/>
        </g>
      </g>
    </svg>
  );
}
