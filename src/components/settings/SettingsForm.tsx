"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/lib/hooks/useSettings"
import { SortSettings, DEFAULT_SORT_SETTINGS } from "@/lib/types/database.types"
import { toast } from "sonner"
import { RotateCcw, Loader2 } from "lucide-react"

export function SettingsForm() {
  const {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    isUpdating,
    isResetting,
  } = useSettings()
  const [localSettings, setLocalSettings] = useState<SortSettings>(settings)

  const handleAgeWeightChange = (value: number[]) => {
    const newSettings = { ...localSettings, ageWeight: value[0] }
    setLocalSettings(newSettings)
    updateSettings(newSettings)
  }

  const handlePriorityWeightChange = (value: number[]) => {
    const newSettings = { ...localSettings, priorityWeight: value[0] }
    setLocalSettings(newSettings)
    updateSettings(newSettings)
  }

  // Sync localSettings when settings change
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleReset = () => {
    resetSettings()
    setLocalSettings(DEFAULT_SORT_SETTINGS)
  }

  const totalWeight = localSettings.ageWeight + localSettings.priorityWeight
  const agePercentage =
    totalWeight > 0
      ? ((localSettings.ageWeight / totalWeight) * 100).toFixed(0)
      : 50
  const priorityPercentage =
    totalWeight > 0
      ? ((localSettings.priorityWeight / totalWeight) * 100).toFixed(0)
      : 50

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sort Settings</CardTitle>
            <CardDescription>
              Customize how your todos are sorted and prioritized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todo Sorting Algorithm</CardTitle>
              <CardDescription>
                Configure how your todos are sorted. Priority dominates with age
                as a smart tiebreaker within priority groups.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="age-weight">Age Weight</Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {localSettings.ageWeight.toFixed(2)} ({agePercentage}%)
                </span>
              </div>
              <Slider
                id="age-weight"
                min={0}
                max={1}
                step={0.01}
                value={[localSettings.ageWeight]}
                onValueChange={handleAgeWeightChange}
                className="w-full"
                disabled={isUpdating || isResetting}
              />
              <p className="text-xs text-muted-foreground mt-2">
                How much age influences sorting within priority groups. Higher
                values give older todos more prominence.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="priority-weight">Priority Weight</Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {localSettings.priorityWeight.toFixed(2)} (
                  {priorityPercentage}%)
                </span>
              </div>
              <Slider
                id="priority-weight"
                min={0}
                max={1}
                step={0.01}
                value={[localSettings.priorityWeight]}
                onValueChange={handlePriorityWeightChange}
                className="w-full"
                disabled={isUpdating || isResetting}
              />
              <p className="text-xs text-muted-foreground mt-2">
                How strongly priority influences sorting. Higher values make
                priority differences more pronounced.
              </p>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Algorithm Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="font-mono text-xs bg-background rounded p-2">
                score = (priority² ×{" "}
                {(localSettings.priorityWeight * 10 + 1).toFixed(1)}) + (log_age
                ×{" "}
                {(
                  localSettings.ageWeight *
                  (localSettings.priorityWeight + 0.1)
                ).toFixed(2)}
                )
              </div>
              <div className="text-muted-foreground text-xs">
                • Priority gets exponential weighting for stronger influence •
                Age uses logarithmic scaling to prevent overwhelming priority •
                Priority 10 items virtually always stay at the top
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
