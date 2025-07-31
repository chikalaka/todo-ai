"use client"

import { useState } from "react"
import { Mic, MicOff, Play, Pause, Square, Trash2 } from "lucide-react"
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
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
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

  const handleUseRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob)
    }
  }

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
          <>
            <Button
              onClick={pauseRecording}
              disabled={disabled}
              size="lg"
              variant="outline"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleStopRecording}
              disabled={disabled}
              size="lg"
              className="bg-red-500 hover:bg-red-600"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {recordingState === "paused" && (
          <>
            <Button
              onClick={resumeRecording}
              disabled={disabled}
              size="lg"
              className="bg-green-500 hover:bg-green-600"
            >
              <Mic className="h-5 w-5 mr-2" />
              Resume
            </Button>
            <Button
              onClick={handleStopRecording}
              disabled={disabled}
              size="lg"
              className="bg-red-500 hover:bg-red-600"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Recording Status */}
      {(recordingState === "recording" || recordingState === "paused") && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {recordingState === "recording" && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            {recordingState === "paused" && (
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            )}
            <span className="text-lg font-mono">
              {formatDuration(duration)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {recordingState === "recording"
              ? "Recording..."
              : "Recording paused"}
          </p>
        </div>
      )}

      {/* Playback and Actions */}
      {recordingState === "stopped" && audioUrl && (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-lg font-mono mb-2">
              {formatDuration(duration)}
            </div>
            <audio controls className="w-full max-w-md mx-auto">
              <source src={audioUrl} type="audio/webm" />
              <source src={audioUrl} type="audio/mp4" />
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="flex justify-center space-x-3">
            <Button
              onClick={handleUseRecording}
              disabled={disabled}
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Process Recording
            </Button>
            <Button
              onClick={clearRecording}
              disabled={disabled}
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
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
