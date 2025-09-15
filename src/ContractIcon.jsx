import React from 'react';
export default function ContractIcon({ className, ...props }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="36"
        fontWeight="bold"
      >
        CX
      </text>
    </svg>
  );
}

