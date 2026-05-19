export function LeverageBadge({
  leverage,
  direction,
}: {
  leverage: number
  direction: "LONG" | "SHORT"
}) {
  const isLong = direction === "LONG"
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
        isLong
          ? "bg-primary/15 text-primary border-primary/40"
          : "bg-destructive/15 text-destructive border-destructive/40"
      }`}
    >
      <span>{leverage}x</span>
      <span className="opacity-70">·</span>
      <span>{direction}</span>
    </span>
  )
}
