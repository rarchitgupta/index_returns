"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { TWRChart } from "@/components/twr-chart";
import { ResidentialExposureChart } from "@/components/residential-exposure-chart";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { loadDashboardData, type DashboardData } from "@/lib/parseData";

export default function Page() {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ["dashboard-data"],
    queryFn: loadDashboardData,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y");
  const [showResidentialExposure, setShowResidentialExposure] =
    useState<boolean>(false);
  const [selectedTWRTypes, setSelectedTWRTypes] = useState<string[]>([
    "appreciation",
  ]);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "affordable",
    "odce_apartment",
  ]);

  const handleTWRTypeChange = (twrType: string, checked: boolean) => {
    if (checked) {
      setSelectedTWRTypes([...selectedTWRTypes, twrType]);
    } else {
      setSelectedTWRTypes(selectedTWRTypes.filter((type) => type !== twrType));
    }
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    if (checked) {
      setSelectedSources([...selectedSources, source]);
    } else {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset className="h-screen flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Loading data...</p>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !data) {
    return (
      <SidebarProvider>
        <SidebarInset className="h-screen flex flex-col items-center justify-center">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load data"}
          </p>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        dashboardData={data}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        showResidentialExposure={showResidentialExposure}
        onResidentialExposureChange={setShowResidentialExposure}
        selectedTWRTypes={selectedTWRTypes}
        onTWRTypeChange={handleTWRTypeChange}
        selectedSources={selectedSources}
        onSourceChange={handleSourceChange}
        onDataRefetch={refetch}
      />
      <SidebarInset className="h-screen flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            <TWRChart
              dashboardData={data}
              selectedPeriod={selectedPeriod}
              selectedTWRTypes={selectedTWRTypes}
              selectedSources={selectedSources}
              showResidentialExposure={showResidentialExposure}
            />
            {showResidentialExposure && <ResidentialExposureChart />}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
