import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { db, TABLE, uploadImage } from "../../../lib/supabase";
import {
  serviceRequestSchema,
  JURISDICTIONS,
  type ServiceRequestInsert,
} from "./schema";
import { Field, controlClasses, controlErrorClasses } from "./Field";
import { ImageUploader } from "./ImageUploader";
import { StepIndicator } from "./StepIndicator";
import { SuccessCard } from "./SuccessCard";
import {
  IssueIcon,
  DescriptionIcon,
  ImageIcon,
  JurisdictionIcon,
  LocationIcon,
  UserIcon,
  PhoneIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from "./icons";

const STEP1_FIELDS = ["issue", "description"] as const;

/** Pull the first message out of a TanStack Form field's error list. */
function firstError(errors: unknown[]): string | undefined {
  const e = errors?.[0] as { message?: string } | string | undefined;
  if (!e) return undefined;
  return typeof e === "string" ? e : e.message;
}

export function RequestForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      issue: "",
      description: "",
      jurisdiction: "",
      location: "",
      reporter: "",
      reporter_contact: "",
    },
    validators: { onSubmit: serviceRequestSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(false);
      try {
        const images = await Promise.all(files.map(uploadImage));
        const payload: ServiceRequestInsert = { ...value, images };
        const { error } = await db.from(TABLE).insert(payload);
        if (error) throw error;
        setSubmitted(true);
      } catch (err) {
        console.error(err);
        setSubmitError(true);
      }
    },
  });

  async function goNext() {
    const results = await Promise.all(
      STEP1_FIELDS.map((name) => form.validateField(name, "change")),
    );
    if (results.every((errs) => errs.length === 0)) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Enter advances to the next field in the current step (last field = step action).
  // Textareas keep Enter as a newline; buttons keep their default click.
  function handleEnter(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter") return;
    const el = e.target as HTMLElement;
    if (el.tagName === "TEXTAREA" || el.tagName === "BUTTON") return;

    e.preventDefault(); // also stops Enter from implicitly submitting the form
    const stepEl = el.closest("[data-step]");
    if (!stepEl) return;

    const fields = Array.from(
      stepEl.querySelectorAll<HTMLElement>("input, select, textarea"),
    ).filter((f) => f.offsetParent !== null && !(f as HTMLInputElement).disabled);

    const next = fields[fields.indexOf(el) + 1];
    if (next) next.focus();
    else if (step === 1) goNext();
    else form.handleSubmit();
  }

  function reset() {
    form.reset();
    setFiles([]);
    setSubmitError(false);
    setSubmitted(false);
    setStep(1);
  }

  if (submitted) return <SuccessCard onReset={reset} />;

  return (
    <div>
      <StepIndicator step={step} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        onKeyDown={handleEnter}
        className="space-y-6"
        noValidate
      >
        {/* ---------------- STEP 1 ---------------- */}
        <div data-step="1" className={`space-y-6 ${step === 1 ? "" : "hidden"}`}>
          <form.Field
            name="issue"
            validators={{ onChange: serviceRequestSchema.shape.issue }}
          >
            {(field) => {
              const err = firstError(field.state.meta.errors);
              return (
                <Field htmlFor="issue" icon={<IssueIcon />} label="Issue" error={err}>
                  <input
                    id="issue"
                    type="text"
                    placeholder="Faulty A/C"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`${controlClasses} ${err ? controlErrorClasses : ""}`}
                  />
                </Field>
              );
            }}
          </form.Field>

          <form.Field
            name="description"
            validators={{ onChange: serviceRequestSchema.shape.description }}
          >
            {(field) => {
              const err = firstError(field.state.meta.errors);
              return (
                <Field
                  htmlFor="description"
                  icon={<DescriptionIcon />}
                  label="Description - please provide as much detail as possible"
                  error={err}
                >
                  <textarea
                    id="description"
                    placeholder="Describe the issue"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`${controlClasses} min-h-28 ${err ? controlErrorClasses : ""}`}
                  />
                </Field>
              );
            }}
          </form.Field>

          <Field
            htmlFor="images"
            icon={<ImageIcon />}
            label={
              <>
                Images <span className="font-light text-muted">(optional)</span>
              </>
            }
          >
            <ImageUploader files={files} onChange={setFiles} />
          </Field>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={goNext}
              className="bg-primary text-white px-6 py-2.5 rounded-control hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white flex items-center gap-2 font-medium transition-all duration-150"
            >
              Next
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* ---------------- STEP 2 ---------------- */}
        <div data-step="2" className={`space-y-6 ${step === 2 ? "" : "hidden"}`}>
          <form.Field
            name="jurisdiction"
            validators={{ onChange: serviceRequestSchema.shape.jurisdiction }}
          >
            {(field) => {
              const err = firstError(field.state.meta.errors);
              return (
                <Field
                  htmlFor="jurisdiction"
                  icon={<JurisdictionIcon />}
                  label="Area / Jurisdiction"
                  error={err}
                >
                  <div className="relative">
                    <select
                      id="jurisdiction"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`${controlClasses} appearance-none pr-9 ${field.state.value === "" ? "text-muted" : ""
                        } ${err ? controlErrorClasses : ""}`}
                    >
                      <option value="" disabled>
                        Select an area...
                      </option>
                      {JURISDICTIONS.map((j) => (
                        <option key={j} value={j} className="text-ink">
                          {j}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </Field>
              );
            }}
          </form.Field>

          <form.Field
            name="location"
            validators={{ onChange: serviceRequestSchema.shape.location }}
          >
            {(field) => {
              const err = firstError(field.state.meta.errors);
              return (
                <Field
                  htmlFor="location"
                  icon={<LocationIcon />}
                  label="Location"
                  error={err}
                >
                  <input
                    id="location"
                    type="text"
                    placeholder="Petroleum Building Room 101"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`${controlClasses} ${err ? controlErrorClasses : ""}`}
                  />
                </Field>
              );
            }}
          </form.Field>

          <div className="flex space-x-2 not-md:flex-col not-md:space-x-0 not-md:space-y-4">
            <div className="w-full md:w-1/2">
              <form.Field
                name="reporter"
                validators={{ onChange: serviceRequestSchema.shape.reporter }}
              >
                {(field) => {
                  const err = firstError(field.state.meta.errors);
                  return (
                    <Field
                      htmlFor="reporter"
                      icon={<UserIcon />}
                      label="Your Name"
                      error={err}
                    >
                      <input
                        id="reporter"
                        type="text"
                        placeholder="John Doe"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={`${controlClasses} ${err ? controlErrorClasses : ""}`}
                      />
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <div className="w-full md:w-1/2">
              <form.Field
                name="reporter_contact"
                validators={{ onChange: serviceRequestSchema.shape.reporter_contact }}
              >
                {(field) => {
                  const err = firstError(field.state.meta.errors);
                  return (
                    <Field
                      htmlFor="reporter_contact"
                      icon={<PhoneIcon />}
                      label="Contact"
                      error={err}
                    >
                      <input
                        id="reporter_contact"
                        type="tel"
                        placeholder="0548666090"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={`${controlClasses} ${err ? controlErrorClasses : ""}`}
                      />
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <div>
            <p
              className={`text-error text-center mb-2 transition-all duration-300 ${submitError
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2"
                }`}
            >
              Failed to submit request. Try again.
            </p>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <div className="flex gap-3 mb-8">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-control border border-primary text-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white disabled:opacity-70 flex items-center gap-2 font-[500] transition-all duration-150"
                  >
                    <ArrowLeftIcon size={16} />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-white py-2.5 rounded-control hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-150"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 my-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <span className="font-[500]">Submit Request</span>
                    )}
                  </button>
                </div>
              )}
            </form.Subscribe>
          </div>
        </div>
      </form>
    </div>
  );
}
