import { useEffect, useState } from "react";
import { Boxes, ClipboardList, UserPlus, Wrench, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchRecentActivity,
  type ActivityEntityType,
  type ActivityItem,
} from "@/features/dashboard/services/dashboard.service";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_CONFIG: Record<ActivityEntityType, { icon: LucideIcon; color: string; label: string }> = {
  service_request: { icon: ClipboardList, color: "#3B82F6", label: "Service Request" },
  work_order: { icon: Wrench, color: "#10B981", label: "Work Order" },
  asset: { icon: Boxes, color: "#D97706", label: "Asset" },
  user: { icon: UserPlus, color: "#7C3AED", label: "User" },
};

/** "Service Request · cancelled" for status changes, else just the label. */
function itemLabel(item: ActivityItem): string {
  const { label } = TYPE_CONFIG[item.entityType];
  if (item.action === "status_changed" && item.detail) {
    return `${label} · ${item.detail}`;
  }
  return item.entityType === "user" ? `${label} · joined` : `${label} · created`;
}

export function RecentActivity() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRecentActivity()
      .then(setItems)
      .catch(() => setError(true));
  }, []);

  const loading = items === null && !error;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold tracking-tight">Recent Activity</h3>
      <div className="flex flex-col gap-0 rounded-4xl border border-outline bg-[#F9F9F9]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Could not load recent activity.
          </p>
        ) : items && items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No recent activity yet. New requests, work orders, assets and users will
            show up here.
          </p>
        ) : (
          items?.map((item) => {
            const config = TYPE_CONFIG[item.entityType];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-outline/50 px-4 py-3 last:border-b-0"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${config.color}1A` }}
                >
                  <Icon className="size-4" style={{ color: config.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{itemLabel(item)}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
