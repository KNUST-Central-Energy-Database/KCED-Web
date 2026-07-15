import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideProps } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightCardProps {
  title: string;
  icon: ComponentType<LucideProps>;
  count: number | null;
  loading?: boolean;
  /** Internal route to open when the card is clicked. */
  to?: string;
}

/**
 * A dashboard insight stat card, ported from the kced_mobile home screen:
 * an icon + label header on white above the count on a soft gray fill.
 */
export function InsightCard({ title, icon: Icon, count, loading, to }: InsightCardProps) {
  const card = (
    <div className="flex h-[110px] flex-col overflow-hidden rounded-[10px] border border-outline bg-background transition-shadow hover:shadow-sm">
      <div className="flex flex-1 items-center gap-2 px-3">
        <Icon className="size-[18px] shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{title}</span>
        {to && <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />}
      </div>
      <div className="flex flex-[2] items-center bg-[#F9F9F9] px-3">
        {loading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <span className="text-2xl font-semibold tracking-tight">
            {count ?? "—"}
          </span>
        )}
      </div>
    </div>
  );

  if (!to) return card;
  return (
    <Link to={to} className="block">
      {card}
    </Link>
  );
}
