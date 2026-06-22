import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { RequestForm } from "./components/RequestForm";

export const Route = createFileRoute("/_public/service-request-form/")({
  component: ServiceRequestFormPage,
});

const emergencyContacts = [
  { label: "Fire Service", number: "192", href: "tel:192" },
  {
    label: "KNUST Security",
    number: "+233 32 206 0826",
    href: "tel:+233322060826",
  },
];

function ServiceRequestFormPage() {
  const [showEmergency, setShowEmergency] = useState(false);

  // Close the dialog on Escape for keyboard users.
  useEffect(() => {
    if (!showEmergency) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmergency(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEmergency]);

  return (
    <main className="max-w-3xl mx-auto px-4 space-y-6 pt-24 md:pt-28">
      <div className="text-center">
        <h1 className="font-display font-extrabold text-2xl md:text-3xl pt-4">
          Service Request Form
        </h1>
        <p className="text-center font-light not-md:text-sm text-muted">
          Fill out the form below to submit a new service request.
        </p>
      </div>

      <p className="font-light text-error not-md:text-sm">
        Do NOT use this form for emergencies! Instead, refer to the information{" "}
        <button
          type="button"
          onClick={() => setShowEmergency(true)}
          className="underline underline-offset-2 hover:cursor-pointer font-medium"
        >
          here
        </button>
        .
      </p>

      <RequestForm />

      {showEmergency && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEmergency(false)}
          />

          {/* Card */}
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="bg-red-600 text-white px-5 py-4 flex items-start gap-3">
              <div className="flex-1">
                <p id="emergency-title" className="font-bold text-base flex gap-2 items-center">
                  <TriangleAlert size={18} />Electrical emergency?
                </p>
                <p className="font-light text-red-100 text-sm mt-0.5">
                  Do not use the service request form. Call directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergency(false)}
                aria-label="Close"
                className="shrink-0 -mr-1 -mt-1 p-1 rounded-md hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {emergencyContacts.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <span className="text-xs uppercase tracking-wider text-muted">
                    {c.label}
                  </span>
                  <span className="font-bold text-ink">{c.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
