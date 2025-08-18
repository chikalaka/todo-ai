"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Trash2, Edit3, Check, X, Edit2, Pencil } from "lucide-react"

interface ProcessedTodo {
  title: string
  description?: string
  priority: number
  status?: "todo" | "in_progress" | "done" | "blocked"
  due_date?: string
  tags?: string[]
  transcription_segment: string
}

interface EditableTodoCardProps {
  todo: ProcessedTodo
  index: number
  onUpdate: (index: number, updatedTodo: ProcessedTodo) => void
  onDelete: (index: number) => void
}

export function EditableTodoCard({
  todo,
  index,
  onUpdate,
  onDelete,
}: EditableTodoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedTodo, setEditedTodo] = useState<ProcessedTodo>(todo)
  const [editedTitle, setEditedTitle] = useState(todo.title)
  const [editedDescription, setEditedDescription] = useState(
    todo.description || "",
  )

  const handleSave = () => {
    onUpdate(index, editedTodo)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTodo(todo)
    setIsEditing(false)
  }

  const handleTitleSave = () => {
    const updatedTodo = { ...todo, title: editedTitle }
    onUpdate(index, updatedTodo)
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setEditedTitle(todo.title)
    setIsEditingTitle(false)
  }

  const handleDescriptionSave = () => {
    const updatedTodo = { ...todo, description: editedDescription }
    onUpdate(index, updatedTodo)
    setIsEditingDescription(false)
  }

  const handleDescriptionCancel = () => {
    setEditedDescription(todo.description || "")
    setIsEditingDescription(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "No due date"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "done":
        return "bg-green-100 text-green-800 border-green-200"
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return "bg-green-100 text-green-800 border-green-200"
    if (priority <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case "todo":
        return "Todo"
      case "in_progress":
        return "In Progress"
      case "done":
        return "Done"
      case "blocked":
        return "Blocked"
      default:
        return "Todo"
    }
  }

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              Editing Todo
            </span>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="h-7 px-2">
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Title
            </label>
            <Input
              value={editedTodo.title}
              onChange={(e) =>
                setEditedTodo({ ...editedTodo, title: e.target.value })
              }
              placeholder="Todo title"
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Description
            </label>
            <Textarea
              value={editedTodo.description || ""}
              onChange={(e) =>
                setEditedTodo({ ...editedTodo, description: e.target.value })
              }
              placeholder="Add description (optional)"
              className="text-sm min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Priority
              </label>
              <Select
                value={editedTodo.priority.toString()}
                onValueChange={(value) =>
                  setEditedTodo({ ...editedTodo, priority: parseInt(value) })
                }
              >
                <SelectTrigger
                  className={`text-sm ${getPriorityColor(editedTodo.priority)}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <SelectItem
                      key={p}
                      value={p.toString()}
                      className={getPriorityColor(p)}
                    >
                      P{p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <Select
                value={editedTodo.status || "todo"}
                onValueChange={(value: "todo" | "in_progress" | "done") =>
                  setEditedTodo({ ...editedTodo, status: value })
                }
              >
                <SelectTrigger
                  className={`text-sm ${getStatusColor(
                    editedTodo.status || "todo",
                  )}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo" className={getStatusColor("todo")}>
                    Todo
                  </SelectItem>
                  <SelectItem
                    value="in_progress"
                    className={getStatusColor("in_progress")}
                  >
                    In Progress
                  </SelectItem>
                  <SelectItem value="done" className={getStatusColor("done")}>
                    Done
                  </SelectItem>
                  <SelectItem
                    value="blocked"
                    className={getStatusColor("blocked")}
                  >
                    Blocked
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Due Date
              </label>
              <Input
                type="date"
                value={formatDate(editedTodo.due_date)}
                onChange={(e) =>
                  setEditedTodo({
                    ...editedTodo,
                    due_date: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
                className="text-sm"
              />
            </div>
          </div>

          <div className="bg-white p-2 rounded border border-blue-200">
            <span className="text-xs font-medium text-blue-700">
              🎤 Original transcription:
            </span>
            <p className="text-xs text-blue-600 italic mt-1">
              &quot;{todo.transcription_segment}&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 pr-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-sm flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleTitleSave}
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleTitleCancel}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <h3 className="font-medium text-gray-900 flex-1">
                  {todo.title}
                </h3>
                <Button
                  onClick={() => setIsEditingTitle(true)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Priority Display */}
            <div
              className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                todo.priority,
              )}`}
            >
              P{todo.priority}
            </div>

            {/* Status Display */}
            <div
              className={`px-2 py-1 rounded text-xs ${getStatusColor(
                todo.status || "todo",
              )}`}
            >
              {getStatusDisplay(todo.status)}
            </div>

            {/* Delete Button */}
            <Button
              onClick={() => onDelete(index)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(todo.description || isEditingDescription) && (
          <div className="space-y-2">
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add description..."
                  className="text-sm min-h-[60px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleDescriptionSave}
                    size="sm"
                    className="h-7 px-3"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleDescriptionCancel}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-sm text-gray-600 flex-1">
                  {todo.description || "No description"}
                </p>
                <Button
                  onClick={() => setIsEditingDescription(true)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {!todo.description && !isEditingDescription && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 italic">No description</span>
            <Button
              onClick={() => setIsEditingDescription(true)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {todo.due_date && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Due: {formatDateForDisplay(todo.due_date)}
            </span>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              Tags: {todo.tags.join(", ")}
            </span>
          )}
        </div>

        <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-200">
          <span className="text-xs font-medium text-blue-700">
            🎤 From recording:
          </span>
          <p className="text-xs text-blue-600 italic mt-1">
            &quot;{todo.transcription_segment}&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
