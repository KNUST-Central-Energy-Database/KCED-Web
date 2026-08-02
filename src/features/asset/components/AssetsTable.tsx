import { MapPin } from "lucide-react";
import { assetTypeLabel, type Asset } from "@/features/asset/schema";
import { ConditionText, OperationalStatusPill } from "@/features/asset/components/AssetPills";

interface AssetsTableProps {
  assets: Asset[];
  onView: (asset: Asset) => void;
}

/**
 * The assets list: a dense data table on `md+` screens, and a stacked card
 * layout below that. Read-only — rows open the detail dialog.
 */
export function AssetsTable({ assets, onView }: AssetsTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-4xl border border-outline md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline bg-[#F9F9F9] text-center">
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Condition</th>
              <th className="px-4 py-2.5 font-medium">Jurisdiction</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Next Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="cursor-pointer border-b border-outline transition-colors last:border-b-0 hover:bg-muted/50"
                onClick={() => onView(asset)}
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums">
                  {asset.assetCode}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {assetTypeLabel(asset.assetType)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {asset.operationalStatus ? (
                    <OperationalStatusPill status={asset.operationalStatus} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {asset.condition ? (
                    <ConditionText condition={asset.condition} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {asset.jurisdictionCode ?? "Unassigned"}
                </td>
                <td className="max-w-52 truncate px-4 py-3 text-muted-foreground">
                  {asset.location ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {asset.nextMaintenance
                    ? new Date(asset.nextMaintenance).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards, following the work order card layout. */}
      <div className="flex flex-col gap-2 md:hidden">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="cursor-pointer overflow-hidden rounded-[10px] border border-outline"
            onClick={() => onView(asset)}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <p className="min-w-0 flex-1 truncate text-sm font-medium tabular-nums">
                {asset.assetCode}
              </p>
              {asset.operationalStatus && (
                <OperationalStatusPill status={asset.operationalStatus} />
              )}
              <span className="text-xs text-muted-foreground">
                {assetTypeLabel(asset.assetType)}
              </span>
            </div>
            <div className="flex flex-col gap-1 bg-[#F9F9F9] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                {asset.condition ? (
                  <ConditionText condition={asset.condition} />
                ) : (
                  <span className="text-sm text-muted-foreground">Condition unknown</span>
                )}
                {asset.nextMaintenance && (
                  <span className="text-xs text-muted-foreground">
                    Next:{" "}
                    {new Date(asset.nextMaintenance).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">
                  {asset.jurisdictionCode ?? "Unassigned"}
                  {asset.location ? ` — ${asset.location}` : ""}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
