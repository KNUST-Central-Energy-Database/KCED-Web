import { z } from "zod";

/** A row from the `jurisdictions` table, fetched to populate the area picker. */
export interface Jurisdiction {
  id: number;
  name: string;
  code: string;
}

const required = (message = "This field is required.") =>
  z.string().trim().min(1, message);

/** Single source of truth: validates the form AND infers its types. */
export const serviceRequestSchema = z.object({
  issue: required(),
  description: required(),
  // The picker holds the selected jurisdiction's id (FK into `jurisdictions`).
  jurisdiction_id: z
    .number({ error: "Please select an area." })
    .int()
    .positive("Please select an area."),
  location: required(),
  reporter: required(),
  reporter_email: z.email('Enter a valid email'),
});

/** Form field values. */
export type ServiceRequestValues = z.infer<typeof serviceRequestSchema>;

/** Row inserted into Supabase: the form values plus uploaded image URLs. */
export interface ServiceRequestInsert extends ServiceRequestValues {
  submitted_images: string[];
}
