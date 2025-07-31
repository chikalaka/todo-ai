"use client"

import React, { useState, useEffect } from "react"
import { Mic, MicOff, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceRecording } from "@/hooks/useVoiceRecording"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export function VoiceRecorder({
  onRecordingComplete,
  disabled = false,
}: VoiceRecorderProps) {
  const {
    recordingState,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    isSupported,
  } = useVoiceRecording()

  const [error, setError] = useState<string | null>(null)

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleStartRecording = async () => {
    if (!isSupported) {
      setError("Voice recording is not supported in this browser")
      return
    }

    try {
      setError(null)
      await startRecording()
    } catch (err) {
      console.error("Recording error:", err)
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Microphone permission denied. Please allow microphone access and try again.",
          )
        } else if (err.name === "NotFoundError") {
          setError(
            "No microphone found. Please connect a microphone and try again.",
          )
        } else {
          setError("Failed to start recording. Please try again.")
        }
      } else {
        setError("An unexpected error occurred.")
      }
    }
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  // Process recording immediately when audioBlob becomes available
  useEffect(() => {
    if (audioBlob && recordingState === "stopped") {
      onRecordingComplete(audioBlob)
      // Clear the recording after processing
      clearRecording()
    }
  }, [audioBlob, recordingState, onRecordingComplete, clearRecording])

  if (!isSupported) {
    return (
      <div className="text-center p-6 text-gray-500">
        <MicOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Voice recording is not supported in this browser.</p>
        <p className="text-sm mt-1">
          Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-3">
        {recordingState === "idle" && (
          <Button
            onClick={handleStartRecording}
            disabled={disabled}
            size="lg"
            className="bg-red-500 hover:bg-red-600"
          >
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        )}

        {recordingState === "recording" && (
          <Button
            onClick={handleStopRecording}
            disabled={disabled}
            size="lg"
            className="bg-red-500 hover:bg-red-600"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop
          </Button>
        )}
      </div>

      {/* Recording Status */}
      {recordingState === "recording" && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-lg font-mono">
              {formatDuration(duration)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Recording...</p>
        </div>
      )}

      {/* Recording Tips */}
      {recordingState === "idle" && (
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>
            💡 <strong>Tips for better results:</strong>
          </p>
          <ul className="text-left max-w-md mx-auto space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Mention specific tasks, deadlines, and priorities</li>
            <li>
              • Use phrases like &quot;I need to...&quot; or &quot;Add task
              to...&quot;
            </li>
            <li>
              • Include context like &quot;for work&quot; or
              &quot;personal&quot;
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
