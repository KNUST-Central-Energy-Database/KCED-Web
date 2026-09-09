import { useCallback, useEffect, useState } from "react";
import { Building2, Link2, Package, Pencil, Play, CheckCircle, Trash2, Unlink, User } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
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
import { LinkAssetDialog } from "@/features/work_order/components/LinkAssetDialog";
import { linkAsset, updateWorkOrderStatus } from "@/features/work_order/services/work_order.service";
import { fetchAssetById } from "@/features/asset/services/asset.service";
import { assetTypeLabel, type Asset } from "@/features/asset/schema";
import type { WorkOrderStatus } from "@/features/dashboard/services/dashboard.service";

interface WorkOrderDetailDialogProps {
  /** The work order to show; null when the dialog is closed. */
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (order: WorkOrder) => void;
  onDelete: (order: WorkOrder) => void;
  /** Called after linking/unlinking so the list can refresh. */
  onAssetChanged?: () => void;
}

function CompletionNotesForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (notes: string) => void;
  onCancel: () => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder="e.g. Replaced filter, tested OK"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={() => onSubmit(notes)}>
          Mark Complete
        </Button>
      </div>
    </div>
  );
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
 * Full view of a single work order, with the edit/delete actions at
 * the bottom and an asset link section.
 */
export function WorkOrderDetailDialog({
  order,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onAssetChanged,
}: WorkOrderDetailDialogProps) {
  const [linkedAsset, setLinkedAsset] = useState<Asset | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [completionNotesOpen, setCompletionNotesOpen] = useState(false);

  // Load the linked asset when the dialog opens or the order changes
  const loadLinkedAsset = useCallback(async () => {
    if (!order?.assetId) {
      setLinkedAsset(null);
      return;
    }
    setLoadingAsset(true);
    try {
      const asset = await fetchAssetById(order.assetId);
      setLinkedAsset(asset);
    } catch {
      setLinkedAsset(null);
    } finally {
      setLoadingAsset(false);
    }
  }, [order?.assetId]);

  useEffect(() => {
    if (open) loadLinkedAsset();
  }, [open, loadLinkedAsset]);

  const handleLink = async (asset: Asset) => {
    if (!order) return;
    try {
      await linkAsset(order.id, asset.id);
      setLinkedAsset(asset);
      toast.success("Asset linked.");
      onAssetChanged?.();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleUnlink = async () => {
    if (!order) return;
    setUnlinking(true);
    try {
      await linkAsset(order.id, null);
      setLinkedAsset(null);
      toast.success("Asset unlinked.");
      onAssetChanged?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUnlinking(false);
    }
  };

  /** The next logical status transition for this order, or null when already completed. */
  const nextStatus: WorkOrderStatus | null = (() => {
    if (!order) return null;
    switch (order.status) {
      case "pending":
        return "in progress";
      case "overdue":
        return "in progress";
      case "in progress":
        return "completed";
      case "completed":
        return null;
      default:
        return null;
    }
  })();

  const nextStatusLabel = (() => {
    switch (nextStatus) {
      case "in progress":
        return "Mark as In Progress";
      case "completed":
        return "Mark as Completed";
      default:
        return "";
    }
  })();

  const handleStatusUpdate = async (completionNotes?: string) => {
    if (!order || !nextStatus) return;
    setUpdatingStatus(true);
    try {
      await updateWorkOrderStatus(order.id, nextStatus, completionNotes);
      toast.success("Status updated.");
      onAssetChanged?.(); // Trigger parent refresh
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!order) return null;
  const overdue = isOverdue(order);
  const jurisdiction =
    order.jurisdictionCode && order.jurisdictionName
      ? `${order.jurisdictionCode} — ${order.jurisdictionName}`
      : (order.jurisdictionName ?? order.jurisdictionCode ?? "Unassigned");

  return (
    <>
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

            {/* Linked Asset */}
            <Section title="Asset">
              {loadingAsset ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : linkedAsset ? (
                <div className="flex flex-col gap-2">
                  <IconLine icon={Package} text={`${linkedAsset.assetCode} — ${assetTypeLabel(linkedAsset.assetType)}`} />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLinkOpen(true)}
                    >
                      <Link2 className="size-3.5" />
                      Change asset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={unlinking}
                      onClick={handleUnlink}
                    >
                      <Unlink className="size-3.5" />
                      {unlinking ? "Removing…" : "Remove link"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLinkOpen(true)}
                >
                  <Link2 className="size-3.5" />
                  Link asset
                </Button>
              )}
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
            {nextStatus && (
              <Button
                className="flex-1"
                disabled={updatingStatus}
                onClick={() => {
                  if (nextStatus === "completed") {
                    setCompletionNotesOpen(true);
                  } else {
                    handleStatusUpdate();
                  }
                }}
              >
                {updatingStatus ? (
                  "Updating…"
                ) : nextStatus === "completed" ? (
                  <>
                    <CheckCircle /> {nextStatusLabel}
                  </>
                ) : (
                  <>
                    <Play /> {nextStatusLabel}
                  </>
                )}
              </Button>
            )}
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

      <LinkAssetDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        jurisdictionId={order.jurisdictionId}
        currentAssetId={order.assetId}
        onPicked={handleLink}
      />

      {/* Completion Notes Dialog */}
      <Dialog open={completionNotesOpen} onOpenChange={setCompletionNotesOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Completion Notes</DialogTitle>
          <DialogDescription>
            Optional — add any notes about the completed work.
          </DialogDescription>
          <CompletionNotesForm
            onSubmit={(notes) => {
              setCompletionNotesOpen(false);
              handleStatusUpdate(notes);
            }}
            onCancel={() => setCompletionNotesOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
