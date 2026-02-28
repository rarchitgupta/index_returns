"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardData } from "@/lib/parseData";

interface TWRChartProps {
  dashboardData: DashboardData;
  selectedPeriod: string;
  selectedTWRTypes: string[];
  selectedSources: string[];
  showResidentialExposure: boolean;
}

// Map TWR types to chart color variables
const chartColorMap: { [key: string]: string } = {
  appreciation: "var(--chart-1)",
  income: "var(--chart-2)",
  net: "var(--chart-3)",
};

export function TWRChart({
  dashboardData,
  selectedPeriod,
  selectedTWRTypes,
  selectedSources,
}: TWRChartProps) {
  const data = dashboardData;

  // Find the period label
  const periodData = data.periods.find((p) => p.id === selectedPeriod);
  const periodLabel = periodData?.label || selectedPeriod;

  // Build chart config dynamically
  const chartConfig: ChartConfig = {};
  selectedTWRTypes.forEach((twrType) => {
    const typeData = data.twrPercent[twrType as keyof typeof data.twrPercent];
    chartConfig[twrType] = {
      label: typeData.label,
      color: chartColorMap[twrType],
    };
  });

  // Build chart data - one entry per portfolio, filtered by selected sources
  const chartData = data.series
    .filter((series) => selectedSources.includes(series.id))
    .map((series) => {
      const entry: Record<string, any> = {
        name: series.label,
      };
      selectedTWRTypes.forEach((twrType) => {
        const typeData =
          data.twrPercent[twrType as keyof typeof data.twrPercent];
        const values =
          typeData.values[selectedPeriod as keyof typeof typeData.values];
        entry[twrType] = (values as Record<string, number>)[series.id] || 0;
      });
      return entry;
    });

  if (selectedTWRTypes.length === 0 || selectedSources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Returns Analysis</CardTitle>
          <CardDescription>
            {selectedTWRTypes.length === 0
              ? "Please select at least one TWR type"
              : "Please select at least one source"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center text-muted-foreground">
          <p>
            {selectedTWRTypes.length === 0
              ? "Select TWR types from the sidebar to view the chart"
              : "Select sources from the sidebar to view the chart"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="shrink-0">
        <CardTitle>Returns Analysis</CardTitle>
        <CardDescription>{periodLabel} Comparison</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel className="w-44" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {selectedTWRTypes.map((twrType) => (
              <Bar
                key={twrType}
                dataKey={twrType}
                fill={`var(--color-${twrType})`}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="shrink-0 flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          <TrendingUp className="h-4 w-4" />
          Data as of {data.asOf}
        </div>
        <div className="text-muted-foreground leading-none">
          Grouped view of selected TWR types for {periodLabel} period
        </div>
      </CardFooter>
    </Card>
  );
}
