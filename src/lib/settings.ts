import { SortSettings, DEFAULT_SORT_SETTINGS } from "./types/database.types"

const SETTINGS_STORAGE_KEY = "todo-app-settings"

// Database API functions
export async function fetchSettingsFromDB(): Promise<SortSettings> {
  try {
    const response = await fetch("/api/settings")
    if (!response.ok) {
      throw new Error("Failed to fetch settings")
    }
    return await response.json()
  } catch (error) {
    console.warn("Error fetching settings from database:", error)
    return DEFAULT_SORT_SETTINGS
  }
}

export async function saveSettingsToDB(settings: SortSettings): Promise<void> {
  try {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error("Failed to save settings")
    }
  } catch (error) {
    console.warn("Error saving settings to database:", error)
    throw error
  }
}

export async function resetSettingsInDB(): Promise<void> {
  try {
    const response = await fetch("/api/settings", {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to reset settings")
    }
  } catch (error) {
    console.warn("Error resetting settings in database:", error)
    throw error
  }
}

// Legacy localStorage functions (for migration and fallback)
export function getSortSettingsFromLocalStorage(): SortSettings | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate the settings
      if (
        typeof parsed.ageWeight === "number" &&
        typeof parsed.priorityWeight === "number" &&
        parsed.ageWeight >= 0 &&
        parsed.ageWeight <= 1 &&
        parsed.priorityWeight >= 0 &&
        parsed.priorityWeight <= 1
      ) {
        return parsed
      }
    }
  } catch (error) {
    console.warn("Error reading settings from localStorage:", error)
  }

  return null
}

export function clearLocalStorageSettings(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
  } catch (error) {
    console.warn("Error removing settings from localStorage:", error)
  }
}

// Fallback function for SSR and backward compatibility
export function getSortSettings(): SortSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SORT_SETTINGS
  }

  // Try localStorage first for immediate return
  const localSettings = getSortSettingsFromLocalStorage()
  return localSettings || DEFAULT_SORT_SETTINGS
}

// Legacy functions for backward compatibility (deprecated)
export function setSortSettings(settings: SortSettings): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn("Error saving settings to localStorage:", error)
  }
}

export function resetSortSettings(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
  } catch (error) {
    console.warn("Error removing settings from localStorage:", error)
  }
}
