import { Mail, Phone } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { WorkOrder } from "@/features/work_order/schema";

/**
 * The assigned technician's name; hovering it reveals a small profile card
 * (avatar, name, role, email, phone). Plain "Unassigned" when the order has
 * no lead technician.
 */
export function TechnicianHoverCard({ technician }: { technician: WorkOrder["leadTechnician"] }) {
  if (!technician) return <span className="text-muted-foreground">Unassigned</span>;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="cursor-default text-muted-foreground underline decoration-outline decoration-dashed underline-offset-2 hover:text-foreground">
          {technician.fullName || technician.email}
        </span>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex items-center gap-3">
          <UserAvatar seed={technician.id} avatarUrl={technician.avatarUrl} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {technician.fullName || technician.email}
            </p>
            <p className="text-xs text-muted-foreground">Technician</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {technician.email && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{technician.email}</span>
            </p>
          )}
          {technician.phone && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3 shrink-0" />
              {technician.phone}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
