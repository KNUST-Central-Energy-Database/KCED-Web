import { CheckIcon } from "./icons";

type Props = { onReset: () => void };

export function SuccessCard({ onReset }: Props) {
  return (
    <div className="bg-card p-10 rounded-2xl border border-outline text-center space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-soft">
        <CheckIcon size={36} className="text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-[800] text-ink font-display">
          Request Submitted!
        </h2>
        <p className="text-muted font-light">
          Thank you. Your service request has been submitted. Our maintenance
          team will review it shortly.
        </p>
      </div>
      <button
        onClick={onReset}
        className="mt-4 text-sm font-medium text-primary hover:text-primary-hover underline underline-offset-4"
      >
        Submit another request
      </button>
    </div>
  );
}
