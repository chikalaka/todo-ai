"use client"

import { useState } from "react"
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
import { useSettings } from "@/lib/hooks/useSettings"
import { SortSettings } from "@/lib/types/database.types"
import { toast } from "sonner"
import { RotateCcw } from "lucide-react"

export function SettingsForm() {
  const { settings, updateSettings, resetSettings } = useSettings()
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

  const handleReset = () => {
    resetSettings()
    setLocalSettings({ ageWeight: 0.1, priorityWeight: 0.5 })
    toast.success("Settings reset to defaults")
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todo Sorting Algorithm</CardTitle>
              <CardDescription>
                Configure how your todos are sorted by adjusting the weight
                given to age (creation time) and priority.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
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
              />
              <p className="text-xs text-muted-foreground mt-2">
                How much importance to give to todo age. Higher values
                prioritize older todos.
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
                step={0.1}
                value={[localSettings.priorityWeight]}
                onValueChange={handlePriorityWeightChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                How much importance to give to todo priority. Higher values
                prioritize high-priority todos.
              </p>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Algorithm Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="font-mono text-xs bg-background rounded p-2">
                score = (age_hours × {localSettings.ageWeight.toFixed(1)}) +
                (priority × {localSettings.priorityWeight.toFixed(1)})
              </div>
              <div className="text-muted-foreground text-xs">
                • Todos with higher scores appear first • Age is measured in
                hours since creation • Priority ranges from 1 (low) to 10 (high)
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
