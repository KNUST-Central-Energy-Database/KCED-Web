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
    { key: "module_type", label: "Module Type", type: "select", options: ["Mono-facial, Bi-facial", "Mono-facial", "Bi-facial", "Mono-crystalline"] },
    { key: "orientation", label: "Orientation", type: "text" },
    { key: "system_type", label: "System Type", type: "select", options: ["Grid-tied", "Hybrid", "Off-grid"] },
    { key: "module_count", label: "Module Count", type: "number" },
    { key: "module_rated_power", label: "Module Rated Power", type: "text" },
    { key: "module_manufacturer", label: "Module Manufacturer", type: "text" },
    { key: "inverter_count", label: "Inverter Count", type: "number" },
    { key: "inverter_capacity_kw", label: "Inverter Capacity (kW)", type: "text" },
    { key: "inverter_manufacturer", label: "Inverter Manufacturer", type: "text" },
    { key: "battery_count", label: "Battery Count", type: "number" },
    { key: "battery_capacity_kwh", label: "Battery Capacity (kWh)", type: "number" },
    { key: "battery_manufacturer", label: "Battery Manufacturer", type: "text" },
    { key: "mounting_type", label: "Mounting Type", type: "select", options: ["Roof Mounted", "Ground Mounted", "Pole Mounted"] },
    { key: "array_configuration_strings_no", label: "Array Configuration (Strings)", type: "number" },
    { key: "array_configuration_module_per_string", label: "Modules per String", type: "number" },
    { key: "total_solar_installed_capacity", label: "Total Installed Capacity", type: "text" },
  ],
  streetlight: [
    { key: "rated_power_w", label: "Rated Power (W)", type: "text" },
    { key: "technology_type", label: "Technology Type", type: "text" },
    { key: "control_sys_type", label: "Control System Type", type: "text" },
  ],
  air_conditioner: [
    { key: "system_type", label: "System Type", type: "select", options: ["SPLIT TYPE", "WINDOW TYPE", "CENTRALIZED", "PORTABLE", "CASSETTE", "FLOOR STANDING"] },
    { key: "installation_room", label: "Installation Room", type: "text" },
    { key: "efficiency_ratings", label: "Efficiency Ratings", type: "text" },
    { key: "rated_power_input_kw", label: "Rated Power Input (kW)", type: "text" },
    { key: "rated_cooling_capacity_kw", label: "Rated Cooling Capacity (kW)", type: "text" },
  ],
};
