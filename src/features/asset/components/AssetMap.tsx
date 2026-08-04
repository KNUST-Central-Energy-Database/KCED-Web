import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Asset } from "@/features/asset/schema";
import { assetTypeLabel } from "@/features/asset/schema";

interface AssetMapProps {
  assets: Asset[];
}

const KNUST_CENTER = { latitude: 6.6745, longitude: -1.5716 };

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

/** Marker colour by asset type. */
const TYPE_COLORS: Record<string, string> = {
  generator: "#E85D04",
  transformer: "#7B2CBF",
  lift: "#0077B6",
  solar_pv: "#F9C74F",
  streetlight: "#588157",
  air_conditioner: "#00B4D8",
};

/** Parse a "lat, lng" location string. Returns null if invalid. */
function parseLocation(location: string | null): { lat: number; lng: number } | null {
  if (!location) return null;
  const parts = location.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function AssetMap({ assets }: AssetMapProps) {
  const geoAssets = assets
    .map((a) => ({ asset: a, coords: parseLocation(a.location) }))
    .filter((e): e is { asset: Asset; coords: { lat: number; lng: number } } => e.coords !== null);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-4xl border border-outline bg-muted/30 text-sm text-muted-foreground">
        Mapbox token not configured.
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-4xl border border-outline">
      <Map
        initialViewState={{
          latitude: KNUST_CENTER.latitude,
          longitude: KNUST_CENTER.longitude,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {geoAssets.map(({ asset, coords }) => (
          <Marker
            key={asset.id}
            latitude={coords.lat}
            longitude={coords.lng}
            anchor="bottom"
          >
            <div className="group relative cursor-pointer">
              <div
                className="size-3 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125"
                style={{ backgroundColor: TYPE_COLORS[asset.assetType] ?? "#6B6B6B" }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                <p className="font-medium">{asset.assetCode}</p>
                <p className="text-[10px] opacity-80">{assetTypeLabel(asset.assetType)}</p>
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
