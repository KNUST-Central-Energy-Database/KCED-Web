import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { db, TABLE, uploadImage } from "../../../lib/supabase";
import { serviceRequestSchema, JURISDICTIONS } from "./schema";
// import { serviceRequestSchema, JURISDICTIONS, type ServiceRequestInsert } from "./schema";

import { ImageUploader } from "./ImageUploader";
import { StepIndicator } from "./StepIndicator";
import { SuccessCard } from "./SuccessCard";
import { ArrowRightIcon, ArrowLeftIcon } from "./icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

const STEP1_FIELDS: (keyof ServiceRequestForm)[] = ["issue", "description"];

export function RequestForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
  });

  async function goNext() {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // const onSubmit = async (data: ServiceRequestForm) => {
  const onSubmit = async () => {

    setSubmitError(false);
    try {
      // const images = await Promise.all(files.map(uploadImage));
      // const payload: ServiceRequestInsert = { ...data, images };
      // const { error } = await db.from(TABLE).insert(payload);
      // if (error) throw error;
      await new Promise((r) => setTimeout(r, 2000)); // simulate network delay
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError(true);
    }
  };

  function handleReset() {
    reset();
    setFiles([]);
    setSubmitError(false);
    setSubmitted(false);
    setStep(1);
  }

  if (submitted) return <SuccessCard onReset={handleReset} />;

  return (
    <div>
      <StepIndicator step={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* STEP 1 */}
        <div className={step === 1 ? "space-y-6" : "hidden"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="issue">Issue</Label>
            <Input
              id="issue"
              placeholder="Faulty A/C"
              {...register("issue")}
              aria-invalid={!!errors.issue}
            />
            {errors.issue && (
              <p className="text-xs text-destructive">{errors.issue.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="flex flex-wrap gap-x-1">
              Description{" "}
              <span className="font-light text-muted-foreground">
                — please provide as much detail as possible
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue"
              className="min-h-28"
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Images{" "}
              <span className="font-light text-muted-foreground">(optional)</span>
            </Label>
            <ImageUploader files={files} onChange={setFiles} />
          </div>

          <div className="flex justify-end">
            <Button type="button" size='lg' onClick={goNext} className="flex items-center gap-2">
              Next
              <ArrowRightIcon size={16} />
            </Button>
          </div>
        </div>

        {/* STEP 2 */}
        <div className={step === 2 ? "space-y-6" : "hidden"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jurisdiction">Area / Jurisdiction</Label>
            <Select
              onValueChange={(val) => setValue("jurisdiction", val, { shouldValidate: true })}
              value={watch("jurisdiction")}
            >
              <SelectTrigger id="jurisdiction" aria-invalid={!!errors.jurisdiction}>
                <SelectValue placeholder="Select an area..." />
              </SelectTrigger>
              <SelectContent>
                {JURISDICTIONS.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jurisdiction && (
              <p className="text-xs text-destructive">{errors.jurisdiction.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Petroleum Building Room 101"
              {...register("location")}
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="flex gap-2 not-md:flex-col">
            <div className="flex flex-col gap-1.5 w-full">
              <Label htmlFor="reporter">Your Name</Label>
              <Input
                id="reporter"
                placeholder="John Doe"
                {...register("reporter")}
                aria-invalid={!!errors.reporter}
              />
              {errors.reporter && (
                <p className="text-xs text-destructive">{errors.reporter.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <Label htmlFor="reporter_contact">Contact</Label>
              <Input
                id="reporter_contact"
                type="tel"
                placeholder="0548666090"
                {...register("reporter_contact")}
                aria-invalid={!!errors.reporter_contact}
              />
              {errors.reporter_contact && (
                <p className="text-xs text-destructive">{errors.reporter_contact.message}</p>
              )}
            </div>
          </div>

          <p className={`text-sm text-destructive text-center transition-all duration-300 ${submitError ? "opacity-100" : "opacity-0"}`}>
            Failed to submit request. Try again.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isSubmitting}
              size='lg'
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon size={16} />
              Back
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              size='lg'
              className="flex-1"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Request"}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}