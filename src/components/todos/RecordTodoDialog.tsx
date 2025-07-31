"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VoiceRecorder } from "./VoiceRecorder"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useTodos } from "@/lib/hooks/useTodos"

interface RecordTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTodosCreated?: () => void
}

interface ProcessedTodo {
  title: string
  description?: string
  priority: number
  due_date?: string
  tags?: string[]
}

type ProcessingState = "idle" | "uploading" | "processing" | "success" | "error"

export function RecordTodoDialog({
  open,
  onOpenChange,
  onTodosCreated,
}: RecordTodoDialogProps) {
  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle")
  const [processedTodos, setProcessedTodos] = useState<ProcessedTodo[]>([])
  const [error, setError] = useState<string | null>(null)
  const { createBulkTodos } = useTodos()

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setProcessingState("uploading")
    setError(null)

    try {
      // Create FormData to send the audio file
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      setProcessingState("processing")

      // Send to our API endpoint
      const response = await fetch("/api/voice/process", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to process recording: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to process recording")
      }

      // Process the result and create todos
      const todos = result.todos as ProcessedTodo[]

      if (!todos || todos.length === 0) {
        throw new Error("No todos were extracted from the recording")
      }

      setProcessedTodos(todos)
      setProcessingState("success")

      // Create the todos in the database using the hook
      const todosForCreation = todos.map((todo) => ({
        title: todo.title,
        description: todo.description || null,
        priority: todo.priority,
        due_date: todo.due_date || null,
        status: "todo" as const,
      }))

      createBulkTodos(todosForCreation)

      toast.success(
        `Successfully created ${todos.length} todo${
          todos.length > 1 ? "s" : ""
        }!`,
      )
      onTodosCreated?.()

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false)
        handleClose()
      }, 2000)
    } catch (err) {
      console.error("Error processing recording:", err)
      setError(
        err instanceof Error ? err.message : "Failed to process recording",
      )
      setProcessingState("error")
    }
  }

  const handleClose = () => {
    setProcessingState("idle")
    setProcessedTodos([])
    setError(null)
  }

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Todo</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {processingState === "idle" && (
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          )}

          {processingState === "uploading" && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Uploading recording...</p>
              <p className="text-sm text-gray-600">
                Please wait while we upload your audio
              </p>
            </div>
          )}

          {processingState === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Processing with AI...</p>
              <p className="text-sm text-gray-600">
                Analyzing your recording and extracting todos
              </p>
            </div>
          )}

          {processingState === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-700">
                Successfully created {processedTodos.length} todo
                {processedTodos.length > 1 ? "s" : ""}!
              </p>
              <div className="mt-4 text-left">
                <p className="text-sm font-medium mb-2">Created todos:</p>
                <ul className="space-y-1">
                  {processedTodos.map((todo, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 bg-gray-50 p-2 rounded"
                    >
                      <strong>{todo.title}</strong>
                      {todo.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {todo.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Priority: {todo.priority}
                        {todo.due_date &&
                          ` • Due: ${new Date(
                            todo.due_date,
                          ).toLocaleDateString()}`}
                        {todo.tags &&
                          todo.tags.length > 0 &&
                          ` • Tags: ${todo.tags.join(", ")}`}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {processingState === "error" && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-700">
                Processing Failed
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-2 bg-red-50 p-3 rounded">
                  {error}
                </p>
              )}
              <div className="mt-6">
                <Button
                  onClick={() => setProcessingState("idle")}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
