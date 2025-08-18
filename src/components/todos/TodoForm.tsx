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

import { Plus, Calendar, AlertCircle, FileText } from "lucide-react"
import { useTodos } from "@/lib/hooks/useTodos"
import { useTags } from "@/lib/hooks/useTags"
import { TagInput } from "./TagInput"
import { TodoInsert, Tag } from "@/lib/types/database.types"

interface TodoFormProps {
  onSuccess?: () => void
}

export function TodoForm({ onSuccess }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("5")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<
    "todo" | "in_progress" | "done" | "blocked"
  >("todo")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  const { createTodo, isCreating } = useTodos()
  const { addTagToTodo } = useTags()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const todoData: Omit<TodoInsert, "user_id"> = {
      title: title.trim(),
      description: description.trim() || null,
      priority: parseInt(priority),
      due_date: dueDate || null,
      status,
    }

    // Create the todo first
    createTodo(todoData)

    // Note: We'll need to handle tag associations after todo creation
    // For now, we'll reset the form and let the user add tags after creation

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("5")
    setDueDate("")
    setStatus("todo")
    setSelectedTags([])

    onSuccess?.()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Todo title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                  <SelectItem key={p} value={p.toString()}>
                    Priority {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={status}
              onValueChange={(
                value: "todo" | "in_progress" | "done" | "blocked",
              ) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Due date (optional)"
              className="pl-10"
            />
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Tags (you can add tags after creating the todo)
          </label>
          <TagInput
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

        <Button
          type="submit"
          disabled={isCreating || !title.trim()}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Creating..." : "Create Todo"}
        </Button>
      </form>
    </div>
  )
}
