const SCALLOP_LINE =
  "M0 87.9489C4.24911 87.9489 4.2491 83.9533 8.49821 83.9533C12.7473 83.9533 12.7473 87.9489 16.9965 87.9489C19.0552 87.9489 20.1165 87.0119 21.1458 86.045L21.3453 85.8582C22.3757 84.8913 23.4369 83.9533 25.4947 83.9533C27.5534 83.9533 28.6147 84.8913 29.644 85.8582L29.8435 86.045C30.8739 87.0119 31.9352 87.9489 33.9929 87.9489H34.0428C38.242 87.9179 38.259 83.9533 42.4911 83.9533C46.7402 83.9533 46.7402 87.9489 50.9893 87.9489";

export function ScallopStrip({ patternId }: { patternId: string }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none relative z-20 h-3 w-full text-foreground/35"
    >
      <defs>
        <pattern
          id={patternId}
          width="51"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d={SCALLOP_LINE}
            transform="translate(0 -83)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
