"use client"

import { useState, useRef, useCallback } from "react"

export type RecordingState = "idle" | "recording" | "paused" | "stopped"

interface UseVoiceRecordingReturn {
  recordingState: RecordingState
  audioBlob: Blob | null
  audioUrl: string | null
  duration: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
  isSupported: boolean
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check if MediaRecorder is supported
  const isSupported =
    typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    "navigator" in window &&
    "mediaDevices" in navigator &&
    "getUserMedia" in navigator.mediaDevices

  const updateDuration = useCallback(() => {
    if (startTimeRef.current) {
      setDuration(Date.now() - startTimeRef.current)
    }
  }, [])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(updateDuration, 100)
  }, [updateDuration])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setRecordingState("idle")
    chunksRef.current = []
    stopTimer()
  }, [audioUrl, stopTimer])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      throw new Error("Voice recording is not supported in this browser")
    }

    try {
      // Clear any previous recording
      clearRecording()

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      chunksRef.current = []

      // Create MediaRecorder with preferred format
      let mimeType = "audio/webm;codecs=opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4"
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "" // Let browser choose
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        })
        const url = URL.createObjectURL(blob)

        setAudioBlob(blob)
        setAudioUrl(url)
        setRecordingState("stopped")
        stopTimer()

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.onpause = () => {
        setRecordingState("paused")
        stopTimer()
      }

      mediaRecorder.onresume = () => {
        setRecordingState("recording")
        startTimer()
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      setRecordingState("recording")
      startTimer()
    } catch (error) {
      console.error("Error starting recording:", error)
      setRecordingState("idle")
      throw error
    }
  }, [isSupported, clearRecording, startTimer, stopTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop()
    }
  }, [recordingState])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause()
    }
  }, [recordingState])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume()
    }
  }, [recordingState])

  return {
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
  }
}
