"use client"

import { useState } from "react"
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

interface CreateTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTagDialog({ open, onOpenChange }: CreateTagDialogProps) {
  const [tagName, setTagName] = useState("")
  const { tags, createTag, isCreating } = useTags()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = tagName.trim()
    if (!trimmedName) return

    // Check for duplicate names
    const isDuplicate = tags.some(
      (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (isDuplicate) {
      // You could add a toast here for better UX
      return
    }

    createTag({ name: trimmedName })
    setTagName("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTagName("")
    onOpenChange(false)
  }

  const trimmedName = tagName.trim()
  const isDuplicate =
    trimmedName &&
    tags.some((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
          <DialogDescription>
            Add a new tag to organize your todos. Tag names must be unique.
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmedName || isDuplicate || isCreating}
            >
              {isCreating ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
