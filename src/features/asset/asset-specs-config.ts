import type { AssetType } from "@/features/asset/schema";

/** One type-specific specification field, driving both the (future) asset
 * form and the detail view's specifications section. */
export interface SpecField {
  /** Key into the `specifications` jsonb column. */
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  /** Choices when `type` is "select". */
  options?: string[];
}

/**
 * The specification fields per asset type. Users can't guess what belongs in
 * the `specifications` jsonb, so this config is the single source of truth
 * for which keys exist, their labels, and their input types.
 */
export const ASSET_SPEC_FIELDS: Record<AssetType, SpecField[]> = {
  generator: [
    { key: "rated_power_kva", label: "Rated Power (KVA)", type: "text" },
    { key: "fuel_type", label: "Fuel Type", type: "select", options: ["Diesel", "Petrol"] },
    { key: "fuel_tank_capacity_liters", label: "Fuel Tank Capacity (L)", type: "number" },
    { key: "current_fuel_level", label: "Current Fuel Level", type: "number" },
    { key: "last_fuel_fill_date", label: "Last Fuel Fill Date", type: "date" },
  ],
  transformer: [
    { key: "type", label: "Type", type: "select", options: ["Oil Immersed", "Dry Type"] },
    { key: "rated_power", label: "Rated Power", type: "text" },
    { key: "system_voltage", label: "System Voltage", type: "text" },
    { key: "frequency", label: "Frequency", type: "text" },
    { key: "number_of_phases", label: "Number of Phases", type: "number" },
    { key: "cooling_method", label: "Cooling Method", type: "text" },
    { key: "vector_group", label: "Vector Group", type: "text" },
    { key: "substation_name", label: "Substation Name", type: "text" },
  ],
  lift: [
    { key: "rated_power_kw", label: "Rated Power (kW)", type: "number" },
    { key: "capacity_person", label: "Capacity (Persons)", type: "number" },
    { key: "capacity_kg", label: "Capacity (kg)", type: "number" },
    { key: "floors_served", label: "Floors Served", type: "number" },
    { key: "lift_type", label: "Lift Type", type: "select", options: ["Traction", "Hydraulic"] },
    { key: "building_name", label: "Building Name", type: "text" },
    { key: "certification_valid_until", label: "Certification Valid Until", type: "date" },
  ],
  solar_pv: [
    { key: "system_capacity_kwp", label: "System Capacity (kWp)", type: "number" },
    { key: "panel_count", label: "Panel Count", type: "number" },
    { key: "panel_wattage_w", label: "Panel Wattage (W)", type: "number" },
    { key: "inverter_capacity_kw", label: "Inverter Capacity (kW)", type: "number" },
    { key: "battery_capacity_kwh", label: "Battery Capacity (kWh)", type: "number" },
    {
      key: "mounting_type",
      label: "Mounting Type",
      type: "select",
      options: ["Roof Mounted", "Ground Mounted", "Pole Mounted"],
    },
  ],
  streetlight: [
    {
      key: "lamp_type",
      label: "Lamp Type",
      type: "select",
      options: ["LED", "Sodium", "CFL"],
    },
    { key: "wattage_w", label: "Wattage (W)", type: "number" },
    { key: "pole_height_m", label: "Pole Height (m)", type: "number" },
    {
      key: "pole_material",
      label: "Pole Material",
      type: "select",
      options: ["Steel", "Concrete", "Aluminium", "Wood"],
    },
    { key: "lamp_count", label: "Lamp Count", type: "number" },
  ],
  air_conditioner: [
    {
      key: "unit_type",
      label: "Type",
      type: "select",
      options: ["Split", "Cassette", "Standing", "Window"],
    },
    { key: "capacity_btu", label: "Capacity (BTU)", type: "number" },
    { key: "refrigerant", label: "Refrigerant", type: "text" },
    { key: "energy_rating", label: "Energy Rating", type: "text" },
    { key: "room_served", label: "Room Served", type: "text" },
  ],
};
