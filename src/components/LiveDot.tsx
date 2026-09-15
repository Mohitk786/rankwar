export function LiveDot({ className = "h-1.5 w-1.5" }: { className?: string }) {
  return (
    <span className={`relative flex ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className={`relative inline-flex rounded-full bg-primary ${className}`} />
    </span>
  );
}
