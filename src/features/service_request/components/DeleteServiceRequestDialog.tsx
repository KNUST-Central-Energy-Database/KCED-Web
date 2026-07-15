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
import type { ServiceRequest } from "@/features/service_request/schema";
import { deleteServiceRequest } from "@/features/service_request/services/service_request.service";

interface DeleteServiceRequestDialogProps {
  /** The request to delete; null when the dialog is closed. */
  request: ServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete so the page can refetch. */
  onDeleted: () => void;
}

/** Delete confirmation, matching the mobile alert dialog copy. */
export function DeleteServiceRequestDialog({
  request,
  open,
  onOpenChange,
  onDeleted,
}: DeleteServiceRequestDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!request) return;
    setDeleting(true);
    try {
      await deleteServiceRequest(request.id);
      toast.success("Request deleted.");
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
          <DialogTitle>Delete request?</DialogTitle>
          <DialogDescription>
            This permanently deletes "{request?.issue || "this request"}". This
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
