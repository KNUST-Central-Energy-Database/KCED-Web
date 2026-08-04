import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, CloudOff, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetDetailDialog } from "@/features/asset/components/AssetDetailDialog";
import { AssetFormDialog } from "@/features/asset/components/AssetFormDialog";
import { AssetsTable } from "@/features/asset/components/AssetsTable";
import { useAssets } from "@/features/asset/hooks/useAssets";
import {
  ASSET_TYPES,
  OPERATIONAL_STATUSES,
  type Asset,
  type AssetType,
  type OperationalStatus,
} from "@/features/asset/schema";
import type { Jurisdiction } from "@/features/service_request/schema";
import { fetchJurisdictions } from "@/features/service_request/services/service_request.service";

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
  const [jurisdictionFilter, setJurisdictionFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);

  useEffect(() => {
    fetchJurisdictions().then(setJurisdictions).catch(() => {});
  }, []);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Asset | null>(null);

  const filtered = useMemo(() => {
    let result = assets;

    if (typeFilter !== "all") {
      result = result.filter((a) => a.assetType === typeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => a.operationalStatus === statusFilter);
    }
    if (jurisdictionFilter !== "all") {
      result = result.filter((a) => a.jurisdictionId === jurisdictionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.assetCode.toLowerCase().includes(q) ||
          (a.location ?? "").toLowerCase().includes(q) ||
          (a.manufacturer ?? "").toLowerCase().includes(q) ||
          (a.serialNumber ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [assets, typeFilter, statusFilter, jurisdictionFilter, searchQuery]);

  const openView = (asset: Asset) => {
    setViewing(asset);
    setDetailOpen(true);
  };

  const [editing, setEditing] = useState<Asset | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openEdit = (asset: Asset) => {
    setDetailOpen(false);
    setEditing(asset);
    setFormOpen(true);
  };

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (jurisdictionFilter !== "all" ? 1 : 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Assets</h2>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading assets…"
            : `View and manage all registered assets across jurisdictions`}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem]">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Type</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setTypeFilter("all")}>
                  All types
                </DropdownMenuItem>
                {ASSET_TYPES.map((t) => (
                  <DropdownMenuItem key={t.dbValue} onSelect={() => setTypeFilter(t.dbValue)}>
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setStatusFilter("all")}>
                  All statuses
                </DropdownMenuItem>
                {OPERATIONAL_STATUSES.map((s) => (
                  <DropdownMenuItem key={s.dbValue} onSelect={() => setStatusFilter(s.dbValue)}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Jurisdiction</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                <DropdownMenuItem onSelect={() => setJurisdictionFilter("all")}>
                  All jurisdictions
                </DropdownMenuItem>
                {jurisdictions.map((j) => (
                  <DropdownMenuItem key={j.id} onSelect={() => setJurisdictionFilter(j.id)}>
                    {j.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setTypeFilter("all");
                    setStatusFilter("all");
                    setJurisdictionFilter("all");
                  }}
                >
                  Clear all filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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

      <AssetDetailDialog asset={viewing} open={detailOpen} onOpenChange={setDetailOpen} onEdit={openEdit} />
      <AssetFormDialog asset={editing} open={formOpen} onOpenChange={setFormOpen} onSaved={reload} />
    </div>
  );
}
