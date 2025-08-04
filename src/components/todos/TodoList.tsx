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
    <div className="space-y-4">
      {/* Modern Filters Bar */}
      <div className="space-y-4">
        {/* Main Filters Row */}
        <div className="flex gap-2 items-center">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto bg-white/70 border-gray-200 focus:bg-white transition-colors">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-auto bg-white/70 border-gray-200 focus:bg-white transition-colors">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High (8-10)</SelectItem>
              <SelectItem value="medium">Medium (4-7)</SelectItem>
              <SelectItem value="low">Low (1-3)</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 shrink-0"
            >
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* Tag Filters Section */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
              {selectedTagFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTagFilters}
                  className="text-xs h-6 px-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  variant={
                    selectedTagFilters.includes(tag.id)
                      ? "default"
                      : "secondary"
                  }
                  className="cursor-pointer hover:scale-105 transition-all duration-150 text-xs py-1 px-2"
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
          <div className="flex items-center gap-2 text-xs text-gray-500 py-2 border-t border-gray-100">
            <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
            <span>
              {filteredTodos.length} of {todos.length}{" "}
              {showArchived ? "archived" : "active"} todos
              {selectedTagFilters.length > 0 && (
                <span className="ml-1">
                  • {selectedTagFilters.length} tag
                  {selectedTagFilters.length > 1 ? "s" : ""} selected
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-sm">
              {hasActiveFilters
                ? "No todos match your current filters"
                : `No ${showArchived ? "archived" : "active"} todos found`}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="mt-2 text-xs"
              >
                Clear filters to see all todos
              </Button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo: TodoWithTags) => (
            <TodoItem key={todo.id} todo={todo} showArchived={showArchived} />
          ))
        )}
      </div>
    </div>
  )
}
