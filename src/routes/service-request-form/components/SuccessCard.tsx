import { CheckIcon } from "./icons";

type Props = { onReset: () => void };

export function SuccessCard({ onReset }: Props) {
  return (
    <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300 py-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-soft">
        <CheckIcon size={36} className="text-primary" />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Request Submitted
        </h2>
        <p className="text-sm text-muted-foreground font-light">
          Your service request has been submitted. Our maintenance team will review it shortly.
        </p>
      </div>
    </div>
  );
}