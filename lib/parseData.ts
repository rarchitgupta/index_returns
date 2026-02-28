import fs from "fs";
import path from "path";

export interface DashboardData {
  asOf: string;
  series: Array<{ id: string; label: string }>;
  periods: Array<{ id: string; label: string }>;
  twrPercent: {
    [key: string]: {
      label: string;
      values: {
        [periodId: string]: {
          [key: string]: number;
        };
      };
    };
  };
  underlyingResidentialExposurePercent: {
    label: string;
    values: Array<{ id: string; label: string; value: number }>;
  };
}

interface CSVRow {
  Date: string;
  Period: string;
  Allocation: string;
  "Appreciation(%)": string;
  "Income(%)": string;
  "Net_TWR(%)": string;
}

// Simple CSV parser
function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim());

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row as unknown as CSVRow;
  });

  return rows;
}

// Generate series ID from allocation name
function generateSeriesId(label: string): string {
  const words = label.toLowerCase().split(/\s+/);
  if (words.length > 0 && words[words.length - 1] === "portfolio") {
    words.pop();
  }
  return words.join("_");
}

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    // Fetch data.csv
    const dataResponse = await fetch("/data.csv");
    const dataContent = await dataResponse.text();
    let rows = parseCSV(dataContent);

    // Try to load custom.csv if it exists
    try {
      const customResponse = await fetch("/custom.csv");
      if (customResponse.ok) {
        const customContent = await customResponse.text();
        const customRows = parseCSV(customContent);
        rows = [...rows, ...customRows];
      }
    } catch (error) {
      // custom.csv might not exist, continue with data.csv only
    }

    // Extract metadata from first row
    const asOf = rows[0]?.Date || new Date().toISOString().split("T")[0];

    // Extract unique periods and allocations
    const periodsSet = new Set<string>();
    const seriesSet = new Set<string>();

    rows.forEach((row) => {
      if (row.Period) periodsSet.add(row.Period);
      if (row.Allocation) seriesSet.add(row.Allocation);
    });

    const periods = Array.from(periodsSet).map((label) => {
      const match = label.match(/(\d+)-Year/);
      const id = match
        ? `${match[1]}y`
        : label.toLowerCase().replace(/[- ]/g, "");
      return { id, label };
    });

    const series = Array.from(seriesSet).map((label) => ({
      id: generateSeriesId(label),
      label,
    }));

    // Build TWR data structure
    const twrPercent: DashboardData["twrPercent"] = {
      appreciation: { label: "Appreciation TWRs", values: {} },
      income: { label: "Income TWRs", values: {} },
      net: { label: "Net TWRs", values: {} },
    };

    // Initialize period structures
    periods.forEach((period) => {
      twrPercent.appreciation.values[period.id] = {};
      twrPercent.income.values[period.id] = {};
      twrPercent.net.values[period.id] = {};
    });

    // Fill in values from CSV
    rows.forEach((row) => {
      const periodMatch = row.Period?.match(/(\d+)-Year/);
      const periodId = periodMatch
        ? `${periodMatch[1]}y`
        : row.Period?.toLowerCase().replace(/[- ]/g, "");
      const seriesId = generateSeriesId(row.Allocation);

      const appreciation = row["Appreciation(%)"]?.trim()
        ? parseFloat(row["Appreciation(%)"])
        : 0;
      const income = row["Income(%)"]?.trim()
        ? parseFloat(row["Income(%)"])
        : 0;
      const netTwr = row["Net_TWR(%)"]?.trim()
        ? parseFloat(row["Net_TWR(%)"])
        : 0;

      if (periodId) {
        twrPercent.appreciation.values[periodId][seriesId] = appreciation;
        twrPercent.income.values[periodId][seriesId] = income;
        twrPercent.net.values[periodId][seriesId] = netTwr;
      }
    });

    return {
      asOf,
      series,
      periods,
      twrPercent,
      underlyingResidentialExposurePercent: {
        label: "Underlying Residential Exposure",
        values: [
          { id: "lihtc", label: "LIHTC", value: 50 },
          { id: "noah", label: "NOAH", value: 38 },
          { id: "section8", label: "Section 8", value: 7 },
          { id: "rent_regulated", label: "Rent Regulated", value: 5 },
        ],
      },
    };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    throw error;
  }
}
