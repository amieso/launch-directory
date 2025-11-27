import React from 'react';

export function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.001 6.167a9.956 9.956 0 0 1-6.001 2 9.956 9.956 0 0 1-6.001-2m1.834-3h8.334a2 2 0 0 1 2 2v5.666a2 2 0 0 1-2 2H3.833a2 2 0 0 1-2-2V5.166a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}
