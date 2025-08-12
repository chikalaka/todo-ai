import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import {
  SortSettings,
  DEFAULT_SORT_SETTINGS,
  UserSettingsInsert,
  UserSettingsUpdate,
} from "@/lib/types/database.types"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user settings from database
    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("age_weight, priority_weight")
      .eq("user_id", user.id)
      .single()

    if (error) {
      // If no settings found, return defaults
      if (error.code === "PGRST116") {
        return NextResponse.json(DEFAULT_SORT_SETTINGS)
      }
      throw error
    }

    // Convert database format to SortSettings format
    const sortSettings: SortSettings = {
      ageWeight: settings.age_weight,
      priorityWeight: settings.priority_weight,
    }

    return NextResponse.json(sortSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ageWeight, priorityWeight }: SortSettings = body

    // Validate the settings
    if (
      typeof ageWeight !== "number" ||
      typeof priorityWeight !== "number" ||
      ageWeight < 0 ||
      ageWeight > 1 ||
      priorityWeight < 0 ||
      priorityWeight > 1
    ) {
      return NextResponse.json(
        { error: "Invalid settings values" },
        { status: 400 },
      )
    }

    // Try to update existing settings first
    const { data: updateData, error: updateError } = await supabase
      .from("user_settings")
      .update({
        age_weight: ageWeight,
        priority_weight: priorityWeight,
        updated_at: new Date().toISOString(),
      } as UserSettingsUpdate)
      .eq("user_id", user.id)
      .select()

    // If no rows were updated, insert new settings
    if (updateError || !updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          age_weight: ageWeight,
          priority_weight: priorityWeight,
        } as UserSettingsInsert)
        .select()

      if (insertError) {
        throw insertError
      }
    }

    const sortSettings: SortSettings = {
      ageWeight,
      priorityWeight,
    }

    return NextResponse.json(sortSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete user settings (this will reset to defaults)
    const { error } = await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json(DEFAULT_SORT_SETTINGS)
  } catch (error) {
    console.error("Error deleting settings:", error)
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 },
    )
  }
}
