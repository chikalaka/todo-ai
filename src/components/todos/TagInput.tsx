"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTags } from "@/lib/hooks/useTags"
import { Tag } from "@/lib/types/database.types"

interface TagInputProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  todoId?: string // If provided, will add/remove tags from this todo
}

export function TagInput({
  selectedTags,
  onTagsChange,
  todoId,
}: TagInputProps) {
  const [newTagName, setNewTagName] = useState("")
  const { tags, createTag, isCreating, addTagToTodo, removeTagFromTodo } =
    useTags()

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    createTag({ name: newTagName.trim() })
    setNewTagName("")
  }

  const handleAddExistingTag = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId)
    if (!tag) return

    if (todoId) {
      // If we have a todoId, add the tag to the todo in the database
      addTagToTodo({ tagId: tag.id, todoId })
    } else {
      // Otherwise, just update the local state (for form usage)
      if (!selectedTags.find((t) => t.id === tag.id)) {
        onTagsChange([...selectedTags, tag])
      }
    }
  }

  const handleRemoveTag = (tagId: string) => {
    if (todoId) {
      // If we have a todoId, remove the tag from the todo in the database
      removeTagFromTodo({ tagId, todoId })
    } else {
      // Otherwise, just update the local state (for form usage)
      onTagsChange(selectedTags.filter((t) => t.id !== tagId))
    }
  }

  const availableTags = tags.filter(
    (tag) => !selectedTags.find((selected) => selected.id === tag.id),
  )

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer hover:bg-red-50"
              onClick={() => handleRemoveTag(tag.id)}
            >
              {tag.name} ×
            </Badge>
          ))}
        </div>
      )}

      {/* Add Existing Tag */}
      {availableTags.length > 0 && (
        <div className="flex gap-2">
          <Select onValueChange={handleAddExistingTag}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add existing tag..." />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Create New Tag */}
      <div className="flex gap-2">
        <Input
          placeholder="Create new tag..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleCreateTag()
            }
          }}
        />
        <Button
          type="button"
          onClick={handleCreateTag}
          disabled={!newTagName.trim() || isCreating}
          size="sm"
        >
          {isCreating ? "Creating..." : "Add"}
        </Button>
      </div>
    </div>
  )
}
