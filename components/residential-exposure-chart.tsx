"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { id: "lihtc", label: "LIHTC", value: 50 },
  { id: "noah", label: "NOAH", value: 38 },
  { id: "section8", label: "Section 8", value: 7 },
  { id: "rent_regulated", label: "Rent Regulated", value: 5 },
];

const chartConfig = {
  value: {
    label: "Percentage",
  },
  lihtc: {
    label: "LIHTC",
    color: "var(--chart-2)",
  },
  noah: {
    label: "NOAH",
    color: "var(--chart-1)",
  },
  section8: {
    label: "Section 8",
    color: "var(--chart-4)",
  },
  rent_regulated: {
    label: "Rent Regulated",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ResidentialExposureChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Underlying Residential Exposure</CardTitle>
        <CardDescription>Portfolio Composition</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              label={({ value }) => `${value}%`}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={((chartConfig[entry.id as keyof typeof chartConfig] as any)?.color) || "var(--chart-1)"}
                />
              ))}
            </Pie>
            <ChartLegend
              content={({ payload }) => (
                <div className="flex flex-wrap gap-2 justify-center">
                  {payload?.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">
                        {
                          chartConfig[
                            chartData[index].id as keyof typeof chartConfig
                          ].label
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}
              className="mt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
