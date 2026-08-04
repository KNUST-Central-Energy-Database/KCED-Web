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
import { cancelServiceRequest } from "@/features/service_request/services/service_request.service";

interface DeleteServiceRequestDialogProps {
  /** The request to cancel; null when the dialog is closed. */
  request: ServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful cancel so the page can refetch. */
  onDeleted: () => void;
}

/** Cancel confirmation — "deleting" a request sets its status to cancelled. */
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
      await cancelServiceRequest(request.id);
      toast.success("Request cancelled.");
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
          <DialogTitle>Cancel request?</DialogTitle>
          <DialogDescription>
            This marks "{request?.issue || "this request"}" as cancelled. It
            will no longer be worked on.
          </DialogDescription>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Keep Request
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting ? <Loader2 className="animate-spin" /> : "Cancel Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
