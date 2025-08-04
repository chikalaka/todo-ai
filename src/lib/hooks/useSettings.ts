"use client"

import { useState, useEffect } from "react"
import { SortSettings } from "@/lib/types/database.types"
import {
  getSortSettings,
  setSortSettings,
  resetSortSettings,
} from "@/lib/settings"

export function useSettings() {
  const [settings, setSettings] = useState<SortSettings>(getSortSettings())

  useEffect(() => {
    // Load settings from localStorage on mount
    setSettings(getSortSettings())
  }, [])

  const updateSettings = (newSettings: Partial<SortSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    setSortSettings(updatedSettings)
  }

  const resetSettings = () => {
    resetSortSettings()
    setSettings(getSortSettings())
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
