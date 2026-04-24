"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { FunnelIcon, XIcon } from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export function IncidentFiltersDrawer({
  filters,
  setFilters,
  activeFilterCount,
  clearAllFilters,
  availableDepartments,
}: {
  filters: {
    types: string[];
    alarmLevels: string[];
    emergencyServices: string[];
    hasResponder: boolean | null;
    states: string[];
    cities: string[];
    departments: string[];
    distanceMiles: number | null;
    minUpdates: number | null;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      types: string[];
      alarmLevels: string[];
      emergencyServices: string[];
      hasResponder: boolean | null;
      states: string[];
      cities: string[];
      departments: string[];
      distanceMiles: number | null;
      minUpdates: number | null;
    }>
  >;
  activeFilterCount: number;
  clearAllFilters: () => void;
  availableDepartments: string[];
}) {
  const incidentFilterCount = filters.types.length + filters.alarmLevels.length;
  const statusFilterCount =
    filters.emergencyServices.length + (filters.hasResponder !== null ? 1 : 0);
  const locationFilterCount =
    filters.states.length +
    filters.departments.length +
    (filters.distanceMiles !== null ? 1 : 0);
  const activityFilterCount = filters.minUpdates !== null ? 1 : 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative h-9 w-9 hover:bg-white/10"
        >
          <FunnelIcon className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-8"
                >
                  Clear all
                </Button>
              )}
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XIcon className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Accordion
            type="multiple"
            defaultValue={["incident", "status", "location", "activity"]}
            className="w-full"
          >
            <AccordionItem value="incident" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Incident</span>
                  {incidentFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {incidentFilterCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <MultiCombobox
                    options={[
                      { value: "fire", label: "Fire" },
                      { value: "flood", label: "Flood" },
                      { value: "storm", label: "Storm" },
                      { value: "wind", label: "Wind" },
                      { value: "hail", label: "Hail" },
                      { value: "other", label: "Other" },
                    ]}
                    values={filters.types}
                    onValuesChange={(values) =>
                      setFilters((prev) => ({ ...prev, types: values }))
                    }
                    placeholder="Any type"
                    searchPlaceholder="Search types..."
                    emptyText="No types found."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Alarm Level
                  </Label>
                  <MultiCombobox
                    options={[
                      { value: "all_hands", label: "All Hands" },
                      { value: "2nd_alarm", label: "2nd Alarm" },
                      { value: "3rd_alarm", label: "3rd Alarm" },
                      { value: "4th_alarm", label: "4th Alarm" },
                      { value: "5th_alarm", label: "5th Alarm" },
                    ]}
                    values={filters.alarmLevels}
                    onValuesChange={(values) =>
                      setFilters((prev) => ({ ...prev, alarmLevels: values }))
                    }
                    placeholder="Any level"
                    searchPlaceholder="Search levels..."
                    emptyText="No levels found."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="status" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  {statusFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {statusFilterCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Emergency Services
                  </Label>
                  <MultiCombobox
                    options={[
                      { value: "dispatched", label: "Dispatched" },
                      { value: "on-scene", label: "On-Scene" },
                      { value: "cleared", label: "Cleared" },
                    ]}
                    values={filters.emergencyServices}
                    onValuesChange={(values) =>
                      setFilters((prev) => ({
                        ...prev,
                        emergencyServices: values,
                      }))
                    }
                    placeholder="Any status"
                    searchPlaceholder="Search status..."
                    emptyText="No status found."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Responder
                  </Label>
                  <Select
                    value={
                      filters.hasResponder === null
                        ? "all"
                        : filters.hasResponder
                          ? "has"
                          : "none"
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setFilters((prev) => ({ ...prev, hasResponder: null }));
                      } else if (value === "has") {
                        setFilters((prev) => ({ ...prev, hasResponder: true }));
                      } else {
                        setFilters((prev) => ({
                          ...prev,
                          hasResponder: false,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Incidents</SelectItem>
                      <SelectItem value="has">Has Responder</SelectItem>
                      <SelectItem value="none">No Responder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="location" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Location</span>
                  {locationFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {locationFilterCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Distance
                  </Label>
                  <Select
                    value={
                      filters.distanceMiles === null
                        ? "all"
                        : String(filters.distanceMiles)
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setFilters((prev) => ({
                          ...prev,
                          distanceMiles: null,
                        }));
                      } else {
                        setFilters((prev) => ({
                          ...prev,
                          distanceMiles: parseFloat(value),
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Distance</SelectItem>
                      <SelectItem value="5">Within 5 miles</SelectItem>
                      <SelectItem value="10">Within 10 miles</SelectItem>
                      <SelectItem value="25">Within 25 miles</SelectItem>
                      <SelectItem value="50">Within 50 miles</SelectItem>
                      <SelectItem value="100">Within 100 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <MultiCombobox
                    options={US_STATES.map((state) => ({
                      value: state.code,
                      label: `${state.name} (${state.code})`,
                    }))}
                    values={filters.states}
                    onValuesChange={(values) =>
                      setFilters((prev) => ({
                        ...prev,
                        states: values,
                        cities: [],
                      }))
                    }
                    placeholder="Any state"
                    searchPlaceholder="Search states..."
                    emptyText="No states found."
                  />
                </div>

                {availableDepartments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Department
                    </Label>
                    <MultiCombobox
                      options={availableDepartments.map((dept) => ({
                        value: dept,
                        label: dept,
                      }))}
                      values={filters.departments}
                      onValuesChange={(values) =>
                        setFilters((prev) => ({ ...prev, departments: values }))
                      }
                      placeholder="Any department"
                      searchPlaceholder="Search departments..."
                      emptyText="No departments found."
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="activity" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Activity</span>
                  {activityFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {activityFilterCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Minimum Updates
                  </Label>
                  <Select
                    value={
                      filters.minUpdates === null
                        ? "all"
                        : String(filters.minUpdates)
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setFilters((prev) => ({ ...prev, minUpdates: null }));
                      } else {
                        setFilters((prev) => ({
                          ...prev,
                          minUpdates: parseInt(value),
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+ Updates</SelectItem>
                      <SelectItem value="2">2+ Updates</SelectItem>
                      <SelectItem value="3">3+ Updates</SelectItem>
                      <SelectItem value="5">5+ Updates</SelectItem>
                      <SelectItem value="10">10+ Updates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
