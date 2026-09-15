export function FirstPlaceNudge() {
  return (
    <div className="-translate-x-1/2 pointer-events-none absolute bottom-24 left-0 z-50 h-44 w-120">
      <p className="absolute top-0 left-0 max-w-60 -rotate-12 font-hand text-[1.75rem] leading-[1.05] font-semibold text-primary sm:left-5 sm:text-5xl">
        The best spot for attention.
      </p>
      <svg
        viewBox="120 170 530 460"
        className="absolute top-28 -rotate-3 left-12 h-28 w-32 text-primary sm:left-20 sm:h-32 sm:w-36"
        fill="none"
      >
        <defs>
          <marker
            id="rw-first-arrow"
            markerWidth="12"
            markerHeight="12"
            refX="6"
            refY="6"
            viewBox="0 0 12 12"
            orient="auto"
          >
            <polyline
              points="0,6 6,3 0,0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(2 3)"
            />
          </marker>
        </defs>
        <g
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0 -7)"
        >
          <path
            d="M205.66759777069092 201Q134.66759777069092 543 603.6675977706909 599"
            markerEnd="url(#rw-first-arrow)"
          />
        </g>
      </svg>
    </div>
  );
}
