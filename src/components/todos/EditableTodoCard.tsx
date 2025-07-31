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
import { Trash2, Edit3, Check, X } from "lucide-react"

interface ProcessedTodo {
  title: string
  description?: string
  priority: number
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
  const [editedTodo, setEditedTodo] = useState<ProcessedTodo>(todo)

  const handleSave = () => {
    onUpdate(index, editedTodo)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTodo(todo)
    setIsEditing(false)
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

          <div className="grid grid-cols-2 gap-3">
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
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} {p <= 3 ? "(Low)" : p <= 6 ? "(Medium)" : "(High)"}
                    </SelectItem>
                  ))}
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
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900 flex-1 pr-2">
            {todo.title}
          </h3>
          <div className="flex gap-1">
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
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
        {todo.description && (
          <p className="text-sm text-gray-600">{todo.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded">
            Priority: {todo.priority}
          </span>
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
