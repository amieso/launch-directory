import React from "react";

type Props = {
  light?: boolean;
};

const Beach: React.FC<Props> = (props) => {
  const color = props.light ? "#fff" : "#000";
  const toColor = props.light ? "#9C9581" : "#595447";
  return (
    <svg viewBox="-21 0 100 20" width={165} height={21} className="font-[550]">
      <defs>
        <linearGradient id="gradientWave" x1="0" x2="0" y1="0" y2="1">
          <stop offset="5%" stopColor={color}></stop>
          <stop offset="95%" stopColor={toColor}></stop>
        </linearGradient>
        <pattern
          id="wave"
          x="0"
          y="3"
          width="120"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            id="wavePath"
            d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
            mask="url(#mask)"
            fill={color}
          >
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="1.5s"
              type="translate"
              from="0,0"
              to="40,0"
              repeatCount="indefinite"
            ></animateTransform>
          </path>
        </pattern>
      </defs>
      <text
        textAnchor="middle"
        fontSize="14px"
        x="27px"
        y="16px"
        fill="url(#wave)"
        fillOpacity="1.0"
      >
        Designed by the beach
      </text>
      <text
        textAnchor="middle"
        fontSize="14px"
        x="27px"
        y="16px"
        fill="url(#gradientWave)"
        fillOpacity="0.4"
      >
        Designed by the beach
      </text>
    </svg>
  );
};

export default Beach;
