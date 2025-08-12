"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SortSettings, DEFAULT_SORT_SETTINGS } from "@/lib/types/database.types"
import {
  fetchSettingsFromDB,
  saveSettingsToDB,
  resetSettingsInDB,
  getSortSettingsFromLocalStorage,
  clearLocalStorageSettings,
} from "@/lib/settings"
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "sonner"

export function useSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Query to fetch settings from database
  const settingsQuery = useQuery({
    queryKey: ["settings", user?.id],
    queryFn: async (): Promise<SortSettings> => {
      if (!user) return DEFAULT_SORT_SETTINGS

      try {
        // First, try to get settings from database
        const dbSettings = await fetchSettingsFromDB()

        // Check if we need to migrate from localStorage
        const localSettings = getSortSettingsFromLocalStorage()
        if (localSettings && !hasUserSettings(dbSettings)) {
          // Migrate localStorage settings to database
          await saveSettingsToDB(localSettings)
          clearLocalStorageSettings()
          toast.success("Settings migrated to cloud storage")
          return localSettings
        }

        return dbSettings
      } catch (error) {
        console.warn(
          "Failed to fetch settings from database, using localStorage fallback:",
          error,
        )
        return getSortSettingsFromLocalStorage() || DEFAULT_SORT_SETTINGS
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SortSettings>) => {
      if (!user) throw new Error("User not authenticated")

      const currentSettings = settingsQuery.data || DEFAULT_SORT_SETTINGS
      const updatedSettings = { ...currentSettings, ...newSettings }

      await saveSettingsToDB(updatedSettings)
      return updatedSettings
    },
    onSuccess: (updatedSettings) => {
      // Update the cache with new settings
      queryClient.setQueryData(["settings", user?.id], updatedSettings)
    },
    onError: (error) => {
      console.error("Failed to update settings:", error)
      toast.error("Failed to save settings")
    },
  })

  // Mutation to reset settings
  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated")

      await resetSettingsInDB()
      return DEFAULT_SORT_SETTINGS
    },
    onSuccess: (defaultSettings) => {
      // Update the cache with default settings
      queryClient.setQueryData(["settings", user?.id], defaultSettings)
      toast.success("Settings reset to defaults")
    },
    onError: (error) => {
      console.error("Failed to reset settings:", error)
      toast.error("Failed to reset settings")
    },
  })

  const updateSettings = (newSettings: Partial<SortSettings>) => {
    updateSettingsMutation.mutate(newSettings)
  }

  const resetSettings = () => {
    resetSettingsMutation.mutate()
  }

  return {
    settings: settingsQuery.data || DEFAULT_SORT_SETTINGS,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings,
    resetSettings,
    isUpdating: updateSettingsMutation.isPending,
    isResetting: resetSettingsMutation.isPending,
  }
}

// Helper function to check if settings are from database (not defaults)
function hasUserSettings(settings: SortSettings): boolean {
  // If settings exactly match defaults, assume they came from defaults, not user settings
  return !(
    settings.ageWeight === DEFAULT_SORT_SETTINGS.ageWeight &&
    settings.priorityWeight === DEFAULT_SORT_SETTINGS.priorityWeight
  )
}
