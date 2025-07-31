"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Archive,
  Trash2,
  Tags,
  ChevronDown,
  ChevronUp,
  ArchiveRestore,
} from "lucide-react"
import { useTodos } from "@/lib/hooks/useTodos"
import { TagInput } from "./TagInput"
import { TodoWithTags } from "@/lib/types/database.types"

interface TodoItemProps {
  todo: TodoWithTags
  showArchived?: boolean
}

export function TodoItem({ todo, showArchived = false }: TodoItemProps) {
  const {
    updateTodo,
    deleteTodo,
    archiveTodo,
    unarchiveTodo,
    isDeleting,
    isArchiving,
    isUnarchiving,
  } = useTodos(showArchived)
  const [showTagInput, setShowTagInput] = useState(false)

  const handleStatusChange = (newStatus: "todo" | "in_progress" | "done") => {
    updateTodo({
      id: todo.id,
      updates: { status: newStatus },
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const isPastDue =
    todo.due_date &&
    new Date(todo.due_date) < new Date() &&
    todo.status !== "done"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "done":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return "bg-green-100 text-green-800"
    if (priority <= 7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <Card
      className={`transition-all ${
        showArchived ? "bg-gray-50 border-gray-200" : ""
      } ${todo.status === "done" ? "opacity-60" : ""} ${
        isPastDue ? "border-red-300" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Status Dropdown - Disabled for archived todos */}
            <div className="min-w-[140px]">
              <Select
                value={todo.status}
                onValueChange={handleStatusChange}
                disabled={showArchived}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium ${
                      todo.status === "done" ? "line-through text-gray-500" : ""
                    } ${showArchived ? "text-gray-600" : ""}`}
                  >
                    {todo.title}
                  </h3>
                  {showArchived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(todo.status)}>
                    {todo.status.replace("_", " ")}
                  </Badge>
                  <Badge className={getPriorityColor(todo.priority)}>
                    P{todo.priority}
                  </Badge>
                </div>
              </div>

              {todo.description && (
                <p
                  className={`text-sm text-gray-600 ${
                    todo.status === "done" ? "line-through" : ""
                  }`}
                >
                  {todo.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Created: {formatDate(todo.created_at)}</span>
                  {todo.due_date && (
                    <span
                      className={isPastDue ? "text-red-600 font-medium" : ""}
                    >
                      Due: {formatDate(todo.due_date)}
                    </span>
                  )}
                  {showArchived && (
                    <span>Archived: {formatDate(todo.updated_at)}</span>
                  )}
                </div>
              </div>

              {/* Tags Display and Management */}
              <div className="space-y-2">
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {!showArchived && (
                  <>
                    {showTagInput && (
                      <div className="mt-2">
                        <TagInput
                          selectedTags={todo.tags || []}
                          onTagsChange={() => {}} // This will be handled by the todoId prop
                          todoId={todo.id}
                        />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTagInput(!showTagInput)}
                      className="text-xs h-6 px-2 flex items-center gap-1"
                    >
                      <Tags className="h-3 w-3" />
                      {showTagInput ? (
                        <>
                          Hide Tags <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Manage Tags <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {showArchived ? (
              // Actions for archived todos
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unarchiveTodo(todo.id)}
                  disabled={isUnarchiving}
                  className="flex items-center gap-1"
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Unarchive
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTodo(todo.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              // Actions for active todos
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => archiveTodo(todo.id)}
                  disabled={isArchiving}
                  className="flex items-center gap-1"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTodo(todo.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
