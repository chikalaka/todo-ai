export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          due_date: string | null
          status: "todo" | "in_progress" | "done"
          priority: number
          archived: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          due_date?: string | null
          status?: "todo" | "in_progress" | "done"
          priority?: number
          archived?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          due_date?: string | null
          status?: "todo" | "in_progress" | "done"
          priority?: number
          archived?: boolean
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      tag_todo: {
        Row: {
          tag_id: string
          todo_id: string
        }
        Insert: {
          tag_id: string
          todo_id: string
        }
        Update: {
          tag_id?: string
          todo_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Todo = Database["public"]["Tables"]["todos"]["Row"]
export type TodoInsert = Database["public"]["Tables"]["todos"]["Insert"]
export type TodoUpdate = Database["public"]["Tables"]["todos"]["Update"]

export type Tag = Database["public"]["Tables"]["tags"]["Row"]
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"]
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"]

export type TodoWithTags = Todo & {
  tags: Tag[]
}

// Settings types
export interface SortSettings {
  ageWeight: number // 0.0 to 1.0 - weight for age/creation time
  priorityWeight: number // 0.0 to 1.0 - weight for priority
}

export const DEFAULT_SORT_SETTINGS: SortSettings = {
  ageWeight: 0.5,
  priorityWeight: 0.5,
}
