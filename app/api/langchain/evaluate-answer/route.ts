import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// Helper function to generate a fallback evaluation
function generateFallbackEvaluation(answer: string, isError = false) {
  const isCorrect = answer.length > 100
  const score = isCorrect ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 4) + 3 // 7-9 for correct, 3-6 for incorrect

  let feedback
  let strengths = []
  let improvements = []

  if (isError) {
    feedback = "We couldn't evaluate your answer at this time. Please continue to the next question."
  } else if (isCorrect) {
    feedback = "Your answer demonstrates good understanding of the topic."
    strengths = ["Comprehensive explanation", "Good structure and clarity", "Relevant examples provided"]
    improvements = ["Consider adding more specific technical details", "You could mention alternative approaches"]
  } else {
    feedback = "Your answer could be more comprehensive."
    strengths = ["Good attempt at addressing the question"]
    improvements = [
      "Provide more detailed explanation",
      "Include specific examples",
      "Consider discussing trade-offs and alternatives",
    ]
  }

  // Format the feedback to include strengths and improvements
  let enhancedFeedback = feedback

  if (strengths.length > 0 && !isError) {
    enhancedFeedback += "\n\nStrengths:\n"
    strengths.forEach((strength, index) => {
      enhancedFeedback += `${index + 1}. ${strength}\n`
    })
  }

  if (improvements.length > 0 && !isError) {
    enhancedFeedback += "\n\nAreas for improvement:\n"
    improvements.forEach((improvement, index) => {
      enhancedFeedback += `${index + 1}. ${improvement}\n`
    })
  }

  return new NextResponse(
    JSON.stringify({
      isCorrect,
      feedback: enhancedFeedback,
      score,
      status: "success",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, role, topic } = body

    if (!question || !answer) {
      return new NextResponse(JSON.stringify({ error: "Question and answer are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Return a fallback evaluation
      return generateFallbackEvaluation(answer)
    }

    try {
      // Create a prompt for OpenAI
      const prompt = `
        You are an expert technical interviewer specializing in ${role} positions with focus on ${topic}.
        
        Evaluate the following answer to this interview question:
        
        Question: ${question}
        
        Answer: ${answer}
        
        Evaluate if the answer is correct and provide constructive feedback.
        Your response should be in JSON format with the following fields:
        1. "isCorrect": a boolean indicating if the answer is correct (true) or incorrect (false)
        2. "feedback": a string with constructive feedback about the answer (2-3 sentences)
        3. "score": a number from 0 to 10 rating the quality of the answer
        4. "strengths": an array of strings listing key strengths of the answer
        5. "improvements": an array of strings listing areas for improvement
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
              content:
                "You are an expert technical interviewer who evaluates answers to interview questions. Always respond with valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("OpenAI API error:", JSON.stringify(errorData))
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      // Get the response data
      const data = await response.json()

      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error("Invalid response structure from OpenAI API")
        throw new Error("Invalid response structure from OpenAI API")
      }

      const resultText = data.choices[0].message.content.trim()

      if (!resultText) {
        console.error("Empty content in OpenAI response")
        throw new Error("Empty content in OpenAI response")
      }

      // Parse the response
      let parsedOutput
      try {
        // Find the JSON part in the response
        const jsonMatch = resultText.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[0] : resultText

        parsedOutput = JSON.parse(jsonString)

        // Ensure the result has the expected fields
        if (typeof parsedOutput.isCorrect !== "boolean") {
          parsedOutput.isCorrect = answer.length > 100 // Fallback
        }

        if (!parsedOutput.feedback) {
          parsedOutput.feedback =
            "Your answer was " +
            (parsedOutput.isCorrect ? "good" : "needs improvement") +
            ". Consider providing more details and examples."
        }

        if (typeof parsedOutput.score !== "number" || parsedOutput.score < 0 || parsedOutput.score > 10) {
          parsedOutput.score = parsedOutput.isCorrect ? 8 : 5
        }

        if (!Array.isArray(parsedOutput.strengths)) {
          parsedOutput.strengths = []
        }

        if (!Array.isArray(parsedOutput.improvements)) {
          parsedOutput.improvements = []
        }

        // Format the feedback to include strengths and improvements
        let enhancedFeedback = parsedOutput.feedback

        if (parsedOutput.strengths && parsedOutput.strengths.length > 0) {
          enhancedFeedback += "\n\nStrengths:\n"
          parsedOutput.strengths.forEach((strength, index) => {
            enhancedFeedback += `${index + 1}. ${strength}\n`
          })
        }

        if (parsedOutput.improvements && parsedOutput.improvements.length > 0) {
          enhancedFeedback += "\n\nAreas for improvement:\n"
          parsedOutput.improvements.forEach((improvement, index) => {
            enhancedFeedback += `${index + 1}. ${improvement}\n`
          })
        }

        return new NextResponse(
          JSON.stringify({
            isCorrect: parsedOutput.isCorrect,
            feedback: enhancedFeedback,
            score: parsedOutput.score,
            status: "success",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      } catch (jsonError) {
        console.error("Error parsing OpenAI response:", jsonError)
        console.log("Raw response:", resultText.substring(0, 500))

        // Try to extract information from the text response if JSON parsing fails
        const isCorrect =
          resultText.toLowerCase().includes("correct") && !resultText.toLowerCase().includes("incorrect")
        const score = isCorrect ? 8 : 5

        return new NextResponse(
          JSON.stringify({
            isCorrect,
            feedback: resultText,
            score,
            status: "success",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      // Return a fallback evaluation
      return generateFallbackEvaluation(answer)
    }
  } catch (error) {
    console.error("Error evaluating answer:", error)

    // Always return a valid JSON response with a fallback evaluation
    return generateFallbackEvaluation("", true)
  }
}

