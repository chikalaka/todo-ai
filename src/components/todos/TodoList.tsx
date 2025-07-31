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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, X, Archive, ArchiveRestore } from "lucide-react"
import { useTodos } from "@/lib/hooks/useTodos"
import { useTags } from "@/lib/hooks/useTags"
import { TodoItem } from "./TodoItem"
import { TodoWithTags, Tag } from "@/lib/types/database.types"

export function TodoList() {
  const [showArchived, setShowArchived] = useState(false)
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

  const todoStats = {
    total: todos.length,
    todo: todos.filter((t) => t.status === "todo").length,
    inProgress: todos.filter((t) => t.status === "in_progress").length,
    done: todos.filter((t) => t.status === "done").length,
  }

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

  return (
    <div className="space-y-6">
      {/* Archive Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                {showArchived ? "Archived Todos" : "Active Todos"}
              </h2>
              <Badge variant={showArchived ? "secondary" : "default"}>
                {showArchived
                  ? `${todos.length} archived`
                  : `${todos.length} active`}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={!showArchived ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchived(false)}
                className="flex items-center gap-2"
              >
                <ArchiveRestore className="h-4 w-4" />
                Active
              </Button>
              <Button
                variant={showArchived ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchived(true)}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archived
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats - Only show for active todos */}
      {!showArchived && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{todoStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {todoStats.todo}
              </div>
              <div className="text-sm text-gray-600">Todo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todoStats.inProgress}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {todoStats.done}
              </div>
              <div className="text-sm text-gray-600">Done</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            {(selectedTagFilters.length > 0 ||
              statusFilter !== "all" ||
              priorityFilter !== "all" ||
              searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Dropdowns */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search todos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-40">
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
              <div className="w-40">
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
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
            </div>

            {/* Tag Filters */}
            {tags.length > 0 && (
              <div className="space-y-2">
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
                      Clear
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
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleTagFilterToggle(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(selectedTagFilters.length > 0 ||
              statusFilter !== "all" ||
              priorityFilter !== "all" ||
              searchTerm) && (
              <div className="text-sm text-gray-600">
                Showing {filteredTodos.length} of {todos.length}{" "}
                {showArchived ? "archived" : "active"} todos
                {selectedTagFilters.length > 0 &&
                  ` with ${selectedTagFilters.length} tag filter(s)`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Todo List */}
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
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
