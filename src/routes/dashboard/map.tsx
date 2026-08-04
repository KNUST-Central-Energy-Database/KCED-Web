import { createFileRoute } from "@tanstack/react-router";
import { CloudOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetMap } from "@/features/asset/components/AssetMap";
import { useAssets } from "@/features/asset/hooks/useAssets";

export const Route = createFileRoute("/dashboard/map")({
  component: AssetMapPage,
});

function AssetMapPage() {
  const { assets, loading, error, reload } = useAssets();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Map</h2>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading assets…"
            : `Geographic view of all registered assets`}
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-[500px] w-full rounded-4xl" />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <CloudOff className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <Button onClick={reload} className="mt-2">
            Retry
          </Button>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <MapPin className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No assets yet.</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registered assets will appear on the map here.
          </p>
        </div>
      ) : (
        <AssetMap assets={assets} />
      )}
    </div>
  );
}
