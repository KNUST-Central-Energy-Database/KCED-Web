import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryLabel, isOverdue, shortId, type WorkOrder } from "@/features/work_order/schema";
import { TechnicianHoverCard } from "@/features/work_order/components/TechnicianHoverCard";
import { WorkOrderStatusPill } from "@/features/work_order/components/WorkOrderStatusPill";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onView: (order: WorkOrder) => void;
  onEdit: (order: WorkOrder) => void;
  onDelete: (order: WorkOrder) => void;
}

/** "20 Jul 2026, 5:00 PM" — matches the mobile `d MMM yyyy, h:mm a` format. */
function formatDeadline(iso: string): string {
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

/**
 * The work orders data table. A denser desktop take on the mobile card list —
 * same fields (id, status, category, deadline, title/description,
 * jurisdiction), laid out as columns.
 */
export function WorkOrdersTable({ workOrders, onView, onEdit, onDelete }: WorkOrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-outline">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline bg-[#F9F9F9] text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">ID</th>
            <th className="px-4 py-2.5 font-medium">Title</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Category</th>
            <th className="px-4 py-2.5 font-medium">Jurisdiction</th>
            <th className="px-4 py-2.5 font-medium">Assigned To</th>
            <th className="px-4 py-2.5 font-medium">Deadline</th>
            <th className="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {workOrders.map((order) => {
            const overdue = isOverdue(order);
            return (
              <tr
                key={order.id}
                className="cursor-pointer border-b border-outline transition-colors last:border-b-0 hover:bg-muted/50"
                onClick={() => onView(order)}
              >
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                  {shortId(order)}
                </td>
                <td className="max-w-72 px-4 py-3">
                  <p className="truncate font-medium">
                    {order.title || "Untitled work order"}
                  </p>
                  {order.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {order.description}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <WorkOrderStatusPill status={order.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {categoryLabel(order.category)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {order.jurisdictionCode ?? "Unassigned"}
                </td>
                {/* Stop row-click so interacting with the hover card doesn't
                    also open the detail. */}
                <td
                  className="max-w-40 truncate px-4 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TechnicianHoverCard technician={order.leadTechnician} />
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 ${
                    overdue ? "text-error" : "text-muted-foreground"
                  }`}
                >
                  {order.deadline
                    ? `${overdue ? "Overdue — " : ""}${formatDeadline(order.deadline)}`
                    : "No deadline"}
                </td>
                {/* Stop row-click so the menu doesn't also open the detail. */}
                <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreVertical className="size-4 text-muted-foreground" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onView(order)}>
                        <Eye /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEdit(order)}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(order)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
