import { Building2, Pencil, Trash2, User } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  categoryLabel,
  displayNumber,
  isOverdue,
  type WorkOrder,
} from "@/features/work_order/schema";
import { WorkOrderStatusPill } from "@/features/work_order/components/WorkOrderStatusPill";

interface WorkOrderDetailDialogProps {
  /** The work order to show; null when the dialog is closed. */
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (order: WorkOrder) => void;
  onDelete: (order: WorkOrder) => void;
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

function IconLine({ icon: Icon, text }: { icon: typeof User; text: string }) {
  return (
    <p className="flex items-start gap-1.5 text-sm font-medium">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      {text}
    </p>
  );
}

/**
 * Full view of a single work order, with the edit/delete actions at the
 * bottom. The web fills the gap the mobile app left as a TODO (its card tap
 * has no detail screen yet).
 */
export function WorkOrderDetailDialog({
  order,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: WorkOrderDetailDialogProps) {
  if (!order) return null;
  const overdue = isOverdue(order);
  const jurisdiction =
    order.jurisdictionCode && order.jurisdictionName
      ? `${order.jurisdictionCode} — ${order.jurisdictionName}`
      : (order.jurisdictionName ?? order.jurisdictionCode ?? "Unassigned");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <DialogTitle>Work Order - {displayNumber(order)}</DialogTitle>
            <DialogDescription>
              {order.createdAt
                ? `Created ${formatDate(order.createdAt)}`
                : "Date unknown"}
            </DialogDescription>
          </div>
          <WorkOrderStatusPill status={order.status} />
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Title">
            <p className="text-sm font-medium">
              {order.title || "Untitled work order"}
            </p>
          </Section>

          {order.description && (
            <Section title="Description">
              <p className="whitespace-pre-wrap text-sm">{order.description}</p>
            </Section>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Section title="Category">
              <p className="text-sm font-medium">{categoryLabel(order.category)}</p>
            </Section>
            <Section title="Deadline">
              <p className={`text-sm font-medium ${overdue ? "text-error" : ""}`}>
                {order.deadline
                  ? `${overdue ? "Overdue — " : ""}${formatDate(order.deadline)}`
                  : "No deadline"}
              </p>
            </Section>
          </div>

          <Section title="Jurisdiction">
            <IconLine icon={Building2} text={jurisdiction} />
          </Section>

          <Section title="Assigned to">
            <IconLine
              icon={User}
              text={
                order.leadTechnician
                  ? order.leadTechnician.fullName || order.leadTechnician.email
                  : "Unassigned"
              }
            />
          </Section>

          {order.status === "completed" && (
            <>
              {order.completedAt && (
                <Section title="Completed">
                  <p className="text-sm font-medium">{formatDate(order.completedAt)}</p>
                </Section>
              )}
              {order.completionNotes && (
                <Section title="Completion notes">
                  <p className="whitespace-pre-wrap text-sm">{order.completionNotes}</p>
                </Section>
              )}
            </>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <Button className="flex-1" onClick={() => onEdit(order)}>
            <Pencil /> Edit
          </Button>
          <Button variant="destructive" size="icon-lg" onClick={() => onDelete(order)}>
            <Trash2 />
            <span className="sr-only">Delete work order</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
