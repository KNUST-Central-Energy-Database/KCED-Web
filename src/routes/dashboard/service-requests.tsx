import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteServiceRequestDialog } from "@/features/service_request/components/DeleteServiceRequestDialog";
import { ServiceRequestDetailDialog } from "@/features/service_request/components/ServiceRequestDetailDialog";
import { ServiceRequestsTable } from "@/features/service_request/components/ServiceRequestsTable";
import { useServiceRequests } from "@/features/service_request/hooks/useServiceRequests";
import {
  SERVICE_REQUEST_STATUSES,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/features/service_request/schema";
import { WorkOrderFormDialog } from "@/features/work_order/components/WorkOrderFormDialog";
import { toast } from "sonner";

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is the service requests page, ported from the
// kced_mobile service requests screen (as a data table, with a web-only
// status filter). Rows open a detail dialog with the create-work-order and
// delete actions from the mobile detail screen.
export const Route = createFileRoute("/dashboard/service-requests")({
  component: ServiceRequests,
});

type StatusFilter = ServiceRequestStatus | "all";

function ServiceRequests() {
  const { requests, loading, error, reload } = useServiceRequests();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<ServiceRequest | null>(null);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);
  const [workOrderFor, setWorkOrderFor] = useState<ServiceRequest | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ServiceRequest | null>(null);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? requests
        : requests.filter((r) => r.status === statusFilter),
    [requests, statusFilter],
  );

  const openView = (request: ServiceRequest) => {
    setViewing(request);
    setDetailOpen(true);
  };
  const openCreateWorkOrder = (request: ServiceRequest) => {
    // Work orders require a jurisdiction (NOT NULL column); unassigned
    // requests can't have one until they're assigned.
    if (request.jurisdictionId === null) {
      toast.error("Assign this request to a jurisdiction before creating a work order.");
      return;
    }
    setDetailOpen(false);
    setWorkOrderFor(request);
    setWorkOrderOpen(true);
  };
  const openDelete = (request: ServiceRequest) => {
    setDetailOpen(false);
    setDeleting(request);
    setDeleteOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Service Requests</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading requests…"
              : `${requests.length} ${requests.length === 1 ? "request" : "requests"}`}
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as StatusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SERVICE_REQUEST_STATUSES.map((s) => (
              <SelectItem key={s.dbValue} value={s.dbValue}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-[10px]" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <CloudOff className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <Button onClick={reload} className="mt-2">
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <ClipboardList className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {requests.length === 0 ? "No service requests yet." : "No matching requests."}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {requests.length === 0
              ? "Submitted service requests will appear here."
              : "No requests have this status. Try another filter."}
          </p>
        </div>
      ) : (
        <ServiceRequestsTable
          requests={filtered}
          onView={openView}
          onCreateWorkOrder={openCreateWorkOrder}
          onDelete={openDelete}
        />
      )}

      <ServiceRequestDetailDialog
        request={viewing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onCreateWorkOrder={openCreateWorkOrder}
        onDelete={openDelete}
      />
      <WorkOrderFormDialog
        order={null}
        request={workOrderFor}
        open={workOrderOpen}
        onOpenChange={setWorkOrderOpen}
        onSaved={reload}
      />
      <DeleteServiceRequestDialog
        request={deleting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={reload}
      />
    </div>
  );
}
