"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useTodos } from "@/lib/hooks/useTodos"
import { useTags } from "@/lib/hooks/useTags"
import { TodoItem } from "./TodoItem"
import { TodoWithTags, Tag } from "@/lib/types/database.types"

interface TodoListProps {
  showArchived?: boolean
}

export function TodoList({ showArchived = false }: TodoListProps) {
  const { todos, isLoading, error } = useTodos(showArchived)
  const { tags } = useTags()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([])

  const handleTagFilterToggle = (tagId: string) => {
    setSelectedTagFilters((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    )
  }

  const clearTagFilters = () => {
    setSelectedTagFilters([])
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setSelectedTagFilters([])
  }

  const filteredTodos = todos.filter((todo: TodoWithTags) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    const matchesStatus = statusFilter === "all" || todo.status === statusFilter

    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "high" && todo.priority >= 8) ||
      (priorityFilter === "medium" &&
        todo.priority >= 4 &&
        todo.priority <= 7) ||
      (priorityFilter === "low" && todo.priority <= 3)

    const matchesTags =
      selectedTagFilters.length === 0 ||
      selectedTagFilters.every((tagId) =>
        todo.tags?.some((tag) => tag.id === tagId),
      )

    return matchesSearch && matchesStatus && matchesPriority && matchesTags
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading todos...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading todos: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasActiveFilters =
    selectedTagFilters.length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    searchTerm

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="space-y-4">
          {/* Main Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search todos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-full sm:w-40">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High (8-10)</SelectItem>
                  <SelectItem value="medium">Medium (4-7)</SelectItem>
                  <SelectItem value="low">Low (1-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="default"
                onClick={clearAllFilters}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Tag Filters */}
          {tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Tags:
                </label>
                {selectedTagFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTagFilters}
                    className="text-xs h-6 px-2 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear Tags
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: Tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTagFilters.includes(tag.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => handleTagFilterToggle(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="text-sm text-gray-600 pt-2 border-t">
              Showing {filteredTodos.length} of {todos.length}{" "}
              {showArchived ? "archived" : "active"} todos
              {selectedTagFilters.length > 0 &&
                ` with ${selectedTagFilters.length} tag filter(s)`}
            </div>
          )}
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              {todos.length === 0
                ? showArchived
                  ? "No archived todos yet."
                  : "No todos yet. Create your first todo!"
                : "No todos match your filters."}
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} showArchived={showArchived} />
          ))
        )}
      </div>
    </div>
  )
}
