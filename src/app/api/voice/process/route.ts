import { NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import OpenAI from "openai"
import { z } from "zod"

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Schema for the todo extraction
const todoSchema = z.object({
  todos: z.array(
    z.object({
      title: z.string().max(100).describe("Clear, concise title for the todo"),
      description: z
        .string()
        .optional()
        .describe("Detailed description if context was provided"),
      priority: z
        .number()
        .min(1)
        .max(10)
        .describe("Priority level, default to 9 unless specified"),
      due_date: z
        .string()
        .optional()
        .describe("ISO date string if a deadline was mentioned"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Relevant tags based on content categories"),
      transcription_segment: z
        .string()
        .describe(
          "The specific part of the transcription that led to this todo",
        ),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 },
      )
    }

    // Parse the form data to get the audio file
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 },
      )
    }

    // Log file details for debugging
    console.log("=== AUDIO FILE DEBUG INFO ===")
    console.log("File name:", audioFile.name)
    console.log("File type:", audioFile.type)
    console.log("File size:", audioFile.size)
    console.log("=============================")

    // More flexible validation - check if it's any audio type
    if (!audioFile.type.startsWith("audio/")) {
      console.error("Invalid file type received:", audioFile.type)
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format. Expected audio file, got: ${audioFile.type}`,
          debug_info: {
            received_type: audioFile.type,
            file_size: audioFile.size,
            file_name: audioFile.name,
          },
        },
        { status: 400 },
      )
    }

    // Convert the audio file to a format OpenAI can process
    const audioBuffer = await audioFile.arrayBuffer()

    // Create a more generic filename for OpenAI - Whisper can handle various formats
    let filename = "recording"
    if (audioFile.type.includes("webm")) {
      filename = "recording.webm"
    } else if (
      audioFile.type.includes("mp4") ||
      audioFile.type.includes("m4a")
    ) {
      filename = "recording.m4a"
    } else if (audioFile.type.includes("wav")) {
      filename = "recording.wav"
    } else if (
      audioFile.type.includes("mpeg") ||
      audioFile.type.includes("mp3")
    ) {
      filename = "recording.mp3"
    } else {
      // Default to webm for unknown types, Whisper is quite flexible
      filename = "recording.webm"
    }

    // Step 1: Transcribe the audio using OpenAI Whisper
    let transcription
    try {
      console.log("=== WHISPER PROCESSING ===")
      console.log("Attempting transcription with filename:", filename)
      console.log("Audio file type:", audioFile.type)
      console.log("Audio buffer size:", audioBuffer.byteLength)

      transcription = await openaiClient.audio.transcriptions.create({
        file: new File([audioBuffer], filename, { type: audioFile.type }),
        model: "whisper-1",
        language: "en", // You can make this dynamic if needed
      })

      console.log("Whisper transcription successful")
      console.log("==========================")
    } catch (whisperError) {
      console.error("=== WHISPER ERROR ===")
      console.error("Error details:", whisperError)
      console.error("File details:", {
        filename,
        type: audioFile.type,
        size: audioBuffer.byteLength,
      })
      console.error("=====================")

      // Re-throw with more context
      throw new Error(
        `Whisper transcription failed: ${
          whisperError instanceof Error ? whisperError.message : "Unknown error"
        }`,
      )
    }

    const transcribedText = transcription.text

    if (!transcribedText || transcribedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "No speech detected in the recording" },
        { status: 400 },
      )
    }

    // Step 2: Use AI SDK to extract structured todos from the transcription
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: todoSchema,
      prompt: `
You are a todo extraction assistant. Analyze the provided speech transcription and extract actionable todo items.

RULES:
1. Break down complex requests into individual, actionable todos
2. Each todo should have a clear, concise title (max 100 chars)
3. Add detailed descriptions when context is provided
4. Set priority to 9 unless explicitly mentioned otherwise (user specifically requested priority 9 as default)
5. Extract due dates if mentioned (convert relative dates like "tomorrow", "next week" to absolute ISO dates)
6. Suggest relevant tags based on content categories (work, personal, urgent, shopping, etc.)
7. If unclear, err on the side of creating more specific todos rather than fewer general ones
8. Ignore filler words and focus on actionable items
9. IMPORTANT: For transcription_segment, include the exact words from the transcription that led to this specific todo (including context words)

EXAMPLES:
- Input: "I need to call the dentist tomorrow and book a meeting with Sarah next Friday"
  → Todo 1: transcription_segment: "call the dentist tomorrow"
  → Todo 2: transcription_segment: "book a meeting with Sarah next Friday"

- Input: "Buy groceries - milk, bread, and eggs - and also pick up dry cleaning"  
  → Todo 1: transcription_segment: "Buy groceries - milk, bread, and eggs"
  → Todo 2: transcription_segment: "pick up dry cleaning"

- Input: "Create a LinkedIn post about the new product launch and make sure to include the key features and benefits"
  → Todo 1: transcription_segment: "Create a LinkedIn post about the new product launch and make sure to include the key features and benefits"

Current date for reference: ${new Date().toISOString().split("T")[0]}

TRANSCRIPTION TO ANALYZE:
"${transcribedText}"

Extract todos in the specified JSON format. Make sure each transcription_segment contains the actual words from the input that justify the todo creation:`,
    })

    const extractedTodos = object.todos

    if (!extractedTodos || extractedTodos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No actionable todos could be extracted from the recording",
        },
        { status: 400 },
      )
    }

    // Log the AI processing results for debugging
    console.log("=== AI PROCESSING RESULTS ===")
    console.log("Original transcription:", transcribedText)
    console.log("Number of todos extracted:", extractedTodos.length)
    console.log("Extracted todos:", JSON.stringify(extractedTodos, null, 2))
    console.log("==============================")

    // Return the extracted todos
    return NextResponse.json({
      success: true,
      todos: extractedTodos,
      transcription: transcribedText,
      processing_metadata: {
        timestamp: new Date().toISOString(),
        transcription_length: transcribedText.length,
        todos_count: extractedTodos.length,
        model_used: "gpt-4o-mini",
        whisper_model: "whisper-1",
      },
    })
  } catch (error) {
    console.error("Error processing voice recording:", error)

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "OpenAI API key is invalid" },
          { status: 500 },
        )
      }
      if (error.message.includes("quota")) {
        return NextResponse.json(
          {
            success: false,
            error: "OpenAI API quota exceeded. Please try again later.",
          },
          { status: 429 },
        )
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many requests. Please try again in a moment.",
          },
          { status: 429 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process recording. Please try again.",
      },
      { status: 500 },
    )
  }
}
