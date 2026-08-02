import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, CloudOff, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteServiceRequestDialog } from "@/features/service_request/components/DeleteServiceRequestDialog";
import { ServiceRequestDetailDialog } from "@/features/service_request/components/ServiceRequestDetailDialog";
import { ServiceRequestsTable } from "@/features/service_request/components/ServiceRequestsTable";
import { useServiceRequests } from "@/features/service_request/hooks/useServiceRequests";
import {
  SERVICE_REQUEST_STATUSES,
  type Jurisdiction,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/features/service_request/schema";
import { fetchJurisdictions } from "@/features/service_request/services/service_request.service";
import { WorkOrderFormDialog } from "@/features/work_order/components/WorkOrderFormDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/service-requests")({
  component: ServiceRequests,
});

type StatusFilter = ServiceRequestStatus | "all";

function ServiceRequests() {
  const { requests, loading, error, reload } = useServiceRequests();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<ServiceRequest | null>(null);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);
  const [workOrderFor, setWorkOrderFor] = useState<ServiceRequest | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ServiceRequest | null>(null);

  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);

  useEffect(() => {
    fetchJurisdictions()
      .then(setJurisdictions)
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = requests;

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (jurisdictionFilter !== "all") {
      result = result.filter((r) => r.jurisdictionId === jurisdictionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.issue.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.reporter.toLowerCase().includes(q) ||
          (r.requestNumber ?? `#${r.id.slice(0, 8)}`).toLowerCase().includes(q),
      );
    }
    return result;
  }, [requests, statusFilter, jurisdictionFilter, searchQuery]);

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

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (jurisdictionFilter !== "all" ? 1 : 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Service Requests</h2>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading requests…"
            : `Manage and track all submitted service requests across jurisdictions`}
        </p>
      </div>

      <div className="flex items-center gap-3 justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem]">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setStatusFilter("all")}>
                  All statuses
                </DropdownMenuItem>
                {SERVICE_REQUEST_STATUSES.map((s) => (
                  <DropdownMenuItem key={s.dbValue} onSelect={() => setStatusFilter(s.dbValue)}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Jurisdiction</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                <DropdownMenuItem onSelect={() => setJurisdictionFilter("all")}>
                  All jurisdictions
                </DropdownMenuItem>
                {jurisdictions.map((j) => (
                  <DropdownMenuItem key={j.id} onSelect={() => setJurisdictionFilter(j.id)}>
                    {j.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setStatusFilter("all");
                    setJurisdictionFilter("all");
                  }}
                >
                  Clear all filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
