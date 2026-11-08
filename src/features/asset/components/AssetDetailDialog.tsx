import { Building2, Calendar, ImageOff, MapPin, Pencil, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ASSET_SPEC_FIELDS, type SpecField } from "@/features/asset/asset-specs-config";
import {
  assetTypeLabel,
  prettifyDbValue,
  type Asset,
} from "@/features/asset/schema";
import { ConditionText, OperationalStatusPill } from "@/features/asset/components/AssetPills";
import { canEditAsset } from "@/features/asset/permissions";
import { WorkOrderStatusPill } from "@/features/work_order/components/WorkOrderStatusPill";
import { displayNumber, isOverdue, type WorkOrder } from "@/features/work_order/schema";
import { fetchWorkOrderHistory } from "@/features/work_order/services/work_order.service";
import { useAuth } from "@/lib/auth-context";

interface AssetDetailDialogProps {
  /** The asset to show; null when the dialog is closed. */
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (asset: Asset) => void;
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
export function AssetDetailDialog({ asset, open, onOpenChange, onEdit }: AssetDetailDialogProps) {
  const { role, jurisdictionId, profile } = useAuth();
  const [history, setHistory] = useState<WorkOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!asset) return;
    setHistoryLoading(true);
    setHistoryError(false);
    try {
      const data = await fetchWorkOrderHistory(asset.id);
      setHistory(data);
    } catch {
      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  }, [asset]);

  useEffect(() => {
    if (open && asset) loadHistory();
  }, [open, asset, loadHistory]);

  if (!asset) return null;

  // Edit is role-gated: admins any asset, managers their jurisdiction,
  // technicians only with an open work-order assignment (from `history`,
  // which doubles as the Work Order History section below).
  const editable = canEditAsset({
    role,
    jurisdictionId,
    asset,
    currentUserId: profile?.id ?? null,
    history,
  });

  const specFields = ASSET_SPEC_FIELDS[asset.assetType] ?? [];
  const knownKeys = new Set(specFields.map((f) => f.key));
  const extraSpecs = Object.entries(asset.specifications).filter(
    ([key, value]) => !knownKeys.has(key) && value !== null && value !== "",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-6" showCloseButton={false}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <SheetTitle>{asset.assetCode}</SheetTitle>
            <SheetDescription>{assetTypeLabel(asset.assetType)}</SheetDescription>
          </div>
          <div className="flex items-center gap-2">
            {asset.operationalStatus && (
              <OperationalStatusPill status={asset.operationalStatus} />
            )}
            {editable && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(asset)}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm">
                <X />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>
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
                {asset.installationDate ? formatDate(asset.installationDate) : "N/A"}
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
            {asset.assetType !== "solar_pv" && (
              <Section title="Manufacturer">
                <p className="text-sm font-medium">{asset.manufacturer ?? "—"}</p>
              </Section>
            )}
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

          {/* Work Order History */}
          <Section title="Work Order History">
            {historyLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 2 }, (_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-[10px]" />
                ))}
              </div>
            ) : historyError ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-sm text-muted-foreground">Could not load work order history.</p>
                <Button variant="ghost" size="sm" onClick={loadHistory}>
                  Retry
                </Button>
              </div>
            ) : history.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                No work orders linked to this asset yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((wo) => (
                  <WorkOrderHistoryTile key={wo.id} workOrder={wo} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** A single work order row in the asset's history list. */
function WorkOrderHistoryTile({ workOrder }: { workOrder: WorkOrder }) {
  const overdue = isOverdue(workOrder);
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-outline px-3 py-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">
          {workOrder.title || displayNumber(workOrder)}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          {workOrder.createdAt
            ? new Date(workOrder.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
          {overdue && (
            <span className="text-destructive font-medium">Overdue</span>
          )}
        </span>
      </div>
      <WorkOrderStatusPill status={workOrder.status} />
    </div>
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
      <div className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-outline bg-muted/50">
        <ImageOff className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No nameplate photo</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-[10px] border border-outline bg-muted/50">
        <ImageOff className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Photo failed to load</p>
      </div>
    );
  }

    return (
      <a href={url} target="_blank" rel="noreferrer" className="relative block w-full">
        {state === "loading" && (
          <Skeleton className="absolute inset-0 rounded-[10px]" />
        )}
        <img
          ref={imgRef}
          src={url}
          alt="Nameplate photo"
          className={`w-full rounded-[10px] border border-outline object-cover ${
            state === "loading" ? "opacity-0" : ""
          }`}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      </a>
    );
}
