import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchDailyRequestTrend,
  type DailyTrendPoint,
} from "@/features/dashboard/services/dashboard.service";
import { useAuth } from "@/lib/auth-context";

export interface MonthOption {
  value: string;
  label: string;
  year: number;
  month: number;
}

function buildMonthOptions(): MonthOption[] {
  const now = new Date();
  const options: MonthOption[] = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    options.push({ value: `${year}-${month}`, label, year, month });
  }

  return options;
}

export function useMonthlyTrend() {
  const { role, jurisdictionId } = useAuth();
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const current = monthOptions[0];

  const [selected, setSelected] = useState<MonthOption>(current);
  const [data, setData] = useState<DailyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const scoped = role && role !== "admin" && jurisdictionId != null;
  const jid = scoped ? jurisdictionId : null;

  const fetch = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const trend = await fetchDailyRequestTrend(year, month, jid);
      setData(trend);
    } catch (e) {
      console.error("Monthly trend load failed:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [jid]);

  useEffect(() => {
    fetch(selected.year, selected.month);
  }, [selected, fetch]);

  const selectMonth = useCallback(
    (value: string) => {
      const option = monthOptions.find((o) => o.value === value);
      if (option) setSelected(option);
    },
    [monthOptions],
  );

  return { data, loading, selected, selectMonth, monthOptions };
}
