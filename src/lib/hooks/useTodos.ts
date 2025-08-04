"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  Todo,
  TodoInsert,
  TodoUpdate,
  TodoWithTags,
  SortSettings,
} from "@/lib/types/database.types"
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "sonner"
import { getSortSettings } from "@/lib/settings"

export function useTodos(showArchived = false) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const todosQuery = useQuery({
    queryKey: ["todos", showArchived, getSortSettings()],
    queryFn: async (): Promise<TodoWithTags[]> => {
      if (!user) return []

      // Get sort settings for the custom sorting algorithm
      const sortSettings = getSortSettings()

      // First get all todos for the user (archived or not based on parameter)
      const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("archived", showArchived)
        .order("created_at", { ascending: false }) // Fallback order

      if (todosError) throw todosError

      if (!todosData || todosData.length === 0) {
        return []
      }

      // Then get all tag associations for these todos
      const todoIds = todosData.map((todo) => todo.id)
      const { data: tagData, error: tagError } = await supabase
        .from("tag_todo")
        .select(
          `
          todo_id,
          tags(*)
        `,
        )
        .in("todo_id", todoIds)

      if (tagError) throw tagError

      // Combine todos with their tags
      const todosWithTags = todosData.map((todo) => ({
        ...todo,
        tags:
          tagData
            ?.filter((tagRelation) => tagRelation.todo_id === todo.id)
            ?.map((tagRelation) => tagRelation.tags)
            ?.filter(Boolean) || [],
      }))

      // Sort todos using the custom algorithm
      const sortedTodos = todosWithTags.sort((a, b) => {
        const now = new Date().getTime()
        const aAge = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60) // hours
        const bAge = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60) // hours

        const aScore =
          aAge * sortSettings.ageWeight +
          a.priority * sortSettings.priorityWeight
        const bScore =
          bAge * sortSettings.ageWeight +
          b.priority * sortSettings.priorityWeight

        return bScore - aScore // Higher score first
      })

      return sortedTodos
    },
    enabled: !!user,
  })

  const createTodoMutation = useMutation({
    mutationFn: async (todo: Omit<TodoInsert, "user_id">) => {
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("todos")
        .insert({
          ...todo,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      toast.success("Todo created successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to create todo: ${error.message}`)
    },
  })

  // New bulk creation mutation
  const createBulkTodosMutation = useMutation({
    mutationFn: async (todos: Array<Omit<TodoInsert, "user_id">>) => {
      if (!user) throw new Error("User not authenticated")

      const todosWithUser = todos.map((todo) => ({
        ...todo,
        user_id: user.id,
      }))

      const { data, error } = await supabase
        .from("todos")
        .insert(todosWithUser)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      toast.success(
        `${data.length} todo${
          data.length > 1 ? "s" : ""
        } created successfully!`,
      )
    },
    onError: (error) => {
      toast.error(`Failed to create todos: ${error.message}`)
    },
  })

  const updateTodoMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: TodoUpdate
    }) => {
      const { data, error } = await supabase
        .from("todos")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      toast.success("Todo updated successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to update todo: ${error.message}`)
    },
  })

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      toast.success("Todo deleted successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to delete todo: ${error.message}`)
    },
  })

  const archiveTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("todos")
        .update({
          archived: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      toast.success("Todo archived successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to archive todo: ${error.message}`)
    },
  })

  const unarchiveTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("todos")
        .update({
          archived: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      toast.success("Todo unarchived successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to unarchive todo: ${error.message}`)
    },
  })

  return {
    todos: todosQuery.data || [],
    isLoading: todosQuery.isLoading,
    error: todosQuery.error,
    createTodo: createTodoMutation.mutate,
    createBulkTodos: createBulkTodosMutation.mutate,
    isCreating: createTodoMutation.isPending,
    isBulkCreating: createBulkTodosMutation.isPending,
    updateTodo: updateTodoMutation.mutate,
    isUpdating: updateTodoMutation.isPending,
    deleteTodo: deleteTodoMutation.mutate,
    isDeleting: deleteTodoMutation.isPending,
    archiveTodo: archiveTodoMutation.mutate,
    isArchiving: archiveTodoMutation.isPending,
    unarchiveTodo: unarchiveTodoMutation.mutate,
    isUnarchiving: unarchiveTodoMutation.isPending,
  }
}
