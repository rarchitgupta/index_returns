import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REQUIRED_HEADERS = [
  "Date",
  "Period",
  "Allocation",
  "Appreciation(%)",
  "Income(%)",
  "Net_TWR(%)",
];

const VALID_PERIODS = ["1-Year", "2-Year", "3-Year"];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  rows?: Array<{ [key: string]: string }>;
}

function parseCSVContent(content: string): Array<{ [key: string]: string }> {
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });
}

function validateCSV(content: string): ValidationResult {
  const errors: string[] = [];
  const lines = content.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return { valid: false, errors: ["CSV is empty"] };
  }

  // Check headers
  const headers = lines[0].split(",").map((h) => h.trim());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  // Parse and validate rows
  const rows = parseCSVContent(content);

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 because of header and 0-indexing

    // Validate Date (required, MM/DD/YY format)
    if (!row.Date || row.Date.trim() === "") {
      errors.push(`Row ${rowNum}: Date is required`);
    } else if (!/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(row.Date)) {
      errors.push(
        `Row ${rowNum}: Invalid date format "${row.Date}". Expected MM/DD/YY (e.g., 12/31/25)`,
      );
    } else {
      // Validate that it's a valid date
      const [month, day, year] = row.Date.split("/").map(Number);
      if (month < 1 || month > 12) {
        errors.push(
          `Row ${rowNum}: Invalid month "${month}" in date "${row.Date}". Month must be 01-12`,
        );
      }
      if (day < 1 || day > 31) {
        errors.push(
          `Row ${rowNum}: Invalid day "${day}" in date "${row.Date}". Day must be 01-31`,
        );
      }
    }

    // Validate Period
    if (!row.Period || !VALID_PERIODS.includes(row.Period)) {
      errors.push(
        `Row ${rowNum}: Invalid period "${row.Period}". Must be one of: ${VALID_PERIODS.join(", ")}`,
      );
    }

    // Validate Allocation (must not be empty)
    if (!row.Allocation || row.Allocation.trim() === "") {
      errors.push(`Row ${rowNum}: Allocation cannot be empty`);
    }

    // Validate numeric fields
    const numericFields = ["Appreciation(%)", "Income(%)", "Net_TWR(%)"];
    numericFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== "") {
        if (isNaN(parseFloat(row[field]))) {
          errors.push(
            `Row ${rowNum}: "${field}" must be a valid number, got "${row[field]}"`,
          );
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    rows: errors.length === 0 ? rows : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: { message: "No files provided" } },
        { status: 400 },
      );
    }

    // Process each file
    const results = [];
    for (const file of files) {
      const content = await file.text();

      // Validate CSV
      const validation = validateCSV(content);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: {
              message: "CSV validation failed",
              details: validation.errors,
            },
          },
          { status: 400 },
        );
      }

      // Write to custom.csv (instead of appending to data.csv)
      const customPath = path.join(process.cwd(), "public", "custom.csv");

      // Extract rows from new CSV (skip header)
      const newRows = validation.rows || [];
      
      // Build CSV content with header
      const header = "Date,Period,Allocation,Appreciation(%),Income(%),Net_TWR(%)";
      const csvContent = newRows.map((row) => {
        return [
          row.Date,
          row.Period,
          row.Allocation,
          row["Appreciation(%)"],
          row["Income(%)"],
          row["Net_TWR(%)"],
        ].join(",");
      });

      // Write to custom.csv (overwrite if exists)
      const fullContent = [header, ...csvContent].join("\n") + "\n";
      fs.writeFileSync(customPath, fullContent, "utf-8");

      results.push({
        file: file.name,
        rowsAdded: newRows.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${results.length} file(s)`,
      results,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "Upload failed",
        },
      },
      { status: 500 },
    );
  }
}
