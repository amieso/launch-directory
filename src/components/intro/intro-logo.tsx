'use client'

import { useRef, useEffect } from 'react'

interface IntroLogoProps {
  size?: number
  shouldBlink?: boolean
}

// Stable counter outside component to survive StrictMode remounts
let instanceCounter = 0

export function IntroLogo({ size = 160, shouldBlink = false }: IntroLogoProps) {
  // Use ref to keep same ID across StrictMode remounts
  const idRef = useRef<string | null>(null)
  if (idRef.current === null) {
    idRef.current = `intro-${instanceCounter++}`
  }
  const id = idRef.current
  const clipId = `introEyeClip-${id}`

  // Refs for SMIL animate elements to trigger programmatically
  const eyeBlinkRef = useRef<SVGAnimateElement>(null)
  const clipBlinkRef = useRef<SVGAnimateElement>(null)

  // Path for open eye
  const eyeOpen = "M8 4C10.0517 4 11.8618 4.52179 13.127 5.3125C14.4061 6.11201 15 7.08851 15 8C15 8.91149 14.4061 9.88799 13.127 10.6875C11.8618 11.4782 10.0517 12 8 12C5.9483 12 4.13819 11.4782 2.87305 10.6875C1.59387 9.88799 1 8.91149 1 8C1 7.08851 1.59387 6.11201 2.87305 5.3125C4.13819 4.52179 5.9483 4 8 4Z"

  // Path for closed eye (blink) - same as animated-logo.tsx
  const eyeClosed = "M8 7.8C10.0517 7.8 11.8618 7.85 13.127 7.9C14.4061 7.95 15 7.98 15 8C15 8.02 14.4061 8.05 13.127 8.1C11.8618 8.15 10.0517 8.2 8 8.2C5.9483 8.2 4.13819 8.15 2.87305 8.1C1.59387 8.05 1 8.02 1 8C1 7.98 1.59387 7.95 2.87305 7.9C4.13819 7.85 5.9483 7.8 8 7.8Z"

  // Trigger blink animation when shouldBlink becomes true
  useEffect(() => {
    if (shouldBlink) {
      eyeBlinkRef.current?.beginElement()
      clipBlinkRef.current?.beginElement()
    }
  }, [shouldBlink])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={eyeOpen}>
            {/* SMIL animate for clip path - triggered via ref */}
            <animate
              ref={clipBlinkRef}
              attributeName="d"
              dur="0.3s"
              begin="indefinite"
              values={`${eyeOpen};${eyeClosed};${eyeOpen}`}
              keyTimes="0; 0.4; 1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
          </path>
        </clipPath>
        <style>
          {`
            @keyframes traceOuter-${id} {
              from { stroke-dashoffset: -44; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes traceEye-${id} {
              from { stroke-dashoffset: 50; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes tracePupil-${id} {
              from { stroke-dashoffset: -19; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes ghostFade-${id} {
              from { opacity: 0.12; }
              to { opacity: 0; }
            }

            .trace-outer-${id} {
              stroke-dasharray: 44;
              stroke-dashoffset: -44;
              animation: traceOuter-${id} 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.7s forwards;
            }
            .trace-eye-${id} {
              stroke-dasharray: 50;
              stroke-dashoffset: 50;
              animation: traceEye-${id} 1s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
            }
            .trace-pupil-${id} {
              stroke-dasharray: 19;
              stroke-dashoffset: -19;
              animation: tracePupil-${id} 0.8s cubic-bezier(0.65, 0, 0.35, 1) 0s forwards;
            }
            .ghost-layer-${id} {
              opacity: 0.12;
              animation: ghostFade-${id} 0.3s ease-out 1.85s forwards;
            }
          `}
        </style>
      </defs>

      {/* Ghost layer - faint preview that fades after trace */}
      <g className={`ghost-layer-${id}`}>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d={eyeOpen} stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      </g>

      {/* Outer circle - traces in last */}
      <circle
        className={`trace-outer-${id}`}
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Eye shape - traces in second, morphs for blink */}
      <path
        className={`trace-eye-${id}`}
        d={eyeOpen}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      >
        {/* SMIL animate for eye stroke - triggered via ref */}
        <animate
          ref={eyeBlinkRef}
          attributeName="d"
          dur="0.3s"
          begin="indefinite"
          values={`${eyeOpen};${eyeClosed};${eyeOpen}`}
          keyTimes="0; 0.4; 1"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          fill="freeze"
        />
      </path>

      {/* Pupil - clipped by eye shape */}
      <g clipPath={`url(#${clipId})`}>
        <circle
          className={`trace-pupil-${id}`}
          cx="8"
          cy="8"
          r="3"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </g>
    </svg>
  )
}
