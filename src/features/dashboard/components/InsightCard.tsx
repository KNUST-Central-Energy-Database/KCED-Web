import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightCardProps {
  title: string;
  /** Dashboard image (webp) shown at the top of the card. */
  img: string;
  count: number | null;
  loading?: boolean;
  /** Internal route to open when the card is clicked. */
  to?: string;
}

/**
 * A dashboard insight stat card, ported from the kced_mobile home screen:
 * an image + chevron header, then the title and a large count on the
 * soft `fill` gray background.
 */
export function InsightCard({ title, img, count, loading, to }: InsightCardProps) {
  const card = (
    <div className="flex flex-col gap-6 items-start rounded-4xl bg-[#F9F9F9] p-6 transition-shadow hover:shadow-sm">
      <img src={img} alt="" className="h-[45px] object-contain" />
      <div>
        <div className="mt-2">
          {loading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <span className="text-2xl font-semibold tracking-tight">{count ?? "—"}</span>
          )}
        </div>
        <p className="truncate text-muted-foreground">
          {title}
        </p>
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
