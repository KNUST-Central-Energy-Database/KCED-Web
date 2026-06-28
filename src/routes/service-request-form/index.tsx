import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequestForm } from "./components/RequestForm";

export const Route = createFileRoute("/service-request-form/")({
  component: ServiceRequestFormPage,
});

function ServiceRequestFormPage() {
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    if (!showEmergency) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmergency(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEmergency]);

  return (
    <>
      <header className="border-b border-outline">
        <div className="py-6 max-w-7xl mx-auto px-6">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/assets/images/knust-logo.png"
              alt="KNUST Crest"
              className="h-14 w-auto"
            />
            <div className="pt-4 flex flex-col">
              <h1 className="font-garamond font-semibold text-xl tracking-tight m-0 leading-tight">
                KNUST
              </h1>
              <p className="text-[0.7rem] font-medium m-0 -mt-0.5 leading-normal">
                Central Energy Database
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Form Title */}
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-tight">
            Service Request
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            Fill out the form below to submit a new service request.
          </p>
        </div>

        {/* Form card */}
        <div className="border border-outline rounded-2xl p-4 md:p-8">
          <RequestForm />
        </div>
      </main>
    </>
  );
}