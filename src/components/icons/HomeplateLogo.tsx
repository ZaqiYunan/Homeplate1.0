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
        <path d="M83.1,23.4C83.1,10.5,78.2,0,71.5,0C64.8,0,59.9,10.5,59.9,23.4c0,11.2,5.6,20.6,11.6,20.6S83.1,34.6,83.1,23.4z M68.8,47.2V85h5.4V47.2H68.8z"/>
        
        {/* Fork */}
        <path d="M12,20.1c0-5.1-2.6-9.8-6.6-12.7C1.8,4.9,0,8.7,0,13.1v24.1h5.4V85h7.5V37.2h2.9V85h7.5V37.2h2.9V85H34V13.1c0-4.4-1.8-8.2-5.4-10.6c-4,2.8-6.6,7.5-6.6,12.7v7H12V20.1z"/>

        {/* Centerpiece (Steak) */}
        <path d="M50,43.2c-4.1,0-7.4,2.5-7.4,5.5s3.3,5.5,7.4,5.5s7.4-2.5,7.4-5.5S54.1,43.2,50,43.2z M52.2,51.4l-4.9,2.4l-1.2-2.4l4.9-2.4L52.2,51.4z M54.8,47.5l-4.9,2.4l-1.2-2.4l4.9-2.4L54.8,47.5z"/>
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
