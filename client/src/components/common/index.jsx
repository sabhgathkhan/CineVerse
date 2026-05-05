// ─── Spinner.jsx ──────────────────────────────────────────────────────────
export function Spinner({ size = "md", className = "" }) {
  const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizeMap[size]} border-2 border-dark-500 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  );
}

// ─── StarRating.jsx ───────────────────────────────────────────────────────
export function StarDisplay({ rating, max = 5, size = "sm" }) {
  const sizeMap = { sm: "text-sm", md: "text-base", lg: "text-lg" };
  const filled = Math.round(rating * 2) / 2; // Round to nearest 0.5

  return (
    <div className={`flex items-center gap-0.5 ${sizeMap[size]}`}>
      {Array.from({ length: max }).map((_, i) => {
        const isFull = i + 1 <= filled;
        const isHalf = !isFull && i + 0.5 <= filled;
        return (
          <span key={i} className={isFull || isHalf ? "text-yellow-400" : "text-gray-600"}>
            {isFull ? "★" : isHalf ? "☆" : "☆"}
          </span>
        );
      })}
      <span className="ml-1 text-gray-400 text-xs">{rating.toFixed(1)}</span>
    </div>
  );
}

export function StarPicker({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className={`text-2xl transition-colors ${
            i < value ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── EmptyState.jsx ───────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {Icon && <Icon size={48} className="text-gray-600" />}
      <div>
        <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
        {description && <p className="text-gray-500 mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── ErrorMessage.jsx ─────────────────────────────────────────────────────
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-red-400 text-sm">{message || "Something went wrong."}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}
