import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudOff, Filter, Plus, Search, Wrench } from "lucide-react";
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
import {
  WORK_ORDER_STATUSES,
  type WorkOrderStatus,
} from "@/features/dashboard/services/dashboard.service";
import { DeleteWorkOrderDialog } from "@/features/work_order/components/DeleteWorkOrderDialog";
import { WorkOrderDetailDialog } from "@/features/work_order/components/WorkOrderDetailDialog";
import { WorkOrderFormDialog } from "@/features/work_order/components/WorkOrderFormDialog";
import { WorkOrdersTable } from "@/features/work_order/components/WorkOrdersTable";
import { useWorkOrders } from "@/features/work_order/hooks/useWorkOrders";
import type { WorkOrder } from "@/features/work_order/schema";
import type { Jurisdiction } from "@/features/service_request/schema";
import { fetchJurisdictions } from "@/features/service_request/services/service_request.service";

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is the work orders page, ported from the kced_mobile
// work orders screen (as a data table, with a web-only status filter).
export const Route = createFileRoute("/dashboard/work-orders")({
  component: WorkOrders,
});

type StatusFilter = WorkOrderStatus | "all";

function WorkOrders() {
  const { workOrders, loading, error, reload } = useWorkOrders();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);

  // Dialog state: detail (view), the form (create when null / edit), delete.
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<WorkOrder | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<WorkOrder | null>(null);

  useEffect(() => {
    fetchJurisdictions()
      .then(setJurisdictions)
      .catch(() => { });
  }, []);

  const filtered = useMemo(() => {
    let result = workOrders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (jurisdictionFilter !== "all") {
      result = result.filter((o) => o.jurisdictionId === jurisdictionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          (o.workOrderNumber ?? `#${o.id.slice(0, 8)}`).toLowerCase().includes(q),
      );
    }
    return result;
  }, [workOrders, statusFilter, jurisdictionFilter, searchQuery]);

  const openView = (order: WorkOrder) => {
    setViewing(order);
    setDetailOpen(true);
  };
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (order: WorkOrder) => {
    setDetailOpen(false);
    setEditing(order);
    setFormOpen(true);
  };
  const openDelete = (order: WorkOrder) => {
    setDetailOpen(false);
    setDeleting(order);
    setDeleteOpen(true);
  };

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (jurisdictionFilter !== "all" ? 1 : 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Work Orders</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading work orders…"
              : `Manage and track all work orders across jurisdictions`}
          </p>
        </div>
        <Button onClick={openCreate} size={"sm"}>
          <Plus /> Create Work Order
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search work orders..."
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
                {WORK_ORDER_STATUSES.map((s) => (
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
          <Wrench className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {workOrders.length === 0 ? "No work orders yet." : "No matching work orders."}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {workOrders.length === 0
              ? "Work orders created across the system will appear here."
              : "No work orders have this status. Try another filter."}
          </p>
        </div>
      ) : (
        <WorkOrdersTable
          workOrders={filtered}
          onView={openView}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}

      <WorkOrderDetailDialog
        order={viewing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onDelete={openDelete}
        onAssetChanged={reload}
      />
      <WorkOrderFormDialog
        order={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />
      <DeleteWorkOrderDialog
        order={deleting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={reload}
      />
    </div>
  );
}
