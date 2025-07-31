"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Tag, TagInsert, TagUpdate } from "@/lib/types/database.types"
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "sonner"

export function useTags() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: async (): Promise<Tag[]> => {
      if (!user) return []

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  const createTagMutation = useMutation({
    mutationFn: async (tag: Omit<TagInsert, "user_id">) => {
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("tags")
        .insert({
          ...tag,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      toast.success("Tag created successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to create tag: ${error.message}`)
    },
  })

  const updateTagMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Omit<TagUpdate, "id">
    }) => {
      const { data, error } = await supabase
        .from("tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      toast.success("Tag updated successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to update tag: ${error.message}`)
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      toast.success("Tag deleted successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to delete tag: ${error.message}`)
    },
  })

  const addTagToTodoMutation = useMutation({
    mutationFn: async ({
      tagId,
      todoId,
    }: {
      tagId: string
      todoId: string
    }) => {
      const { error } = await supabase
        .from("tag_todo")
        .insert({ tag_id: tagId, todo_id: todoId })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
    onError: (error) => {
      toast.error(`Failed to add tag: ${error.message}`)
    },
  })

  const removeTagFromTodoMutation = useMutation({
    mutationFn: async ({
      tagId,
      todoId,
    }: {
      tagId: string
      todoId: string
    }) => {
      const { error } = await supabase
        .from("tag_todo")
        .delete()
        .eq("tag_id", tagId)
        .eq("todo_id", todoId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
    onError: (error) => {
      toast.error(`Failed to remove tag: ${error.message}`)
    },
  })

  return {
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error,
    createTag: createTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    addTagToTodo: addTagToTodoMutation.mutate,
    removeTagFromTodo: removeTagFromTodoMutation.mutate,
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  }
}
