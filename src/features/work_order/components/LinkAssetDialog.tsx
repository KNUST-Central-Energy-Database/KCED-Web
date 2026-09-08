import { useCallback, useEffect, useState } from "react";
import { Search, Zap, Plug, ArrowUpDown, Sun, Lightbulb, Wind } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAssets } from "@/features/asset/services/asset.service";
import { assetTypeLabel, type Asset, type AssetType } from "@/features/asset/schema";
import { useAuth } from "@/lib/auth-context";

interface LinkAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Jurisdiction of the work order — assets are filtered to this. */
  jurisdictionId: number | null;
  /** Currently linked asset ID, to highlight it. */
  currentAssetId?: string | null;
  onPicked: (asset: Asset) => void;
}

const TYPE_ICONS: Record<AssetType, typeof Zap> = {
  generator: Zap,
  transformer: Plug,
  lift: ArrowUpDown,
  solar_pv: Sun,
  streetlight: Lightbulb,
  air_conditioner: Wind,
};

/**
 * Asset picker dialog for linking an asset to a work order.
 * Lists assets in the work order's jurisdiction with a search field.
 */
export function LinkAssetDialog({
  open,
  onOpenChange,
  jurisdictionId,
  currentAssetId,
  onPicked,
}: LinkAssetDialogProps) {
  const { role, jurisdictionId: userJurisdictionId } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // For the link picker, scope to the work order's jurisdiction
      const data = await fetchAssets(role, jurisdictionId ?? userJurisdictionId);
      setAssets(data);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [role, jurisdictionId, userJurisdictionId]);

  useEffect(() => {
    if (open) {
      setQuery("");
      load();
    }
  }, [open, load]);

  const filtered = assets.filter((a) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      a.assetCode.toLowerCase().includes(q) ||
      assetTypeLabel(a.assetType).toLowerCase().includes(q) ||
      (a.location ?? "").toLowerCase().includes(q) ||
      (a.manufacturer ?? "").toLowerCase().includes(q)
    );
  });

  const handlePick = (asset: Asset) => {
    onPicked(asset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-hidden flex flex-col">
        <div className="flex flex-col gap-1">
          <DialogTitle>Link Asset</DialogTitle>
          <DialogDescription>Select an asset to link to this work order.</DialogDescription>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, type or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[50vh]">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[10px]" />
            ))
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {assets.length === 0
                ? "No assets in this jurisdiction yet."
                : "No matching assets."}
            </p>
          ) : (
            filtered.map((asset) => {
              const Icon = TYPE_ICONS[asset.assetType] ?? Zap;
              const isLinked = asset.id === currentAssetId;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handlePick(asset)}
                  className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                    isLinked ? "border-primary bg-primary/5" : "border-outline"
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{asset.assetCode}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {assetTypeLabel(asset.assetType)}
                    </span>
                  </div>
                  {isLinked && (
                    <span className="ml-auto shrink-0 text-xs text-primary">Current</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
