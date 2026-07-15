import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkOrder } from "@/features/work_order/schema";
import { deleteWorkOrder } from "@/features/work_order/services/work_order.service";

interface DeleteWorkOrderDialogProps {
  /** The work order to delete; null when the dialog is closed. */
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete so the page can refetch. */
  onDeleted: () => void;
}

/** Delete confirmation, matching the mobile alert dialog copy. */
export function DeleteWorkOrderDialog({ order, open, onOpenChange, onDeleted }: DeleteWorkOrderDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!order) return;
    setDeleting(true);
    try {
      await deleteWorkOrder(order.id);
      toast.success("Work order deleted.");
      onOpenChange(false);
      onDeleted();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1">
          <DialogTitle>Delete work order?</DialogTitle>
          <DialogDescription>
            This permanently deletes "{order?.title || "this work order"}". This
            cannot be undone.
          </DialogDescription>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting ? <Loader2 className="animate-spin" /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
