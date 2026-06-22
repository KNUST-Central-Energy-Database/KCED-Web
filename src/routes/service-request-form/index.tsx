import { createFileRoute } from "@tanstack/react-router";
import { RequestForm } from "./components/RequestForm";

export const Route = createFileRoute("/service-request-form/")({
  component: ServiceRequestFormPage,
});

function ServiceRequestFormPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 space-y-6 not-md:mt-4">
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
        <span className="underline underline-offset-2 hover:cursor-pointer">here</span>.
      </p>

      <RequestForm />
    </main>
  );
}
