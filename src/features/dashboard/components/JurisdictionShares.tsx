import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { JurisdictionShare } from "@/features/dashboard/services/dashboard.service";

/** How many jurisdiction bars to show before "View All". */
const PREVIEW_COUNT = 10;

interface JurisdictionSharesProps {
  shares: JurisdictionShare[] | null;
  loading?: boolean;
}

/**
 * Horizontal bars showing each jurisdiction's share of all work orders,
 * ported from the mobile "Jurisdictions" section: code label, primary stripe,
 * soft green body sized to the share, percent centered on the bar.
 */
export function JurisdictionShares({ shares, loading }: JurisdictionSharesProps) {
  const [showAll, setShowAll] = useState(false);

  const all = shares ?? [];
  const visible = showAll ? all : all.slice(0, PREVIEW_COUNT);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-xl font-medium tracking-tight">Jurisdictions</h3>
        <p className="text-sm text-muted-foreground">Share of work orders per jurisdiction</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : all.length === 0 ? (
        <p className="text-sm text-muted-foreground">No jurisdictions yet.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visible.map((share) => (
              <div key={share.code} className="flex items-center gap-2">
                <span className="w-[52px] shrink-0 text-sm font-medium">{share.code}</span>
                <div className="min-w-0 flex-1">
                  <div
                    className="flex h-8 min-w-[54px] items-center overflow-hidden rounded-md bg-primary-soft"
                    style={{ width: `${Math.max(share.percent * 100, 0)}%` }}
                  >
                    <div className="h-full w-0.5 shrink-0 bg-primary" />
                    <span className="mx-auto px-1 text-xs font-medium tabular-nums text-on-soft">
                      {Math.round(share.percent * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {all.length > PREVIEW_COUNT && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-primary"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show Less" : `View All (${all.length})`}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
