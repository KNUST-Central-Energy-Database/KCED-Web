import { Briefcase, Eye, MapPin, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { displayNumber, type ServiceRequest } from "@/features/service_request/schema";
import { RequestStatusPill } from "@/features/service_request/components/RequestStatusPill";

interface ServiceRequestsTableProps {
  requests: ServiceRequest[];
  onView: (request: ServiceRequest) => void;
  onCreateWorkOrder: (request: ServiceRequest) => void;
  onDelete: (request: ServiceRequest) => void;
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

/**
 * The service requests data table. A denser desktop take on the mobile card
 * list — same fields (number, status, issue/description, jurisdiction,
 * submit date), laid out as columns. Rows open the detail dialog.
 */
export function ServiceRequestsTable({
  requests,
  onView,
  onCreateWorkOrder,
  onDelete,
}: ServiceRequestsTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[10px] border border-outline md:block">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline bg-[#F9F9F9] text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Number</th>
            <th className="px-4 py-2.5 font-medium">Issue</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Jurisdiction</th>
            <th className="px-4 py-2.5 font-medium">Reporter</th>
            <th className="px-4 py-2.5 font-medium">Submitted</th>
            <th className="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.id}
              className="cursor-pointer border-b border-outline transition-colors last:border-b-0 hover:bg-muted/50"
              onClick={() => onView(request)}
            >
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                {displayNumber(request)}
              </td>
              <td className="max-w-72 px-4 py-3">
                <p className="truncate font-medium">{request.issue || "Untitled request"}</p>
                {request.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {request.description}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <RequestStatusPill status={request.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {request.jurisdictionCode ?? "Unassigned"}
              </td>
              <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                {request.reporter || "Anonymous"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {request.createdAt ? formatDate(request.createdAt) : "Date unknown"}
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
                    <DropdownMenuItem onSelect={() => onView(request)}>
                      <Eye /> View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onCreateWorkOrder(request)}>
                      <Briefcase /> Create work order
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => onDelete(request)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Mobile: the kced_mobile card layout — white top (number, status
          pill), grey bottom (issue, description, jurisdiction). */}
      <div className="flex flex-col gap-2 md:hidden">
        {requests.map((request) => (
          <div
            key={request.id}
            className="cursor-pointer overflow-hidden rounded-[10px] border border-outline"
            onClick={() => onView(request)}
          >
            <div className="flex flex-col gap-1 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm tabular-nums">
                  Request {displayNumber(request)}
                </p>
                <RequestStatusPill status={request.status} />
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 -mr-1">
                        <MoreVertical className="size-4 text-muted-foreground" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onView(request)}>
                        <Eye /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onCreateWorkOrder(request)}>
                        <Briefcase /> Create work order
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(request)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {request.createdAt ? formatDate(request.createdAt) : "Date unknown"}
              </p>
            </div>
            <div className="flex flex-col gap-1 bg-[#F9F9F9] px-3 py-2.5">
              <p className="truncate text-sm font-medium">
                {request.issue || "Untitled request"}
              </p>
              {request.description && (
                <p className="line-clamp-3 text-xs text-muted-foreground">
                  {request.description}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {request.jurisdictionCode ?? "Unassigned"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
