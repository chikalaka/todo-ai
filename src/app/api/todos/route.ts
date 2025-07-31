import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { title, description, priority, due_date, status, tags } = body

    // Validate required fields
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      )
    }

    // Create the todo
    const { data: todoData, error: todoError } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description || null,
        priority: priority || 5,
        due_date: due_date || null,
        status: status || "todo",
      })
      .select()
      .single()

    if (todoError) {
      console.error("Error creating todo:", todoError)
      return NextResponse.json(
        { success: false, error: "Failed to create todo" },
        { status: 500 },
      )
    }

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      try {
        // Create or get existing tags
        const tagPromises = tags.map(async (tagName: string) => {
          if (!tagName || typeof tagName !== "string") return null

          const trimmedTagName = tagName.trim()
          if (!trimmedTagName) return null

          // Try to find existing tag
          const { data: existingTag } = await supabase
            .from("tags")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", trimmedTagName)
            .single()

          if (existingTag) {
            return existingTag.id
          }

          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({
              user_id: user.id,
              name: trimmedTagName,
            })
            .select("id")
            .single()

          if (tagError) {
            console.error("Error creating tag:", tagError)
            return null
          }

          return newTag.id
        })

        const tagIds = (await Promise.all(tagPromises)).filter(Boolean)

        // Associate tags with the todo
        if (tagIds.length > 0) {
          const tagAssociations = tagIds.map((tagId) => ({
            tag_id: tagId,
            todo_id: todoData.id,
          }))

          const { error: associationError } = await supabase
            .from("tag_todo")
            .insert(tagAssociations)

          if (associationError) {
            console.error("Error associating tags:", associationError)
            // Don't fail the whole request for tag association errors
          }
        }
      } catch (tagError) {
        console.error("Error processing tags:", tagError)
        // Don't fail the whole request for tag errors
      }
    }

    return NextResponse.json({
      success: true,
      todo: todoData,
    })
  } catch (error) {
    console.error("Error in todo creation API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
