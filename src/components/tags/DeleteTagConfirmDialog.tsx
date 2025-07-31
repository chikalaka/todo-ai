"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useTags } from "@/lib/hooks/useTags"
import { Tag } from "@/lib/types/database.types"

interface DeleteTagConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: Tag
  usageCount: number
  onClose: () => void
}

export function DeleteTagConfirmDialog({
  open,
  onOpenChange,
  tag,
  usageCount,
  onClose,
}: DeleteTagConfirmDialogProps) {
  const { deleteTag, isDeleting } = useTags()

  const handleConfirmDelete = () => {
    deleteTag(tag.id)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  // Handle dialog close cleanup
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Tag
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete the tag{" "}
              <strong>&ldquo;{tag.name}&rdquo;</strong>?
            </div>
            {usageCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                <div className="font-medium">Warning:</div>
                <div>
                  This tag is currently used in {usageCount} todo
                  {usageCount !== 1 ? "s" : ""}. Deleting it will remove the tag
                  from all associated todos.
                </div>
              </div>
            )}
            <div className="text-sm text-gray-600">
              This action cannot be undone.
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
