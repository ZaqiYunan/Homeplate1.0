import type { SVGProps } from "react";

export function HomeplateLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      aria-label="Homeplate Logo"
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="3" />
      <path 
        d="M50 20 Q60 30, 50 50 Q40 30, 50 20 M50 50 Q55 65, 65 70 M50 50 Q45 65, 35 70 M50 50 L50 80" 
        stroke="hsl(var(--primary))" 
        strokeWidth="4"
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50,15 Q55,10 60,15 Q70,25 60,35 Q50,45 40,35 Q30,25 40,15 Q45,10 50,15 Z"
        fill="hsl(var(--accent))"
        transform="translate(0, -3) scale(0.5) translate(50, 20)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 27.5"
          to="360 50 27.5"
          dur="10s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
