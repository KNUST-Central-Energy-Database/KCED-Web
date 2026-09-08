import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Jurisdiction } from "@/features/service_request/schema";
import {
  displayNumber,
  type ServiceRequest,
} from "@/features/service_request/schema";
import { fetchJurisdictions } from "@/features/service_request/services/service_request.service";
import {
  WORK_ORDER_CATEGORIES,
  displayNumber as workOrderNumber,
  workOrderSchema,
  type WorkOrder,
  type WorkOrderValues,
} from "@/features/work_order/schema";
import {
  createWorkOrder,
  fetchTechnicians,
  updateWorkOrder,
  type Technician,
} from "@/features/work_order/services/work_order.service";
import { useAuth } from "@/lib/auth-context";

interface WorkOrderFormDialogProps {
  /** The work order being edited; null when creating. */
  order: WorkOrder | null;
  /** The service request this order is created from, if any. Prefills the
   * title/description and inherits the jurisdiction. Not passed with `order`. */
  request?: ServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save so the page can refetch. */
  onSaved: () => void;
}

/** An ISO timestamp as a `datetime-local` input value, in local time. */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function defaultsFor(order: WorkOrder | null, request?: ServiceRequest | null, userJurisdictionId?: number | null, isAdmin?: boolean): WorkOrderValues {
  // Title column is varchar(100); a request's issue may be longer.
  const title = order?.title ?? request?.issue.slice(0, 100) ?? "";
  const jurisdictionFromData = order?.jurisdictionId ?? request?.jurisdictionId;
  // For non-admins creating standalone work orders, default to their jurisdiction
  const jurisdictionDefault: number = jurisdictionFromData ?? (isAdmin ? (undefined as unknown as number) : (userJurisdictionId ?? (undefined as unknown as number)));
  return {
    title,
    description: order?.description ?? request?.description ?? "",
    jurisdiction_id: jurisdictionDefault,
    category: order?.category ?? "repair",
    lead_technician_id: order?.leadTechnicianId ?? "",
    deadline: isoToLocalInput(order?.deadline ?? null),
  };
}

/**
 * Create/edit a work order — the web analogue of the mobile
 * `CreateWorkOrderSheet`. The lead technician picker is scoped to the
 * selected jurisdiction and resets when it changes.
 */
export function WorkOrderFormDialog({ order, request, open, onOpenChange, onSaved }: WorkOrderFormDialogProps) {
  const editing = order !== null;
  const { role, jurisdictionId: userJurisdictionId } = useAuth();
  const isAdmin = role === "admin";

  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: defaultsFor(order, request, userJurisdictionId, isAdmin),
  });

  const jurisdictionId = watch("jurisdiction_id");
  const deadline = watch("deadline");

  // Re-seed the form whenever the dialog opens (create blank / from a
  // request prefilled / edit prefilled).
  useEffect(() => {
    if (open) reset(defaultsFor(order, request, userJurisdictionId, isAdmin));
  }, [open, order, request, reset, userJurisdictionId, isAdmin]);

  // Load the jurisdiction picker options once the dialog first opens.
  useEffect(() => {
    if (!open || jurisdictions.length > 0) return;
    fetchJurisdictions()
      .then(setJurisdictions)
      .catch(() => toast.error("Could not load jurisdictions."));
  }, [open, jurisdictions.length]);

  // Load technicians for the selected jurisdiction. In edit mode a dangling
  // technician (deactivated or moved) is dropped rather than rendered.
  useEffect(() => {
    if (!open || !jurisdictionId) {
      setTechnicians([]);
      return;
    }
    let stale = false;
    setLoadingTechnicians(true);
    fetchTechnicians(jurisdictionId)
      .then((list) => {
        if (stale) return;
        setTechnicians(list);
        const current = watch("lead_technician_id");
        if (current && !list.some((t) => t.id === current)) {
          setValue("lead_technician_id", "");
        }
      })
      .catch(() => {
        if (!stale) toast.error("Could not load technicians.");
      })
      .finally(() => {
        if (!stale) setLoadingTechnicians(false);
      });
    return () => {
      stale = true;
    };
  }, [open, jurisdictionId, setValue, watch]);

  const onSubmit = async (values: WorkOrderValues) => {
    try {
      if (editing) {
        await updateWorkOrder(order.id, values);
      } else {
        await createWorkOrder(values, request?.id);
      }
      toast.success(`Work order ${editing ? "updated" : "created"}.`);
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const leadTechnicianId = watch("lead_technician_id");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <div className="flex flex-col gap-1">
          <DialogTitle>{editing ? "Edit work order" : "Create work order"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Work Order - ${workOrderNumber(order)}`
              : request
                ? `From request ${displayNumber(request)}.`
                : "Schedule work for a technician crew."}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-title">Title</Label>
            <Input
              id="wo-title"
              placeholder="What needs to be done"
              maxLength={100}
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-description">Description</Label>
            <Textarea
              id="wo-description"
              placeholder="Details for the technician"
              className="min-h-20"
              {...register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-jurisdiction">Jurisdiction</Label>
            <Select
              value={jurisdictionId ? String(jurisdictionId) : undefined}
              onValueChange={(val) =>
                setValue("jurisdiction_id", Number(val), { shouldValidate: true })
              }
              disabled={!isAdmin}
            >
              <SelectTrigger id="wo-jurisdiction" aria-invalid={!!errors.jurisdiction_id}>
                <SelectValue placeholder="Select a jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                {jurisdictions.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.code} — {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jurisdiction_id && (
              <p className="text-xs text-destructive">{errors.jurisdiction_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-category">Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(val) =>
                setValue("category", val as WorkOrderValues["category"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="wo-category" aria-invalid={!!errors.category}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_CATEGORIES.map((c) => (
                  <SelectItem key={c.dbValue} value={c.dbValue}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-technician">Lead technician</Label>
            <Select
              // Remount when the jurisdiction changes so a cleared selection
              // doesn't linger in the trigger.
              key={jurisdictionId ?? "none"}
              value={leadTechnicianId || undefined}
              onValueChange={(val) =>
                setValue("lead_technician_id", val, { shouldValidate: true })
              }
              disabled={!jurisdictionId || loadingTechnicians || technicians.length === 0}
            >
              <SelectTrigger id="wo-technician" aria-invalid={!!errors.lead_technician_id}>
                <SelectValue
                  placeholder={
                    !jurisdictionId
                      ? "Select a jurisdiction first"
                      : loadingTechnicians
                        ? "Loading technicians…"
                        : technicians.length === 0
                          ? "No technicians in this jurisdiction"
                          : "Select a technician"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.fullName || t.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lead_technician_id && (
              <p className="text-xs text-destructive">{errors.lead_technician_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-deadline">
              Deadline{" "}
              <span className="font-light text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input id="wo-deadline" type="datetime-local" {...register("deadline")} />
              {deadline && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setValue("deadline", "")}
                >
                  <X className="size-4 text-muted-foreground" />
                  <span className="sr-only">Clear deadline</span>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : editing ? (
                "Save Changes"
              ) : (
                "Create Work Order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
