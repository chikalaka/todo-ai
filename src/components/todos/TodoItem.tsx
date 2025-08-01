"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Archive,
  Trash2,
  Tags,
  ChevronDown,
  ChevronUp,
  ArchiveRestore,
  Calendar,
  Clock,
  Edit3,
  Check,
  X,
  CalendarX,
  Edit2,
  Pencil,
} from "lucide-react"
import { useTodos } from "@/lib/hooks/useTodos"
import { TagInput } from "./TagInput"
import { TodoDescription } from "./TodoDescription"
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
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || "",
    priority: todo.priority,
    due_date: todo.due_date || "",
  })
  const [editedTitle, setEditedTitle] = useState(todo.title)
  const [editedDescription, setEditedDescription] = useState(
    todo.description || "",
  )

  const handleStatusChange = (newStatus: "todo" | "in_progress" | "done") => {
    updateTodo({
      id: todo.id,
      updates: { status: newStatus },
    })
  }

  const handlePriorityChange = (newPriority: string) => {
    updateTodo({
      id: todo.id,
      updates: { priority: parseInt(newPriority) },
    })
  }

  const handleSaveEdit = () => {
    updateTodo({
      id: todo.id,
      updates: {
        title: editData.title,
        description: editData.description || null,
        priority: editData.priority,
        due_date: editData.due_date || null,
      },
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      due_date: todo.due_date || "",
    })
    setIsEditing(false)
  }

  const handleClearDueDate = () => {
    setEditData({ ...editData, due_date: "" })
  }

  const handleTitleSave = () => {
    updateTodo({
      id: todo.id,
      updates: { title: editedTitle },
    })
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setEditedTitle(todo.title)
    setIsEditingTitle(false)
  }

  const handleDescriptionSave = () => {
    updateTodo({
      id: todo.id,
      updates: { description: editedDescription || null },
    })
    setIsEditingDescription(false)
  }

  const handleDescriptionCancel = () => {
    setEditedDescription(todo.description || "")
    setIsEditingDescription(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split("T")[0]
  }

  const isPastDue =
    todo.due_date &&
    new Date(todo.due_date) < new Date() &&
    todo.status !== "done"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "done":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "todo":
        return "Todo"
      case "in_progress":
        return "In Progress"
      case "done":
        return "Done"
      default:
        return "Todo"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return "bg-green-100 text-green-800 border-green-200"
    if (priority <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getPriorityLabel = (priority: number) => {
    if (priority <= 3) return "Low"
    if (priority <= 7) return "Medium"
    return "High"
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        showArchived ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
      } ${todo.status === "done" ? "opacity-75" : ""} ${
        isPastDue ? "border-red-300 bg-red-50/30" : ""
      } hover:shadow-sm hover:border-gray-300`}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={todo.id} className="border-none">
          <AccordionTrigger
            asChild
            className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-gray-200"
          >
            <div className="flex items-center justify-between w-full">
              {/* Left side - Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Title */}
                {isEditingTitle ? (
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-sm flex-1"
                      autoFocus
                    />
                    <Button
                      onClick={handleTitleSave}
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={handleTitleCancel}
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3
                      className={`font-medium text-left truncate ${
                        todo.status === "done"
                          ? "line-through text-gray-500"
                          : ""
                      } ${showArchived ? "text-gray-600" : "text-gray-900"}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {todo.title}
                    </h3>
                    {!showArchived && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditingTitle(true)
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}

                {showArchived && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Archived
                  </Badge>
                )}
              </div>

              {/* Right side - Priority, Status Dropdowns, and Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Priority Dropdown */}
                {!showArchived && (
                  <Select
                    value={todo.priority.toString()}
                    onValueChange={handlePriorityChange}
                    disabled={showArchived}
                  >
                    <SelectTrigger
                      className={`h-8 w-24 text-xs ${getPriorityColor(
                        todo.priority,
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                        <SelectItem
                          key={priority}
                          value={priority.toString()}
                          className={getPriorityColor(priority)}
                        >
                          P{priority} - {getPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Status Dropdown */}
                {!showArchived && (
                  <Select
                    value={todo.status}
                    onValueChange={handleStatusChange}
                    disabled={showArchived}
                  >
                    <SelectTrigger
                      className={`h-8 w-28 text-xs ${getStatusColor(
                        todo.status,
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="todo"
                        className={getStatusColor("todo")}
                      >
                        Todo
                      </SelectItem>
                      <SelectItem
                        value="in_progress"
                        className={getStatusColor("in_progress")}
                      >
                        In Progress
                      </SelectItem>
                      <SelectItem
                        value="done"
                        className={getStatusColor("done")}
                      >
                        Done
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Show badges for archived items */}
                {showArchived && (
                  <>
                    <Badge
                      className={`${getPriorityColor(todo.priority)} text-xs`}
                    >
                      P{todo.priority} - {getPriorityLabel(todo.priority)}
                    </Badge>
                    <Badge className={`${getStatusColor(todo.status)} text-xs`}>
                      {getStatusDisplay(todo.status)}
                    </Badge>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {showArchived ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          unarchiveTodo(todo.id)
                        }}
                        disabled={isUnarchiving}
                        className="h-8 px-2"
                      >
                        <ArchiveRestore className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTodo(todo.id)
                        }}
                        disabled={isDeleting}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          archiveTodo(todo.id)
                        }}
                        disabled={isArchiving}
                        className="h-8 px-2"
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTodo(todo.id)
                        }}
                        disabled={isDeleting}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              {/* Edit Mode */}
              {isEditing && !showArchived ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Edit Todo</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="h-7 px-3"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-7 px-3"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Edit Title */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <Input
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* Edit Description */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Add a description..."
                      className="text-sm min-h-20"
                    />
                  </div>

                  {/* Edit Priority */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <Select
                      value={editData.priority.toString()}
                      onValueChange={(value) =>
                        setEditData({ ...editData, priority: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                          <SelectItem
                            key={priority}
                            value={priority.toString()}
                          >
                            P{priority} -{" "}
                            {priority <= 3
                              ? "Low"
                              : priority <= 7
                              ? "Medium"
                              : "High"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Edit Due Date */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={formatDateForInput(editData.due_date)}
                        onChange={(e) =>
                          setEditData({ ...editData, due_date: e.target.value })
                        }
                        className="text-sm flex-1"
                      />
                      {editData.due_date && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearDueDate}
                          className="h-9 px-3"
                        >
                          <CalendarX className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Description */}
                  {(todo.description || isEditingDescription) && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      {isEditingDescription ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editedDescription}
                            onChange={(e) =>
                              setEditedDescription(e.target.value)
                            }
                            placeholder="Add description..."
                            className="text-sm min-h-[80px]"
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
                          <TodoDescription
                            description={todo.description || "No description"}
                            className={`text-sm text-gray-600 flex-1 ${
                              todo.status === "done" ? "line-through" : ""
                            }`}
                          />
                          {!showArchived && (
                            <Button
                              onClick={() => setIsEditingDescription(true)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!todo.description &&
                    !isEditingDescription &&
                    !showArchived && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 italic">
                            No description
                          </span>
                          <Button
                            onClick={() => setIsEditingDescription(true)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Created: {formatDate(todo.created_at)}</span>
                    </div>

                    {todo.due_date && (
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          isPastDue
                            ? "text-red-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(todo.due_date)}</span>
                        {isPastDue && (
                          <span className="text-xs">(Overdue)</span>
                        )}
                      </div>
                    )}

                    {showArchived && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Archive className="h-4 w-4" />
                        <span>Archived: {formatDate(todo.updated_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-3">
                    {todo.tags && todo.tags.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {todo.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {!showArchived && (
                      <div className="space-y-2">
                        {showTagInput && (
                          <TagInput
                            selectedTags={todo.tags || []}
                            onTagsChange={() => {}}
                            todoId={todo.id}
                          />
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTagInput(!showTagInput)}
                          className="text-xs h-7 px-3 flex items-center gap-1"
                        >
                          <Tags className="h-3 w-3" />
                          {showTagInput ? (
                            <>
                              Hide Tag Editor <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Manage Tags <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
