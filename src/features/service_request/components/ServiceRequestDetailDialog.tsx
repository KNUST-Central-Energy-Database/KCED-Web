import { Briefcase, Building2, MapPin, Phone, Trash2, User } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { displayNumber, type ServiceRequest } from "@/features/service_request/schema";
import { RequestStatusPill } from "@/features/service_request/components/RequestStatusPill";

interface ServiceRequestDetailDialogProps {
  /** The request to show; null when the dialog is closed. */
  request: ServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkOrder: (request: ServiceRequest) => void;
  onDelete: (request: ServiceRequest) => void;
}

/** "20 Jul 2026, 5:00 PM" — matches the mobile `d MMM yyyy, h:mm a` format. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}, ${time}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function IconLine({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <p className="flex items-start gap-1.5 text-sm font-medium">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      {text}
    </p>
  );
}

/**
 * Full view of a single service request — the web analogue of the mobile
 * `ServiceRequestDetailScreen`, with the create-work-order / delete actions
 * at the bottom.
 */
export function ServiceRequestDetailDialog({
  request,
  open,
  onOpenChange,
  onCreateWorkOrder,
  onDelete,
}: ServiceRequestDetailDialogProps) {
  if (!request) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <DialogTitle>Request {displayNumber(request)}</DialogTitle>
            <DialogDescription>
              {request.createdAt ? formatDate(request.createdAt) : "Date unknown"}
            </DialogDescription>
          </div>
          <RequestStatusPill status={request.status} />
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Issue">
            <p className="text-sm font-medium">{request.issue}</p>
          </Section>

          {request.description && (
            <Section title="Description">
              <p className="whitespace-pre-wrap text-sm">{request.description}</p>
            </Section>
          )}

          <Section title="Location">
            <IconLine icon={MapPin} text={request.location || "Not specified"} />
          </Section>

          <Section title="Jurisdiction">
            <IconLine
              icon={Building2}
              text={request.jurisdictionName ?? request.jurisdictionCode ?? "Unassigned"}
            />
          </Section>

          <Section title="Reporter">
            <div className="flex flex-col gap-1.5">
              <IconLine icon={User} text={request.reporter || "Anonymous"} />
              {request.reporterContact && (
                <IconLine icon={Phone} text={request.reporterContact} />
              )}
            </div>
          </Section>

          {request.submittedImages.length > 0 && (
            <Section title="Photos">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {request.submittedImages.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                    <img
                      src={url}
                      alt="Submitted photo"
                      className="size-24 rounded-[10px] border border-outline object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <Button className="flex-1" onClick={() => onCreateWorkOrder(request)}>
            <Briefcase /> Create Work Order
          </Button>
          <Button variant="destructive" size="icon-lg" onClick={() => onDelete(request)}>
            <Trash2 />
            <span className="sr-only">Delete request</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
