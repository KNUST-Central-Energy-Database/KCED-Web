import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudOff, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Dialog state: detail (view), the form (create when null / edit), delete.
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<WorkOrder | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<WorkOrder | null>(null);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? workOrders
        : workOrders.filter((o) => o.status === statusFilter),
    [workOrders, statusFilter],
  );

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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Work Orders</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading work orders…"
              : `${workOrders.length} ${workOrders.length === 1 ? "work order" : "work orders"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilter)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {WORK_ORDER_STATUSES.map((s) => (
                <SelectItem key={s.dbValue} value={s.dbValue}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus /> Create Work Order
          </Button>
        </div>
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
