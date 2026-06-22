import type { ReactNode } from "react";

/** Shared control styling (mirrors the app's InputDecorationTheme:
 *  white fill, solid #E2E4E1 outline, 12px radius, primary focus border). */
export const controlClasses =
  "w-full font-light p-2.5 bg-white rounded-control border border-outline " +
  "focus:outline-none focus:border-primary transition-colors " +
  "placeholder:font-light placeholder:text-muted";

export const controlErrorClasses = "border-error";

type FieldProps = {
  htmlFor?: string;
  icon: ReactNode;
  label: ReactNode;
  children: ReactNode;
  error?: string;
};

/** Label row (icon + text) above a control, with an optional inline error. */
export function Field({ htmlFor, icon, label, children, error }: FieldProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <span className="shrink-0 text-muted">{icon}</span>
        <label htmlFor={htmlFor} className="font-display font-semibold">
          {label}
        </label>
      </div>
      {children}
      {error && <p className="text-sm text-error font-light">{error}</p>}
    </div>
  );
}
