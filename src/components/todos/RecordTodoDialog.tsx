"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VoiceRecorder } from "./VoiceRecorder"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { toast } from "sonner"
import { useTodos } from "@/lib/hooks/useTodos"
import { EditableTodoCard } from "./EditableTodoCard"

interface RecordTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTodosCreated?: () => void
  initialAudioBlob?: Blob | null
}

interface ProcessedTodo {
  title: string
  description?: string
  priority: number
  due_date?: string
  tags?: string[]
  transcription_segment: string
}

type ProcessingState =
  | "idle"
  | "uploading"
  | "processing"
  | "review"
  | "creating"
  | "success"
  | "error"

export function RecordTodoDialog({
  open,
  onOpenChange,
  onTodosCreated,
  initialAudioBlob,
}: RecordTodoDialogProps) {
  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle")
  const [processedTodos, setProcessedTodos] = useState<ProcessedTodo[]>([])
  const [error, setError] = useState<string | null>(null)
  const { createBulkTodos } = useTodos()

  // Auto-process initial audio blob when provided
  useEffect(() => {
    if (initialAudioBlob && open && processingState === "idle") {
      handleRecordingComplete(initialAudioBlob)
    }
  }, [initialAudioBlob, open, processingState])

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

      // Log the full processing result for debugging
      console.log("=== VOICE PROCESSING COMPLETE ===")
      console.log("Full API response:", result)
      console.log("Processing metadata:", result.processing_metadata)
      console.log("=================================")

      // Process the result and create todos
      const todos = result.todos as ProcessedTodo[]

      if (!todos || todos.length === 0) {
        throw new Error("No todos were extracted from the recording")
      }

      setProcessedTodos(todos)
      setProcessingState("review")
    } catch (err) {
      console.error("Error processing recording:", err)
      setError(
        err instanceof Error ? err.message : "Failed to process recording",
      )
      setProcessingState("error")
    }
  }

  const updateTodo = (index: number, updatedTodo: ProcessedTodo) => {
    const updated = [...processedTodos]
    updated[index] = updatedTodo
    setProcessedTodos(updated)
  }

  const deleteTodo = (index: number) => {
    const updated = processedTodos.filter((_, i) => i !== index)
    setProcessedTodos(updated)
  }

  const handleApprove = async () => {
    if (processedTodos.length === 0) {
      toast.error("No todos to create")
      return
    }

    setProcessingState("creating")

    try {
      // Create the todos in the database using the hook
      const todosForCreation = processedTodos.map((todo) => {
        // Combine description with transcription segment for better context
        const enhancedDescription = todo.description
          ? `${todo.description}\n\n📝 From recording: "${todo.transcription_segment}"`
          : `📝 From recording: "${todo.transcription_segment}"`

        console.log(
          `Creating todo: "${todo.title}" with transcription: "${todo.transcription_segment}"`,
        )

        return {
          title: todo.title,
          description: enhancedDescription,
          priority: todo.priority,
          due_date: todo.due_date || null,
          status: "todo" as const,
        }
      })

      createBulkTodos(todosForCreation)

      setProcessingState("success")

      toast.success(
        `Successfully created ${processedTodos.length} todo${
          processedTodos.length > 1 ? "s" : ""
        }!`,
      )
      onTodosCreated?.()

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false)
        handleClose()
      }, 2000)
    } catch (err) {
      console.error("Error creating todos:", err)
      setError(err instanceof Error ? err.message : "Failed to create todos")
      setProcessingState("error")
    }
  }

  const handleReject = () => {
    setProcessingState("idle")
    setProcessedTodos([])
    setError(null)
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Record Todo</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex-1 overflow-hidden">
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

          {processingState === "review" && (
            <div className="py-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Review Suggested Todos
                </h3>
                <p className="text-sm text-gray-600">
                  Edit, delete, or approve the todos extracted from your
                  recording
                </p>
              </div>

              {processedTodos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No todos remaining</p>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="mt-4"
                  >
                    Start Over
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {processedTodos.map((todo, index) => (
                      <EditableTodoCard
                        key={index}
                        todo={todo}
                        index={index}
                        onUpdate={updateTodo}
                        onDelete={deleteTodo}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Create {processedTodos.length} Todo
                      {processedTodos.length > 1 ? "s" : ""}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {processingState === "creating" && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Creating todos...</p>
              <p className="text-sm text-gray-600">
                Please wait while we add your todos
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
