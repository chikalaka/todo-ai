"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TodoForm } from "./TodoForm"

interface CreateTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTodoDialog({
  open,
  onOpenChange,
}: CreateTodoDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <TodoForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
