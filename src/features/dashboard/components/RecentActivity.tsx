import { ClipboardList, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  type: "service_request" | "work_order";
  title: string;
  label: string;
  createdAt: string;
}

const DUMMY_ACTIVITY: ActivityItem[] = [
  { id: "1", type: "service_request", title: "Faulty lighting in Engineering Block", label: "Service Request", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "2", type: "work_order", title: "Generator maintenance - Hall 3", label: "Work Order", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: "3", type: "service_request", title: "Power outage at Library", label: "Service Request", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: "4", type: "work_order", title: "AC repair - Admin Office", label: "Work Order", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "5", type: "service_request", title: "Socket replacement - CS Department", label: "Service Request", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

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

const TYPE_CONFIG = {
  service_request: { icon: ClipboardList, color: "#3B82F6" },
  work_order: { icon: Wrench, color: "#10B981" },
} as const;

interface RecentActivityProps {
  loading?: boolean;
}

export function RecentActivity({ loading }: RecentActivityProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold tracking-tight">Recent Activity</h3>
      <div className="flex flex-col gap-0 rounded-4xl border border-outline bg-[#F9F9F9]">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
          : DUMMY_ACTIVITY.map((item) => {
            const config = TYPE_CONFIG[item.type];
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
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            );
          })}
      </div>
    </section>
  );
}
