export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-lg
        bg-[#1a1a1a]
        ${className}
      `}
    >
      <div
        className="
          absolute
          inset-0
          -translate-x-full
          animate-shimmer
          bg-gradient-to-r
          from-transparent
          via-white/5
          to-transparent
        "
      />
    </div>
  );
}
