"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle, XCircle, Loader2, Send, Clock, Award, Brain, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FollowUpQuestions from "./follow-up-questions"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface InterviewSessionProps {
  role: string
  topic: string
  onEndSession: (score: number) => void
}

interface FollowUpQuestion {
  question: string
  suggestedAnswer: string
}

interface Question {
  id?: number
  question: string
  followUpQuestions?: FollowUpQuestion[]
}

export default function InterviewSession({ role, topic, onEndSession }: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<
    Array<{ type: string; content: string; feedback?: string; correct?: boolean; score?: number }>
  >([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive])

  // Format timer to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation])

  // Generate fallback questions
  const generateFallbackQuestions = (roleParam: string, topicParam: string): Question[] => {
    return [
      {
        question: `Tell me about your experience with ${topicParam} as a ${roleParam}.`,
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
        question: `What challenges have you faced with ${topicParam}?`,
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
        question: `How would you implement ${topicParam} in a real-world scenario?`,
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
        question: `What best practices do you follow for ${topicParam}?`,
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
        question: `How do you stay updated with the latest trends in ${topicParam}?`,
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

  const fetchQuestions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use direct fetch with error handling for non-JSON responses
      const response = await fetch(
        `/api/langchain/questions?role=${encodeURIComponent(role)}&topic=${encodeURIComponent(topic)}&numQuestions=5`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        },
      )

      // Check if response is ok (status in the range 200-299)
      if (!response.ok) {
        // Try to get the response text first to see if it's JSON or not
        const responseText = await response.text()

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.error || `HTTP error ${response.status}`)
        } catch (jsonError) {
          // If it's not valid JSON, use the text or status
          if (responseText && responseText.length < 100) {
            throw new Error(`Server error: ${responseText}`)
          } else {
            throw new Error(`HTTP error ${response.status}: ${response.statusText || "Unknown error"}`)
          }
        }
      }

      // Try to get the response text first
      const responseText = await response.text()

      // Skip empty responses
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server")
      }

      // Try to parse the JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError)
        console.error("Response text:", responseText.substring(0, 200) + "...") // Log first 200 chars
        throw new Error("Failed to parse API response. The server returned invalid JSON.")
      }

      // Check if the response contains an error message
      if (data.error) {
        console.warn("API returned an error:", data.error)
        // If we have fallback questions, use them instead of throwing an error
        if (data.questions && data.questions.length > 0) {
          console.log("Using fallback questions provided by the API")
          setQuestions(data.questions)
          setConversation([{ type: "question", content: data.questions[0].question }])
          setTimerActive(true)
          return
        }
        throw new Error(data.error)
      }

      // Check if we have valid questions
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions available for this role and topic")
      }

      setQuestions(data.questions)

      // Add the first question to the conversation
      setConversation([{ type: "question", content: data.questions[0].question }])

      // Start the timer when questions are loaded
      setTimerActive(true)
    } catch (error) {
      console.error("Error fetching questions:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch questions")

      // Set fallback questions
      const fallbackQuestions = generateFallbackQuestions(role, topic)
      setQuestions(fallbackQuestions)
      setConversation([{ type: "question", content: fallbackQuestions[0].question }])

      // Start the timer even with fallback questions
      setTimerActive(true)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDynamicFollowUps = async () => {
    if (!questions[currentQuestionIndex]) return

    setIsLoadingFollowUps(true)
    try {
      // Use the Langchain-powered endpoint for follow-up questions
      const response = await fetch(`/api/langchain/follow-up`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          question: questions[currentQuestionIndex].question,
          answer: userAnswer,
          role,
          topic,
        }),
      })

      // Check if response is ok
      if (!response.ok) {
        // Try to get the response text first
        const responseText = await response.text()

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.error || `HTTP error ${response.status}`)
        } catch (jsonError) {
          // If it's not valid JSON, use the text or status
          if (responseText && responseText.length < 100) {
            throw new Error(`Server error: ${responseText}`)
          } else {
            throw new Error(`HTTP error ${response.status}: ${response.statusText || "Unknown error"}`)
          }
        }
      }

      // Try to get the response text first
      const responseText = await response.text()

      // Skip empty responses
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server")
      }

      // Try to parse the JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse follow-up API response:", parseError)
        console.error("Response text:", responseText.substring(0, 200) + "...") // Log first 200 chars
        throw new Error("Failed to parse API response for follow-up questions.")
      }

      // Check if the response contains an error message
      if (data.error) {
        console.warn("Follow-up API returned an error:", data.error)
        // If we have fallback follow-up questions, use them
        if (data.followUpQuestions && data.followUpQuestions.length > 0) {
          // Update the current question with fallback follow-up questions
          setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions]
            updatedQuestions[currentQuestionIndex] = {
              ...updatedQuestions[currentQuestionIndex],
              followUpQuestions: data.followUpQuestions,
            }
            return updatedQuestions
          })
          return
        }
        throw new Error(data.error)
      }

      if (data.followUpQuestions && data.followUpQuestions.length > 0) {
        // Update the current question with new follow-up questions
        setQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions]
          updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            followUpQuestions: data.followUpQuestions,
          }
          return updatedQuestions
        })
      }
    } catch (error) {
      console.error("Error generating follow-up questions:", error)
      // Keep the existing follow-up questions if there's an error
    } finally {
      setIsLoadingFollowUps(false)
    }
  }

  useEffect(() => {
    // Fetch questions when the component mounts
    fetchQuestions()

    // Cleanup function to stop timer when component unmounts
    return () => {
      setTimerActive(false)
    }
  }, [role, topic])

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return

    setIsEvaluating(true)
    setError(null)

    try {
      // Call the Langchain-powered endpoint to evaluate the answer
      const response = await fetch("/api/langchain/evaluate-answer", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          question: questions[currentQuestionIndex].question,
          answer: userAnswer,
          role,
          topic,
        }),
      })

      // Check if response is ok
      if (!response.ok) {
        // Try to get the response text first
        const responseText = await response.text()

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.error || `HTTP error ${response.status}`)
        } catch (jsonError) {
          // If it's not valid JSON, use the text or status
          if (responseText && responseText.length < 100) {
            throw new Error(`Server error: ${responseText}`)
          } else {
            throw new Error(`HTTP error ${response.status}: ${response.statusText || "Unknown error"}`)
          }
        }
      }

      // Try to get the response text first
      const responseText = await response.text()

      // Skip empty responses
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server")
      }

      // Try to parse the JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse evaluation API response:", parseError)
        console.error("Response text:", responseText.substring(0, 200) + "...") // Log first 200 chars
        throw new Error("Failed to parse API response for answer evaluation.")
      }

      // Check if the response contains an error message
      if (data.error) {
        console.warn("Evaluation API returned an error:", data.error)
        throw new Error(data.error)
      }

      if (data.status === "error") {
        throw new Error(data.error || "Failed to evaluate answer")
      }

      // Update score
      const questionScore = data.score || (data.isCorrect ? 10 : 5)
      setScore((prevScore) => prevScore + (data.isCorrect ? 1 : 0))
      setTotalScore((prevTotal) => prevTotal + questionScore)

      // Update state
      setIsCorrect(data.isCorrect)
      setFeedback(data.feedback)
      setSubmitted(true)

      // Add the answer and feedback to the conversation
      setConversation((prev) => [
        ...prev,
        { type: "answer", content: userAnswer },
        {
          type: "feedback",
          content: data.feedback,
          correct: data.isCorrect,
          score: questionScore,
        },
      ])

      // Generate dynamic follow-up questions based on the answer
      generateDynamicFollowUps()
    } catch (error) {
      console.error("Error evaluating answer:", error)
      setError(error instanceof Error ? error.message : "Failed to evaluate answer")

      // Add the answer to the conversation even if evaluation fails
      setConversation((prev) => [...prev, { type: "answer", content: userAnswer }])

      // Set submitted to true so user can continue
      setSubmitted(true)

      // Provide a generic feedback message
      const feedbackText =
        "We couldn't evaluate your answer with AI at this time. Please continue to the next question."
      setFeedback(feedbackText)

      // Add the feedback to the conversation
      setConversation((prev) => [...prev, { type: "feedback", content: feedbackText, correct: false }])
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to the next question
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      setUserAnswer("")
      setSubmitted(false)
      setFeedback("")
      setError(null)

      // Add the next question to the conversation
      setConversation((prev) => [...prev, { type: "question", content: questions[nextIndex].question }])
    } else {
      // End the session if all questions have been answered
      setTimerActive(false) // Stop the timer
      onEndSession(score)
    }
  }

  const handleSelectFollowUpQuestion = (question: string) => {
    // Set the follow-up question as the user's answer
    setUserAnswer((prev) => {
      // If there's already text, add a line break
      if (prev.trim()) {
        return `${prev}\n\nRegarding the follow-up: "${question}"\n`
      }
      return `Regarding the follow-up: "${question}"\n`
    })
  }

  const handleSelectSuggestedAnswer = (answer: string) => {
    // Set the suggested answer as the user's answer or append it
    setUserAnswer((prev) => {
      // If there's already text that ends with the follow-up question prompt, append the answer
      if (prev.trim() && prev.trim().endsWith("\n")) {
        return `${prev}${answer}`
      } else if (prev.trim()) {
        // If there's text but it doesn't end with a newline
        return `${prev}\n\n${answer}`
      }
      // Otherwise just set the answer
      return answer
    })
  }

  const handleRetry = () => {
    // Reset error state and try fetching questions again
    setError(null)
    fetchQuestions()
  }

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Preparing your interview questions...</p>
          <p className="text-gray-500 mt-2">This may take a moment</p>
        </div>
      </motion.div>
    )
  }

  // Show error state with retry button
  if (error && questions.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Questions</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleRetry} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex flex-col p-6 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-0" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {role} - {topic}
            </h2>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTime(timer)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-gray-700">
                Score: {score}/{currentQuestionIndex + (submitted ? 1 : 0)}
              </span>
            </div>
            <div className="text-sm font-medium px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2 bg-gray-200" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto p-4" id="conversation-container">
                  {conversation.map((item, index) => (
                    <motion.div
                      key={index}
                      className="mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.type === "question" && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Brain className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="bg-indigo-50 p-3 rounded-lg rounded-tl-none inline-block max-w-[85%]">
                            <p className="text-gray-800">{item.content}</p>
                          </div>
                        </div>
                      )}

                      {item.type === "answer" && (
                        <div className="flex justify-end mb-2">
                          <div className="bg-white p-3 rounded-lg shadow-sm inline-block max-w-[85%] border border-gray-100">
                            <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                          </div>
                        </div>
                      )}

                      {item.type === "feedback" && (
                        <AnimatePresence>
                          <motion.div
                            className={`mt-2 p-3 rounded-lg inline-flex items-start max-w-[85%] ml-11 ${
                              item.correct
                                ? "bg-green-50 border border-green-100"
                                : "bg-amber-50 border border-amber-100"
                            }`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex-shrink-0 mr-2 mt-0.5">
                              {item.correct ? (
                                <CheckCircle className="text-green-500 h-5 w-5" />
                              ) : (
                                <XCircle className="text-amber-500 h-5 w-5" />
                              )}
                              {item.score && (
                                <div className="mt-1 text-xs font-semibold text-center bg-white rounded-full border border-gray-200 py-0.5">
                                  {item.score}/10
                                </div>
                              )}
                            </div>
                            <p className={`${item.correct ? "text-green-700" : "text-amber-700"} whitespace-pre-wrap`}>
                              {item.content}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </motion.div>
                  ))}

                  {isEvaluating && (
                    <div className="flex items-center justify-center p-4">
                      <div className="bg-white p-3 rounded-full shadow-md">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      </div>
                    </div>
                  )}

                  <div ref={conversationEndRef} />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 space-y-4">
              {!submitted ? (
                <>
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] bg-white/90 backdrop-blur-sm"
                    disabled={isEvaluating}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isEvaluating}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-12"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Evaluating with Langchain...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </motion.div>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center h-12"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>Complete Interview & View Results</>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Follow-up questions panel */}
          <div className="w-full md:w-80 flex-shrink-0">
            {questions[currentQuestionIndex]?.followUpQuestions && !submitted && (
              <FollowUpQuestions
                questions={questions[currentQuestionIndex].followUpQuestions || []}
                onSelectQuestion={handleSelectFollowUpQuestion}
                onSelectAnswer={handleSelectSuggestedAnswer}
                isLoading={isLoadingFollowUps}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

