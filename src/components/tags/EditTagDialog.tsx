"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useTags } from "@/lib/hooks/useTags"
import { Tag } from "@/lib/types/database.types"

interface EditTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: Tag
  onClose: () => void
}

export function EditTagDialog({
  open,
  onOpenChange,
  tag,
  onClose,
}: EditTagDialogProps) {
  const [tagName, setTagName] = useState("")
  const { tags, updateTag, isUpdating } = useTags()

  // Reset form when tag changes
  useEffect(() => {
    if (tag) {
      setTagName(tag.name)
    }
  }, [tag])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = tagName.trim()
    if (!trimmedName) return

    // Check if name actually changed
    if (trimmedName === tag.name) {
      onOpenChange(false)
      return
    }

    // Check for duplicate names (excluding current tag)
    const isDuplicate = tags.some(
      (t) =>
        t.id !== tag.id && t.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (isDuplicate) {
      return
    }

    updateTag({ id: tag.id, updates: { name: trimmedName } })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTagName(tag.name) // Reset to original name
    onOpenChange(false)
  }

  // Handle dialog close cleanup
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      onClose()
    }
  }

  const trimmedName = tagName.trim()
  const isDuplicate =
    trimmedName &&
    trimmedName !== tag.name &&
    tags.some(
      (t) =>
        t.id !== tag.id && t.name.toLowerCase() === trimmedName.toLowerCase(),
    )
  const hasChanges = trimmedName && trimmedName !== tag.name

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Update the tag name. Tag names must be unique.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="tag-name"
                placeholder="Enter tag name..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className={isDuplicate ? "border-red-500" : ""}
                autoFocus
              />
              {isDuplicate && (
                <p className="text-sm text-red-500">
                  A tag with this name already exists
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !trimmedName || isDuplicate || !hasChanges || isUpdating
              }
            >
              {isUpdating ? "Updating..." : "Update Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
