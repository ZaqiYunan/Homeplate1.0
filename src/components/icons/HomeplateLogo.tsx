import type { SVGProps } from "react";

export function HomeplateLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-label="Homeplate Logo"
      {...props}
    >
      <g fill="currentColor">
        {/* Spoon */}
        <path d="M83,24 C83,12.2 78.4,2 71,2 S59,12.2 59,24c0,11.3,5.4,20.4,12,20.4S83,35.3,83,24z" />
        <rect x="68.5" y="42" width="5" height="48" rx="2.5" />
        
        {/* Fork */}
        <path d="M10,0 L10,32 H15 V0z M20,0 L20,32 H25 V0z M30,0 L30,32 H35 V0z" />
        <path d="M10,32 C10,38 15,38 15,38 H35 C35,38 40,38 40,32 V25 H10z" />
        <rect x="22.5" y="38" width="5" height="52" rx="2.5" />

        {/* Centerpiece (Steak) */}
        <path d="M50,43 C45,43 41.5,47 42,51.5 C42.5,56 47,58 52,57 C57,56 59.5,50 58,46.5 C56.5,43 53,43 50,43z" />
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M46,47 l8,8" />
            <path d="M54,47 l-8,8" />
        </g>
      </g>
      
      <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
        {/* Rings */}
        <path d="M 69.1,25.9 A 25 25 0 0 0 30.9 25.9" />
        <path d="M 30.9,74.1 A 25 25 0 0 0 69.1 74.1" />

        <path d="M 76.5,30.3 A 32 32 0 0 0 23.5 30.3" />
        <path d="M 23.5,69.7 A 32 32 0 0 0 76.5 69.7" />

        <path d="M 83.4,35.4 A 39 39 0 0 0 16.6 35.4" />
        <path d="M 16.6,64.6 A 39 39 0 0 0 83.4 64.6" />
      </g>
    </svg>
  );
}
