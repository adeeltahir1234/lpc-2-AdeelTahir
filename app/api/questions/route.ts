import { type NextRequest, NextResponse } from "next/server"

// Force this to run on the server
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const role = searchParams.get("role")
    const topic = searchParams.get("topic")

    if (!role || !topic) {
      return NextResponse.json({ error: "Role and topic are required" }, { status: 400 })
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

    // Generate questions using OpenAI API directly with fetch
    const questions = await generateQuestionsWithOpenAI(apiKey, role, topic)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: 500 },
    )
  }
}

async function generateQuestionsWithOpenAI(
  apiKey: string,
  role: string,
  topic: string,
  numQuestions = 5,
): Promise<any[]> {
  try {
    // Create a prompt for OpenAI
    const prompt = `
      You are an expert technical interviewer specializing in ${role} positions with focus on ${topic}.
      
      Generate ${numQuestions} challenging technical interview questions about ${topic} for a ${role} position.
      
      For each question, also provide 3 related follow-up questions that an interviewer might ask to dig deeper into the candidate's knowledge. For each follow-up question, include a suggested answer that a strong candidate might give.
      
      Your response should be in JSON format as an array of objects, where each object has:
      1. A 'question' field with the main interview question
      2. A 'followUpQuestions' field with an array of objects, each containing:
         a. 'question': the follow-up question text
         b. 'suggestedAnswer': a concise but comprehensive suggested answer
      
      Example format: 
      [
        {
          "question": "Main Question 1?",
          "followUpQuestions": [
            {
              "question": "Follow-up 1?",
              "suggestedAnswer": "A strong answer to follow-up 1..."
            },
            {
              "question": "Follow-up 2?",
              "suggestedAnswer": "A strong answer to follow-up 2..."
            },
            {
              "question": "Follow-up 3?",
              "suggestedAnswer": "A strong answer to follow-up 3..."
            }
          ]
        },
        {
          "question": "Main Question 2?",
          "followUpQuestions": [
            {
              "question": "Follow-up 1?",
              "suggestedAnswer": "A strong answer to follow-up 1..."
            },
            {
              "question": "Follow-up 2?",
              "suggestedAnswer": "A strong answer to follow-up 2..."
            },
            {
              "question": "Follow-up 3?",
              "suggestedAnswer": "A strong answer to follow-up 3..."
            }
          ]
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
            content: "You are an expert technical interviewer who creates challenging questions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
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

      // Handle different response formats
      if (Array.isArray(result)) {
        // If result is already an array
        return result.map((item) => {
          if (typeof item === "string") {
            return {
              question: item,
              followUpQuestions: generateDefaultFollowUps(item),
            }
          }
          // Ensure followUpQuestions exists and has the right format
          if (!item.followUpQuestions || !Array.isArray(item.followUpQuestions)) {
            item.followUpQuestions = generateDefaultFollowUps(item.question)
          } else {
            // Ensure each followUpQuestion has the right format
            item.followUpQuestions = item.followUpQuestions.map((followUp: any) => {
              if (typeof followUp === "string") {
                return {
                  question: followUp,
                  suggestedAnswer: generateDefaultAnswer(followUp),
                }
              } else if (!followUp.suggestedAnswer) {
                followUp.suggestedAnswer = generateDefaultAnswer(followUp.question)
              }
              return followUp
            })
          }
          return item
        })
      } else if (result.questions && Array.isArray(result.questions)) {
        // If result has a questions array
        return result.questions.map((item) => {
          if (typeof item === "string") {
            return {
              question: item,
              followUpQuestions: generateDefaultFollowUps(item),
            }
          }
          // Ensure followUpQuestions exists and has the right format
          if (!item.followUpQuestions || !Array.isArray(item.followUpQuestions)) {
            item.followUpQuestions = generateDefaultFollowUps(item.question)
          } else {
            // Ensure each followUpQuestion has the right format
            item.followUpQuestions = item.followUpQuestions.map((followUp: any) => {
              if (typeof followUp === "string") {
                return {
                  question: followUp,
                  suggestedAnswer: generateDefaultAnswer(followUp),
                }
              } else if (!followUp.suggestedAnswer) {
                followUp.suggestedAnswer = generateDefaultAnswer(followUp.question)
              }
              return followUp
            })
          }
          return item
        })
      }

      // Try to find an array property in the object
      for (const key in result) {
        if (Array.isArray(result[key])) {
          return result[key].map((item) => {
            if (typeof item === "string") {
              return {
                question: item,
                followUpQuestions: generateDefaultFollowUps(item),
              }
            }
            // Ensure followUpQuestions exists and has the right format
            if (!item.followUpQuestions || !Array.isArray(item.followUpQuestions)) {
              item.followUpQuestions = generateDefaultFollowUps(item.question)
            } else {
              // Ensure each followUpQuestion has the right format
              item.followUpQuestions = item.followUpQuestions.map((followUp: any) => {
                if (typeof followUp === "string") {
                  return {
                    question: followUp,
                    suggestedAnswer: generateDefaultAnswer(followUp),
                  }
                } else if (!followUp.suggestedAnswer) {
                  followUp.suggestedAnswer = generateDefaultAnswer(followUp.question)
                }
                return followUp
              })
            }
            return item
          })
        }
      }

      // Fallback - convert any structure into the format we need
      return Array.isArray(result)
        ? result.map((item) => {
            if (typeof item === "string") {
              return {
                question: item,
                followUpQuestions: generateDefaultFollowUps(item),
              }
            }
            // Ensure followUpQuestions exists and has the right format
            if (!item.followUpQuestions || !Array.isArray(item.followUpQuestions)) {
              item.followUpQuestions = generateDefaultFollowUps(item.question)
            } else {
              // Ensure each followUpQuestion has the right format
              item.followUpQuestions = item.followUpQuestions.map((followUp: any) => {
                if (typeof followUp === "string") {
                  return {
                    question: followUp,
                    suggestedAnswer: generateDefaultAnswer(followUp),
                  }
                } else if (!followUp.suggestedAnswer) {
                  followUp.suggestedAnswer = generateDefaultAnswer(followUp.question)
                }
                return followUp
              })
            }
            return item
          })
        : [
            {
              question: JSON.stringify(result),
              followUpQuestions: [
                {
                  question: "Could you elaborate more on this?",
                  suggestedAnswer:
                    "This concept involves multiple aspects including implementation details, performance considerations, and practical applications. In my experience, the most important factor is...",
                },
                {
                  question: "What are the practical applications?",
                  suggestedAnswer:
                    "The practical applications are diverse, ranging from enterprise systems to consumer applications. I've personally implemented this in projects where...",
                },
                {
                  question: "How would you implement this?",
                  suggestedAnswer:
                    "Implementation would start with a thorough requirements analysis, followed by designing a scalable architecture. I would use technologies like X and Y because...",
                },
              ],
            },
          ]
    } catch (error) {
      // If JSON parsing fails, create simple questions
      return fallbackQuestions(role, topic)
    }
  } catch (error) {
    console.error("Error using OpenAI API:", error)
    // Return fallback questions
    return fallbackQuestions(role, topic)
  }
}

function generateDefaultAnswer(question: string): string {
  return `A strong answer would address the key aspects of ${question.replace(/\?/g, "")}. I would explain the core concepts, provide practical examples from my experience, and discuss best practices in the industry.`
}

function generateDefaultFollowUps(question: string): any[] {
  return [
    {
      question: `Could you elaborate more on your answer to "${question.substring(0, 30)}..."?`,
      suggestedAnswer:
        "I'd be happy to elaborate. The key aspects to consider include the underlying principles, implementation challenges, and optimization strategies. In my experience, the most effective approach involves a combination of theoretical understanding and practical application.",
    },
    {
      question: "What practical experience do you have with this concept?",
      suggestedAnswer:
        "I've applied this concept in several projects. In one particular instance, I was tasked with implementing a solution for a high-traffic system. I designed an approach that balanced performance, scalability, and maintainability, which resulted in a 40% improvement in system response time.",
    },
    {
      question: "How would you implement this in a real-world scenario?",
      suggestedAnswer:
        "In a real-world scenario, I would first analyze the specific requirements and constraints. Then, I would design a solution that leverages appropriate technologies and follows best practices. I would ensure the implementation is well-tested, documented, and maintainable. Based on my experience, I would also incorporate monitoring and performance optimization from the beginning.",
    },
  ]
}

function fallbackQuestions(role: string, topic: string): any[] {
  return [
    {
      question: `Tell me about your experience with ${topic} as a ${role}.`,
      followUpQuestions: [
        {
          question: "What specific projects have you worked on?",
          suggestedAnswer:
            "I've worked on several key projects involving this technology. Most notably, I led the development of a system that [specific accomplishment]. This required deep knowledge of [specific aspects of the topic] and resulted in [positive outcome like improved performance, reduced costs, etc.].",
        },
        {
          question: "What challenges did you face?",
          suggestedAnswer:
            "The main challenges included dealing with [specific technical challenge] and [another challenge]. For the first challenge, I approached it by [solution strategy]. For the second, I implemented [different solution approach]. These experiences taught me the importance of [lesson learned].",
        },
        {
          question: "How did you overcome those challenges?",
          suggestedAnswer:
            "I overcame these challenges through a combination of research, collaboration, and iterative problem-solving. Specifically, I researched [relevant information], collaborated with [relevant team members or experts], and implemented a solution that [specific details]. This approach not only solved the immediate problem but also improved our overall process.",
        },
      ],
    },
    {
      question: `What challenges have you faced with ${topic}?`,
      followUpQuestions: [
        {
          question: "How did you solve these challenges?",
          suggestedAnswer:
            "I approached these challenges methodically. First, I identified the root causes through [analysis method]. Then, I developed a strategy that involved [specific approach]. I implemented this by [implementation details]. The result was [positive outcome], which demonstrated the effectiveness of my approach.",
        },
        {
          question: "What tools or techniques did you use?",
          suggestedAnswer:
            "I utilized several tools and techniques, including [specific tool/technique 1], [specific tool/technique 2], and [specific tool/technique 3]. I chose these because [rationale]. The combination of these tools allowed me to [benefit achieved], which was essential for successfully addressing the challenges.",
        },
        {
          question: "What would you do differently now?",
          suggestedAnswer:
            "With the benefit of hindsight and additional experience, I would make several changes to my approach. First, I would [specific change] because [reason]. Second, I would incorporate [new approach or technology] which would [benefit]. Finally, I would place more emphasis on [important aspect] earlier in the process.",
        },
      ],
    },
    {
      question: `How would you implement ${topic} in a real-world scenario?`,
      followUpQuestions: [
        {
          question: "What technologies would you use?",
          suggestedAnswer:
            "I would select technologies based on the specific requirements, but my go-to stack would include [technology 1] for [reason], [technology 2] for [reason], and [technology 3] for [reason]. I've found this combination particularly effective for [specific advantage]. I would also consider [alternative technology] if [specific condition].",
        },
        {
          question: "How would you ensure scalability?",
          suggestedAnswer:
            "Scalability would be addressed through several strategies: First, implementing a [specific architecture pattern] to allow for horizontal scaling. Second, using [specific technology or approach] for efficient resource utilization. Third, implementing [caching strategy or other optimization]. I would also establish performance benchmarks and regular testing to proactively identify and address potential bottlenecks.",
        },
        {
          question: "How would you test your implementation?",
          suggestedAnswer:
            "My testing strategy would be comprehensive, including unit tests for individual components, integration tests for interactions between components, and end-to-end tests for complete workflows. I would use [specific testing frameworks] and implement CI/CD pipelines to automate testing. For performance, I would conduct load testing using [specific tools] to simulate expected and peak usage scenarios.",
        },
      ],
    },
    {
      question: `What best practices do you follow for ${topic}?`,
      followUpQuestions: [
        {
          question: "Why do you consider these best practices?",
          suggestedAnswer:
            "I consider these best practices because they consistently lead to higher quality, more maintainable, and more efficient solutions. Specifically, [practice 1] reduces [specific problem] by [percentage or metric]. [Practice 2] improves [specific aspect] which is critical for [reason]. These aren't just theoretical—I've seen their impact firsthand in multiple projects.",
        },
        {
          question: "How do you stay updated with evolving best practices?",
          suggestedAnswer:
            "I stay updated through multiple channels: regularly reading industry publications like [specific sources], participating in communities such as [specific forums or groups], attending conferences and webinars, and following thought leaders in the field. I also make it a point to experiment with new approaches in side projects to evaluate their effectiveness before incorporating them into production work.",
        },
        {
          question: "Can you give an example of implementing these practices?",
          suggestedAnswer:
            "In a recent project, I implemented [specific best practice] when developing [specific feature or system]. This involved [specific implementation details]. The result was [measurable improvement] compared to our previous approach. This success led us to adopt this practice across other projects, resulting in [broader positive impact].",
        },
      ],
    },
    {
      question: `How do you stay updated with the latest trends in ${topic}?`,
      followUpQuestions: [
        {
          question: "What resources do you use?",
          suggestedAnswer:
            "I rely on a diverse set of resources to stay current. These include technical blogs like [specific blogs], newsletters such as [specific newsletters], podcasts including [specific podcasts], and online learning platforms like [specific platforms]. I also participate in [specific community or forum] where professionals share insights and discuss emerging trends.",
        },
        {
          question: "How do you evaluate new technologies or approaches?",
          suggestedAnswer:
            "My evaluation process is systematic: First, I research the technology to understand its purpose, benefits, and potential drawbacks. Then, I build small proof-of-concept projects to test it hands-on. I assess factors like performance, maintainability, community support, and compatibility with existing systems. Finally, I consider the learning curve and implementation costs before making recommendations.",
        },
        {
          question: "How do you incorporate new knowledge into your work?",
          suggestedAnswer:
            "I incorporate new knowledge incrementally. When I learn something valuable, I first document it for my own reference. Then, I identify opportunities to apply it in low-risk contexts, such as internal tools or non-critical features. As I gain confidence, I introduce it to more significant aspects of projects. I also share what I've learned with my team through knowledge-sharing sessions and documentation.",
        },
      ],
    },
  ]
}

