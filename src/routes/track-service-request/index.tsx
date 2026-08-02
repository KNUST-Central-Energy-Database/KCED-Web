import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Circle, Clock, Loader2, SearchX, XCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ServiceRequestStatus } from "@/features/service_request/schema";
import {
  trackServiceRequest,
  type TrackedRequest,
} from "@/features/service_request/services/service_request.service";

// Public tracking page: reporters paste the request number they received when
// submitting (e.g. SR-20240001) and see how far along it is. The `ref` search
// param keeps looked-up requests linkable/shareable.
export const Route = createFileRoute("/track-service-request/")({
  validateSearch: z.object({
    ref: z.string().optional(),
  }),
  component: TrackServiceRequest,
});

const refSchema = z.string().min(1, "Enter a reference number");

type StepStatus = "completed" | "current" | "pending";

const STEPS = [
  { label: "Submitted", description: "Your request has been received." },
  { label: "Assigned", description: "A technician has been assigned to your request." },
  { label: "In Progress", description: "Work is currently underway." },
  { label: "Resolved", description: "Your request has been completed." },
] as const;

/** The active step index for a request's status (cancelled never reaches
 * the stepper — it renders its own banner). */
function currentStep(status: ServiceRequestStatus): number {
  switch (status) {
    case "assigned":
      return 1;
    case "in progress":
      return 2;
    case "resolved":
      return 3;
    default:
      return 0;
  }
}

function stepStatus(index: number, current: number, resolved: boolean): StepStatus {
  // Everything is completed once the request is resolved.
  if (resolved || index < current) return "completed";
  if (index === current) return "current";
  return "pending";
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "completed") return <CheckCircle className="size-5 text-primary" />;
  if (status === "current") return <Clock className="size-5 text-primary" />;
  return <Circle className="size-5 text-outline" />;
}

function TrackServiceRequest() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>();
  const [tracked, setTracked] = useState<TrackedRequest | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function lookup(reference: string) {
    setInputError(undefined);
    setNotFound(false);
    setIsLooking(true);
    try {
      const result = await trackServiceRequest(reference);
      if (!result) {
        setTracked(null);
        setNotFound(true);
      } else {
        setTracked(result);
        navigate({ to: "/track-service-request", search: { ref: result.requestNumber } });
      }
    } catch {
      setInputError("Could not look up the request. Check your connection and try again.");
    } finally {
      setIsLooking(false);
    }
  }

  async function handleLookup() {
    const result = refSchema.safeParse(input.trim());
    if (!result.success) {
      setInputError(result.error.issues[0].message);
      return;
    }
    await lookup(result.data);
  }

  function resetLookup() {
    setTracked(null);
    setNotFound(false);
    setInput("");
    navigate({ to: "/track-service-request", search: {} });
  }

  // Arriving with ?ref= (e.g. a shared link): look it up once on mount.
  const autoLooked = useRef(false);
  useEffect(() => {
    if (ref && !autoLooked.current) {
      autoLooked.current = true;
      lookup(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showStepper = tracked !== null;

  return (
    <>
      <header className="border-b border-outline bg-primary-soft">
        <div className="py-6 max-w-7xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-1">
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

      <main className="max-w-xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col gap-1">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">Track Request</h2>
          {showStepper ? (
            <p className="text-sm text-muted-foreground">
              Reference: <span className="font-medium text-ink">{tracked.requestNumber}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter reference number to track your request.
            </p>
          )}
        </div>

        {!showStepper ? (
          <div className="bg-white border border-outline rounded-4xl p-4 md:p-8 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ref" className="text-sm font-medium">
                Reference Number
              </label>
              <Input
                id="ref"
                placeholder="SR-XXXX"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setInputError(undefined);
                  setNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                aria-invalid={!!inputError || notFound}
              />
              {inputError && <p className="text-xs text-destructive">{inputError}</p>}
              {notFound && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <SearchX className="size-3.5 shrink-0" />
                  No request found with that reference number.
                </p>
              )}
            </div>
            <Button className="w-full" size="lg" onClick={handleLookup} disabled={isLooking}>
              {isLooking ? <Loader2 className="animate-spin" /> : "Track"}
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-outline rounded-2xl p-8">
            {tracked.status === "cancelled" ? (
              // Cancelled requests don't progress — show a banner, not a stepper.
              <div className="flex items-start gap-3">
                <XCircle className="w-7 h-7 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium leading-tight mt-0.5">Cancelled</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    This request has been cancelled. If this is unexpected,
                    please submit a new request.
                  </p>
                </div>
              </div>
            ) : (
              <ol className="relative flex flex-col gap-0">
                {STEPS.map((step, i) => {
                  const status = stepStatus(
                    i,
                    currentStep(tracked.status),
                    tracked.status === "resolved",
                  );
                  const isLast = i === STEPS.length - 1;

                  return (
                    <li key={step.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <StepIcon status={status} />
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 my-1 rounded-full ${status === "completed" ? "bg-primary" : "bg-outline"
                              }`}
                          />
                        )}
                      </div>

                      <div className={isLast ? "pb-0" : "pb-8"}>
                        <p
                          className={`font-medium leading-tight mt-0.5 ${status === "pending" ? "text-muted-foreground" : "text-ink"
                            }`}
                        >
                          {step.label}
                        </p>
                        {status !== "pending" && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <button
              onClick={resetLookup}
              className="mt-6 text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Track a different request
            </button>
          </div>
        )}
      </main>
    </>
  );
}
