import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function generateDefaultFollowUps(question: string, answer?: string): any[] {
  // Generate more contextual follow-up questions based on the original question
  const questionLower = question.toLowerCase()

  if (questionLower.includes("experience") || questionLower.includes("worked with")) {
    return [
      {
        question: "What specific projects have you worked on that involved this technology?",
        suggestedAnswer:
          "I've worked on several key projects involving this technology. Most notably, I led the development of a system that [specific accomplishment]. This required deep knowledge of [specific aspects of the topic] and resulted in [positive outcome like improved performance, reduced costs, etc.].",
      },
      {
        question: "What challenges did you face when implementing this technology?",
        suggestedAnswer:
          "The main challenges included dealing with [specific technical challenge] and [another challenge]. For the first challenge, I approached it by [solution strategy]. For the second, I implemented [different solution approach]. These experiences taught me the importance of [lesson learned].",
      },
      {
        question: "How did this experience change your approach to similar problems?",
        suggestedAnswer:
          "This experience fundamentally changed my approach by teaching me to [key lesson]. Now, when facing similar problems, I first [new approach] and make sure to [important consideration]. This has made my solutions more [positive quality] and [another positive quality].",
      },
    ]
  } else if (
    questionLower.includes("implement") ||
    questionLower.includes("build") ||
    questionLower.includes("create")
  ) {
    return [
      {
        question: "What technologies or frameworks would you choose for this implementation?",
        suggestedAnswer:
          "I would select technologies based on the specific requirements, but my go-to stack would include [technology 1] for [reason], [technology 2] for [reason], and [technology 3] for [reason]. I've found this combination particularly effective for [specific advantage].",
      },
      {
        question: "How would you ensure the solution is scalable and maintainable?",
        suggestedAnswer:
          "To ensure scalability and maintainability, I would implement [architecture pattern] which allows for [benefit]. I would also follow principles like [principle 1] and [principle 2], and establish clear coding standards and documentation practices. Regular code reviews and automated testing would be essential components of the development process.",
      },
      {
        question: "What potential pitfalls would you watch out for in this implementation?",
        suggestedAnswer:
          "The main pitfalls to watch for include [pitfall 1], [pitfall 2], and [pitfall 3]. To mitigate these risks, I would [mitigation strategy 1] and [mitigation strategy 2]. I would also set up monitoring for [key metrics] to catch issues early before they impact users.",
      },
    ]
  } else if (questionLower.includes("best practice") || questionLower.includes("approach")) {
    return [
      {
        question: "How do you stay updated with evolving best practices in this area?",
        suggestedAnswer:
          "I stay updated through multiple channels: regularly reading industry publications like [specific sources], participating in communities such as [specific forums or groups], attending conferences and webinars, and following thought leaders in the field. I also make it a point to experiment with new approaches in side projects.",
      },
      {
        question: "Can you give an example of implementing these best practices in a real project?",
        suggestedAnswer:
          "In a recent project, I implemented [specific best practice] when developing [specific feature or system]. This involved [specific implementation details]. The result was [measurable improvement] compared to our previous approach. This success led us to adopt this practice across other projects.",
      },
      {
        question: "How do you balance following best practices with practical constraints like deadlines?",
        suggestedAnswer:
          "Balancing best practices with practical constraints requires pragmatism. I prioritize practices that deliver the most value for the specific context. For critical aspects like security and data integrity, I never compromise. For other areas, I might implement a simplified version initially with a plan to refine it in future iterations. Clear communication with stakeholders about these trade-offs is essential.",
      },
    ]
  } else {
    // Default follow-up questions
    return [
      {
        question: `Could you elaborate more on the key concepts related to "${question.substring(0, 30)}..."?`,
        suggestedAnswer:
          "The key concepts include [specific details]. These are important because [reasons]. In practice, they are applied by [examples].",
      },
      {
        question: "What practical experience do you have with this topic?",
        suggestedAnswer:
          "I've worked on several projects involving this topic. For example, I [specific project details]. The challenges I faced included [challenges] and I solved them by [solutions].",
      },
      {
        question: "How would you implement this in a real-world scenario?",
        suggestedAnswer:
          "In a real-world scenario, I would first [step 1], then [step 2]. I would use [technologies/methods] because [reasons]. This approach has proven effective in [similar situations].",
      },
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, role, topic } = body

    if (!question) {
      return new NextResponse(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Return default follow-up questions
      return new NextResponse(
        JSON.stringify({
          followUpQuestions: generateDefaultFollowUps(question, answer),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    try {
      // Create the answer context if an answer was provided
      const answerContext = answer
        ? `The candidate has provided the following answer:

Answer: ${answer}

Based on this answer, generate follow-up questions that probe deeper into the topic.`
        : `Generate follow-up questions that would naturally follow this initial question.`

      // Create a prompt for OpenAI
      const prompt = `
        You are an expert technical interviewer specializing in ${role} positions with focus on ${topic}.
        
        Based on the following interview question:
        
        Question: ${question}
        
        ${answerContext}
        
        Generate 3 challenging follow-up questions that would help assess the candidate's depth of knowledge on this topic.
        For each follow-up question, provide a suggested answer that a strong candidate might give.
        
        Your response should be in JSON format as an array of objects, where each object has:
        1. A 'question' field with the follow-up question
        2. A 'suggestedAnswer' field with a suggested answer
        
        Example format:
        [
          {
            "question": "Follow-up question 1?",
            "suggestedAnswer": "A strong answer to follow-up 1..."
          },
          {
            "question": "Follow-up question 2?",
            "suggestedAnswer": "A strong answer to follow-up 2..."
          },
          {
            "question": "Follow-up question 3?",
            "suggestedAnswer": "A strong answer to follow-up 3..."
          }
        ]
        
        Only respond with the JSON array, nothing else.
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
                "You are an expert technical interviewer who creates challenging follow-up questions. Always respond with valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
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
        const jsonMatch = resultText.match(/\[[\s\S]*\]/)
        const jsonString = jsonMatch ? jsonMatch[0] : resultText

        parsedOutput = JSON.parse(jsonString)

        if (!Array.isArray(parsedOutput)) {
          console.error("Response is not an array:", typeof parsedOutput)
          throw new Error("Response is not an array")
        }

        // Validate each follow-up question
        parsedOutput = parsedOutput.map((fq) => {
          if (!fq.question) {
            fq.question = "Could you elaborate more on this topic?"
          }

          if (!fq.suggestedAnswer) {
            fq.suggestedAnswer = "A strong answer would address the key concepts and provide practical examples."
          }

          return fq
        })

        // Ensure we have exactly 3 follow-up questions
        while (parsedOutput.length < 3) {
          parsedOutput.push({
            question: "Could you elaborate more on this topic?",
            suggestedAnswer: "A strong answer would address the key concepts and provide practical examples.",
          })
        }

        if (parsedOutput.length > 3) {
          parsedOutput = parsedOutput.slice(0, 3)
        }

        return new NextResponse(JSON.stringify({ followUpQuestions: parsedOutput }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        console.error("Error parsing OpenAI content:", error)
        console.log("Raw content:", resultText.substring(0, 500))

        // Create a fallback response if parsing fails
        throw new Error("Failed to parse follow-up questions from OpenAI response")
      }
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      // Return default follow-up questions on any OpenAI error
      return new NextResponse(
        JSON.stringify({
          followUpQuestions: generateDefaultFollowUps(question, answer),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("Error generating follow-up questions:", error)

    // Always return a valid JSON response with default follow-up questions
    return new NextResponse(
      JSON.stringify({
        followUpQuestions: generateDefaultFollowUps("Could you elaborate more on this topic?"),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

