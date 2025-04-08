import { type NextRequest, NextResponse } from "next/server"

// Force this to run on the server
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, role, topic } = body

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 })
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured. Please check your environment variables.",
          status: "error",
        },
        { status: 500 },
      )
    }

    // Use OpenAI to evaluate the answer
    const evaluation = await evaluateAnswerWithOpenAI(apiKey, question, answer, role, topic)

    return NextResponse.json({
      isCorrect: evaluation.isCorrect,
      feedback: evaluation.feedback,
      status: "success",
    })
  } catch (error) {
    console.error("Error evaluating answer:", error)
    return NextResponse.json(
      {
        error: "Failed to evaluate answer",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: 500 },
    )
  }
}

async function evaluateAnswerWithOpenAI(
  apiKey: string,
  question: string,
  answer: string,
  role: string,
  topic: string,
): Promise<{ isCorrect: boolean; feedback: string }> {
  try {
    // Create a prompt for OpenAI
    const prompt = `
      You are an expert technical interviewer specializing in ${role} positions with focus on ${topic}.
      
      Evaluate the following answer to this interview question:
      
      Question: ${question}
      
      Answer: ${answer}
      
      Evaluate if the answer is correct and provide constructive feedback.
      Your response should be in JSON format with two fields:
      1. "isCorrect": a boolean indicating if the answer is correct (true) or incorrect (false)
      2. "feedback": a string with constructive feedback about the answer (2-3 sentences)
      
      Only respond with the JSON object, nothing else.
    `

    // Call OpenAI API directly with fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer who evaluates answers to interview questions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const resultText = data.choices[0].message.content?.trim() || ""

    try {
      const result = JSON.parse(resultText)
      // Ensure the result has the expected fields
      if (typeof result.isCorrect !== "boolean" || typeof result.feedback !== "string") {
        throw new Error("OpenAI response missing required fields")
      }
      return result
    } catch (jsonError) {
      console.error("Error parsing OpenAI response:", jsonError)
      // Fallback if JSON parsing fails
      return {
        isCorrect: false,
        feedback: "We couldn't properly evaluate your answer. Please try again with a more detailed response.",
      }
    }
  } catch (error) {
    console.error("Error using OpenAI API:", error)
    // Fallback to a simple evaluation if OpenAI API fails
    const isCorrect = answer.length > 100
    return {
      isCorrect,
      feedback: isCorrect
        ? "Your answer seems comprehensive, but we couldn't perform a detailed evaluation at this time."
        : "Your answer may need more detail. Consider expanding your explanation with examples or more context.",
    }
  }
}

