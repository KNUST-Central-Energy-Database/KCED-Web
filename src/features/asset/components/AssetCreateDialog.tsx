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
  ASSET_TYPES,
  ASSET_CONDITIONS,
  OPERATIONAL_STATUSES,
  type AssetType,
  type AssetCondition,
  type OperationalStatus,
} from "@/features/asset/schema";
import { ASSET_SPEC_FIELDS } from "@/features/asset/asset-specs-config";
import { createAsset } from "@/features/asset/services/asset.service";
import { fetchJurisdictions } from "@/features/service_request/services/service_request.service";
import type { Jurisdiction } from "@/features/service_request/schema";

interface AssetCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AssetCreateDialog({ open, onOpenChange, onSaved }: AssetCreateDialogProps) {
  const [assetCode, setAssetCode] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "">("");
  const [jurisdictionId, setJurisdictionId] = useState<number | null>(null);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
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
    if (!open) return;
    fetchJurisdictions()
      .then(setJurisdictions)
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setAssetCode("");
    setAssetType("");
    setJurisdictionId(null);
    setManufacturer("");
    setSerialNumber("");
    setLocation("");
    setInstallationDate("");
    setCondition("");
    setOperationalStatus("");
    setObservedIssues("");
    setLastMaintenance("");
    setNextMaintenance("");
    setSpecifications({});
  }, [open]);

  const specFields = assetType ? ASSET_SPEC_FIELDS[assetType] ?? [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetCode || !assetType || !jurisdictionId) {
      toast.error("Asset code, type, and jurisdiction are required.");
      return;
    }
    setSubmitting(true);
    try {
      await createAsset({
        assetCode,
        assetType,
        jurisdictionId,
        manufacturer: manufacturer || null,
        serialNumber: serialNumber || null,
        location: location || null,
        installationDate: installationDate || null,
        condition: condition || null,
        operationalStatus: operationalStatus || null,
        observedIssues: observedIssues || null,
        lastMaintenance: lastMaintenance || null,
        nextMaintenance: nextMaintenance || null,
        specifications,
      });
      toast.success("Asset created.");
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl overflow-y-auto p-6"
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          // Don't close the sheet while a select dropdown is open — the
          // dismissing click registers as "outside" the sheet content.
          if (
            target.closest('[data-radix-popper-content-wrapper]') ||
            document.querySelector('[data-slot=select-content]')
          ) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <SheetTitle>New Asset</SheetTitle>
            <SheetDescription>Add a new asset to the system.</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm">
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Required fields */}
          <Field label="Asset Code *">
            <Input
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              placeholder="e.g. GEN-001"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Asset Type *">
              <Select value={assetType} onValueChange={(v) => { setAssetType(v as AssetType); setSpecifications({}); }} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => (
                    <SelectItem key={t.dbValue} value={t.dbValue}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Jurisdiction *">
              <Select value={jurisdictionId?.toString() ?? ""} onValueChange={(v) => setJurisdictionId(Number(v))} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j.id} value={j.id.toString()}>
                      {j.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Optional fields */}
          {assetType !== "solar_pv" && (
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
            {submitting ? "Creating…" : "Create Asset"}
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
