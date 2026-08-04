import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import {
  ASSET_CONDITIONS,
  OPERATIONAL_STATUSES,
  type Asset,
  type AssetCondition,
  type OperationalStatus,
} from "@/features/asset/schema";
import { ASSET_SPEC_FIELDS } from "@/features/asset/asset-specs-config";
import { updateAsset } from "@/features/asset/services/asset.service";

interface AssetFormDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/** Format a date-only string to "YYYY-MM-DD" for input[type=date]. */
function toInputDate(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function AssetFormDialog({ asset, open, onOpenChange, onSaved }: AssetFormDialogProps) {
  const [manufacturer, setManufacturer] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [condition, setCondition] = useState<AssetCondition | "">("");
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus | "">("");
  const [observedIssues, setObservedIssues] = useState("");
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!asset || !open) return;
    setManufacturer(asset.manufacturer ?? "");
    setSerialNumber(asset.serialNumber ?? "");
    setLocation(asset.location ?? "");
    setInstallationDate(toInputDate(asset.installationDate));
    setCondition(asset.condition ?? "");
    setOperationalStatus(asset.operationalStatus ?? "");
    setObservedIssues(asset.observedIssues ?? "");
    setLastMaintenance(toInputDate(asset.lastMaintenance));
    setNextMaintenance(toInputDate(asset.nextMaintenance));
    setSpecifications({ ...asset.specifications });
  }, [asset, open]);

  if (!asset) return null;

  const specFields = ASSET_SPEC_FIELDS[asset.assetType] ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateAsset(asset.id, {
        manufacturer,
        serialNumber,
        location,
        installationDate,
        condition: condition || null,
        operationalStatus: operationalStatus || null,
        observedIssues,
        lastMaintenance,
        nextMaintenance,
        specifications,
      });
      toast.success("Asset updated.");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateSpec = (key: string, value: string) => {
    setSpecifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-6" showCloseButton={false}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <SheetTitle>Edit {asset.assetCode}</SheetTitle>
            <SheetDescription>Update asset properties and specifications.</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm">
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Shared fields */}
          {asset.assetType !== "solar_pv" && (
            <Field label="Manufacturer">
              <Input
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Caterpillar"
              />
            </Field>
          )}

          <Field label="Serial Number">
            <Input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. SN-12345"
            />
          </Field>

          <Field label="Location">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 6.677433, -1.565612"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Installation Date">
              <Input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
              />
            </Field>
            <Field label="Condition">
              <Select value={condition} onValueChange={(v) => setCondition(v as AssetCondition)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CONDITIONS.map((c) => (
                    <SelectItem key={c.dbValue} value={c.dbValue}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Operational Status">
            <Select
              value={operationalStatus}
              onValueChange={(v) => setOperationalStatus(v as OperationalStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {OPERATIONAL_STATUSES.map((s) => (
                  <SelectItem key={s.dbValue} value={s.dbValue}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Last Maintenance">
              <Input
                type="date"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
              />
            </Field>
            <Field label="Next Maintenance">
              <Input
                type="date"
                value={nextMaintenance}
                onChange={(e) => setNextMaintenance(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Observed Issues">
            <Textarea
              value={observedIssues}
              onChange={(e) => setObservedIssues(e.target.value)}
              placeholder="Any known issues..."
            />
          </Field>

          {/* Type-specific specifications */}
          {specFields.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Specifications</p>
              <div className="flex flex-col gap-3 rounded-[10px] border border-outline p-4">
                {specFields.map((field) => (
                  <Field key={field.key} label={field.label}>
                    {field.type === "select" ? (
                      <Select
                        value={String(specifications[field.key] ?? "")}
                        onValueChange={(v) => updateSpec(field.key, v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                        value={String(specifications[field.key] ?? "")}
                        onChange={(e) => updateSpec(field.key, e.target.value)}
                        placeholder={field.label}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
