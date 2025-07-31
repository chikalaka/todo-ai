"use client"

interface TodoDescriptionProps {
  description: string | null
  className?: string
}

export function TodoDescription({
  description,
  className = "",
}: TodoDescriptionProps) {
  if (!description) return null

  // Check if the description contains the transcription part
  const transcriptionMarker = "📝 From recording:"
  const transcriptionIndex = description.indexOf(transcriptionMarker)

  if (transcriptionIndex === -1) {
    // No transcription part, render normally
    return <div className={className}>{description}</div>
  }

  // Split the description into main part and transcription part
  const mainDescription = description.substring(0, transcriptionIndex).trim()
  const transcriptionPart = description.substring(transcriptionIndex).trim()

  return (
    <div className={className}>
      {mainDescription && <div className="mb-2">{mainDescription}</div>}
      <div className="text-xs text-gray-500 italic">{transcriptionPart}</div>
    </div>
  )
}
