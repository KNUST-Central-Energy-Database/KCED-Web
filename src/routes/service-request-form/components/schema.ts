import { z } from "zod";

/** Areas / jurisdictions — mirrors the `jurisdiction` enum in supabase_setup.sql. */
export const JURISDICTIONS = [
  "College of Engineering",
  "College of Science",
  "College of Agriculture and Natural Resources",
  "College of Art and Built Environment",
  "College of Health Sciences",
  "College of Humanities and Social Sciences",
  "Administration",
  "Prempeh II Library",
  "Halls of Residence",
  "Other",
] as const;

export type Jurisdiction = (typeof JURISDICTIONS)[number];

const required = (message = "This field is required.") =>
  z.string().trim().min(1, message);

/** Single source of truth: validates the form AND infers its types. */
export const serviceRequestSchema = z.object({
  issue: required(),
  description: required(),
  jurisdiction: z
    .string()
    .refine((v) => (JURISDICTIONS as readonly string[]).includes(v), {
      message: "Please select an area.",
    }),
  location: required(),
  reporter: required(),
  reporter_contact: required(),
});

/** Form field values (all strings; jurisdiction starts empty). */
export type ServiceRequestValues = z.infer<typeof serviceRequestSchema>;

/** Row inserted into Supabase: the form values plus uploaded image URLs. */
export interface ServiceRequestInsert extends ServiceRequestValues {
  images: string[];
}
