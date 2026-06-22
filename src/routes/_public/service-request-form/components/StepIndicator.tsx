type Props = { step: 1 | 2 };

const STEPS = ["The Issue", "Location & Contact"] as const;

export function StepIndicator({ step }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
      {STEPS.map((label, i) => {
        const n = (i + 1) as 1 | 2;
        const active = step >= n;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <span
                className={`h-0.5 w-8 sm:w-12 rounded-full transition-colors ${
                  step >= n ? "bg-primary" : "bg-outline"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm font-[600] transition-colors ${
                  active ? "bg-primary text-white" : "bg-card text-muted"
                }`}
              >
                {n}
              </span>
              <span
                className={`text-sm font-[500] font-display not-md:hidden transition-colors ${
                  active ? "" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
