import { Building2, ImageOff, MapPin } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ASSET_SPEC_FIELDS, type SpecField } from "@/features/asset/asset-specs-config";
import {
  assetTypeLabel,
  prettifyDbValue,
  type Asset,
} from "@/features/asset/schema";
import { ConditionText, OperationalStatusPill } from "@/features/asset/components/AssetPills";

interface AssetDetailDialogProps {
  /** The asset to show; null when the dialog is closed. */
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "20 Jul 2026" for a date-only column value. */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

/** One specification value, formatted per its configured field type. */
function specValue(field: SpecField, raw: unknown): string {
  if (raw === null || raw === undefined || raw === "") return "—";
  if (field.type === "date") return formatDate(String(raw));
  return String(raw);
}

/**
 * Full view of a single asset. The specifications section is driven by
 * `ASSET_SPEC_FIELDS`, so each asset type shows its own fields; unknown
 * extra keys in the jsonb are listed too rather than hidden.
 */
export function AssetDetailDialog({ asset, open, onOpenChange }: AssetDetailDialogProps) {
  if (!asset) return null;

  const specFields = ASSET_SPEC_FIELDS[asset.assetType] ?? [];
  const knownKeys = new Set(specFields.map((f) => f.key));
  const extraSpecs = Object.entries(asset.specifications).filter(
    ([key, value]) => !knownKeys.has(key) && value !== null && value !== "",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <DialogTitle>{asset.assetCode}</DialogTitle>
            <DialogDescription>{assetTypeLabel(asset.assetType)}</DialogDescription>
          </div>
          {asset.operationalStatus && (
            <OperationalStatusPill status={asset.operationalStatus} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Section title="Condition">
              {asset.condition ? (
                <ConditionText condition={asset.condition} />
              ) : (
                <p className="text-sm text-muted-foreground">Unknown</p>
              )}
            </Section>
            <Section title="Installed">
              <p className="text-sm font-medium">
                {asset.installationDate ? formatDate(asset.installationDate) : "Unknown"}
              </p>
            </Section>
          </div>

          <Section title="Jurisdiction">
            <p className="flex items-start gap-1.5 text-sm font-medium">
              <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              {asset.jurisdictionName ?? asset.jurisdictionCode ?? "Unassigned"}
            </p>
          </Section>

          {asset.location && (
            <Section title="Location">
              <p className="flex items-start gap-1.5 text-sm font-medium">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                {asset.location}
              </p>
            </Section>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Section title="Manufacturer">
              <p className="text-sm font-medium">{asset.manufacturer ?? "—"}</p>
            </Section>
            <Section title="Serial Number">
              <p className="text-sm font-medium tabular-nums">
                {asset.serialNumber ?? "—"}
              </p>
            </Section>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Section title="Last Maintenance">
              <p className="text-sm font-medium">
                {asset.lastMaintenance ? formatDate(asset.lastMaintenance) : "—"}
              </p>
            </Section>
            <Section title="Next Maintenance">
              <p className="text-sm font-medium">
                {asset.nextMaintenance ? formatDate(asset.nextMaintenance) : "—"}
              </p>
            </Section>
          </div>

          {asset.observedIssues && (
            <Section title="Observed Issues">
              <p className="whitespace-pre-wrap text-sm">{asset.observedIssues}</p>
            </Section>
          )}

          {/* Type-specific specifications, driven by the config. */}
          {(specFields.length > 0 || extraSpecs.length > 0) && (
            <Section title="Specifications">
              <div className="flex flex-col divide-y divide-outline rounded-[10px] border border-outline">
                {specFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <span className="text-sm font-medium">
                      {specValue(field, asset.specifications[field.key])}
                    </span>
                  </div>
                ))}
                {extraSpecs.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{prettifyDbValue(key)}</span>
                    <span className="text-sm font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Nameplate">
            <NameplatePhoto url={asset.nameplatePhotoUrl} />
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** The nameplate photo with explicit empty / loading / error states. */
function NameplatePhoto({ url }: { url: string | null }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  // Restart the load cycle when the dialog shows a different asset. A cached
  // image can finish before React attaches onLoad — `complete` catches that.
  useEffect(() => {
    if (imgRef.current?.complete) {
      setState(imgRef.current.naturalWidth > 0 ? "loaded" : "error");
    } else {
      setState("loading");
    }
  }, [url]);

  if (!url) {
    return (
      <div className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-outline bg-muted/50">
        <ImageOff className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No nameplate photo</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-[10px] border border-outline bg-muted/50">
        <ImageOff className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Photo failed to load</p>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="relative w-fit">
      {/* Absolute overlay while loading; the img keeps its layout box (just
          invisible) — display:none would stop the browser loading it at all. */}
      {state === "loading" && (
        <Skeleton className="absolute inset-0 rounded-[10px]" />
      )}
      <img
        ref={imgRef}
        src={url}
        alt="Nameplate photo"
        className={`max-h-40 min-h-24 min-w-40 rounded-[10px] border border-outline object-cover ${
          state === "loading" ? "opacity-0" : ""
        }`}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
      />
    </a>
  );
}
