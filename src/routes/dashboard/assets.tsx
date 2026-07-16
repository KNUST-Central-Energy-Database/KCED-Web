import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetDetailDialog } from "@/features/asset/components/AssetDetailDialog";
import { AssetsTable } from "@/features/asset/components/AssetsTable";
import { useAssets } from "@/features/asset/hooks/useAssets";
import {
  ASSET_TYPES,
  OPERATIONAL_STATUSES,
  type Asset,
  type AssetType,
  type OperationalStatus,
} from "@/features/asset/schema";

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is the assets page. Read-only for now — the list,
// type/status filters, and a detail dialog whose specifications section is
// driven by ASSET_SPEC_FIELDS. Create/edit lands later.
export const Route = createFileRoute("/dashboard/assets")({
  component: Assets,
});

type TypeFilter = AssetType | "all";
type StatusFilter = OperationalStatus | "all";

function Assets() {
  const { assets, loading, error, reload } = useAssets();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Asset | null>(null);

  const filtered = useMemo(
    () =>
      assets.filter(
        (a) =>
          (typeFilter === "all" || a.assetType === typeFilter) &&
          (statusFilter === "all" || a.operationalStatus === statusFilter),
      ),
    [assets, typeFilter, statusFilter],
  );

  const openView = (asset: Asset) => {
    setViewing(asset);
    setDetailOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Assets</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading assets…"
              : `${assets.length} ${assets.length === 1 ? "asset" : "assets"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as TypeFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t.dbValue} value={t.dbValue}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilter)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {OPERATIONAL_STATUSES.map((s) => (
                <SelectItem key={s.dbValue} value={s.dbValue}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Boxes className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {assets.length === 0 ? "No assets yet." : "No matching assets."}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {assets.length === 0
              ? "Tracked assets will appear here."
              : "No assets match these filters. Try different ones."}
          </p>
        </div>
      ) : (
        <AssetsTable assets={filtered} onView={openView} />
      )}

      <AssetDetailDialog asset={viewing} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
