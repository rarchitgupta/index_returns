"use client";

import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddSourceDialog } from "@/components/add-source-dialog";
import type { DashboardData } from "@/lib/parseData";

export function AppSidebar({
  dashboardData,
  selectedPeriod,
  onPeriodChange,
  showResidentialExposure,
  onResidentialExposureChange,
  selectedTWRTypes,
  onTWRTypeChange,
  selectedSources,
  onSourceChange,
  onDataRefetch,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  dashboardData: DashboardData;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  showResidentialExposure: boolean;
  onResidentialExposureChange: (checked: boolean) => void;
  selectedTWRTypes: string[];
  onTWRTypeChange: (twrType: string, checked: boolean) => void;
  selectedSources: string[];
  onSourceChange: (source: string, checked: boolean) => void;
  onDataRefetch: () => void;
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Returns Analysis</span>
                  <span className="text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <div className="space-y-6 px-2">
            {/* Period Selection */}
            <div className="space-y-2">
              <Label htmlFor="period-select" className="text-xs font-semibold">
                Time Period
              </Label>
              <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger id="period-select" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dashboardData.periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Residential Exposure Toggle */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor="residential-exposure"
                className="text-xs font-semibold cursor-pointer"
              >
                Show Residential Exposure
              </Label>
              <Switch
                id="residential-exposure"
                checked={showResidentialExposure}
                onCheckedChange={onResidentialExposureChange}
              />
            </div>

            {/* TWR Types Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold">
                Time-weighted return (TWR) Types
              </Label>
              <div className="space-y-2">
                {Object.entries(dashboardData.twrPercent).map(
                  ([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={selectedTWRTypes.includes(key)}
                        onCheckedChange={(checked) =>
                          onTWRTypeChange(key, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={key}
                        className="text-xs font-normal cursor-pointer"
                      >
                        {value.label}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Source Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Source</Label>
                <AddSourceDialog onUploadSuccess={onDataRefetch} />
              </div>
              <div className="space-y-2">
                {dashboardData.series.map((series) => (
                  <div key={series.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={series.id}
                      checked={selectedSources.includes(series.id)}
                      onCheckedChange={(checked) =>
                        onSourceChange(series.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={series.id}
                      className="text-xs font-normal cursor-pointer"
                    >
                      {series.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
