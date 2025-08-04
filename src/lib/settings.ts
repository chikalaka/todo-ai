import { SortSettings, DEFAULT_SORT_SETTINGS } from "./types/database.types"

const SETTINGS_STORAGE_KEY = "todo-app-settings"

export function getSortSettings(): SortSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SORT_SETTINGS
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

  return DEFAULT_SORT_SETTINGS
}

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
