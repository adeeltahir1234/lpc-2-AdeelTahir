"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  ChevronDown,
  ChevronUp,
  Home,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  BarChart3,
  Clock,
  Brain,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Session {
  id: number
  date: string
  role: string
  topic: string
  score: string
}

interface ProgressDashboardProps {
  sessionHistory: Session[]
  onBackToIntro: () => void
}

export default function ProgressDashboard({ sessionHistory, onBackToIntro }: ProgressDashboardProps) {
  const [expandedSession, setExpandedSession] = useState<number | null>(null)

  const toggleSession = (sessionId: number) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null)
    } else {
      setExpandedSession(sessionId)
    }
  }

  // Dummy session details for demonstration
  const getSessionDetails = (sessionId: number) => {
    return {
      questions: [
        "Can you explain how database indexing impacts query performance?",
        "What strategies would you use to optimize a slow SQL query?",
        "Explain the difference between horizontal and vertical scaling for databases.",
      ],
      answers: [
        "Database indexing improves query performance by creating data structures that allow the database engine to locate rows more quickly without scanning the entire table. This is similar to how a book index helps you find information without reading the whole book.",
        "I would first analyze the execution plan to identify bottlenecks, then consider adding appropriate indexes, rewriting the query to be more efficient, denormalizing if necessary, and potentially using caching strategies.",
        "Horizontal scaling adds more machines to distribute the load, while vertical scaling adds more power to existing machines. Horizontal scaling is generally more flexible but introduces complexity in data distribution.",
      ],
      feedback: [
        "Great answer! You provided a clear analogy that demonstrates understanding.\n\nStrengths:\n1. Clear explanation of indexing concept\n2. Good use of analogy\n\nAreas for improvement:\n1. Could mention different types of indexes",
        "Good response, but consider mentioning query parameterization to avoid repeated parsing.\n\nStrengths:\n1. Methodical approach to optimization\n\nAreas for improvement:\n1. Mention query parameterization\n2. Discuss monitoring and benchmarking",
        "Well explained! You could also mention specific use cases for each scaling approach.\n\nStrengths:\n1. Clear distinction between scaling types\n\nAreas for improvement:\n1. Include specific use cases\n2. Discuss hybrid approaches",
      ],
      isCorrect: [true, false, true],
      scores: [8, 6, 9],
    }
  }

  // Calculate overall performance metrics
  const calculatePerformanceMetrics = () => {
    if (sessionHistory.length === 0) return null

    const totalSessions = sessionHistory.length
    const totalCorrect = sessionHistory.reduce((acc, session) => {
      const [correct, total] = session.score.split("/")
      return acc + Number.parseInt(correct)
    }, 0)

    const totalQuestions = sessionHistory.reduce((acc, session) => {
      const [_, total] = session.score.split("/")
      return acc + Number.parseInt(total)
    }, 0)

    const successRate = Math.round((totalCorrect / totalQuestions) * 100)

    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      successRate,
    }
  }

  const metrics = calculatePerformanceMetrics()

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
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Brain className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Langchain Interview Results
            </h2>
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={onBackToIntro}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
            >
              <Home className="h-4 w-4 text-indigo-500" />
              Back to Home
            </Button>
          </motion.div>
        </div>

        {metrics && sessionHistory.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sessions</p>
                    <h3 className="text-2xl font-bold">{metrics.totalSessions}</h3>
                  </div>
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Questions Answered</p>
                    <h3 className="text-2xl font-bold">{metrics.totalQuestions}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Correct Answers</p>
                    <h3 className="text-2xl font-bold">{metrics.totalCorrect}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <h3 className="text-2xl font-bold">{metrics.successRate}%</h3>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {sessionHistory.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Interview Sessions Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Complete your first interview to start tracking your progress and performance over time.
            </p>
            <Button
              onClick={onBackToIntro}
              className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              Start Your First Interview
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {sessionHistory.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * idx }}
              >
                <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0 overflow-hidden">
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSession(session.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-medium">
                        {session.role.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {session.role} - {session.topic}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {session.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          Number.parseInt(session.score.split("/")[0]) / Number.parseInt(session.score.split("/")[1]) >=
                          0.7
                            ? "success"
                            : Number.parseInt(session.score.split("/")[0]) /
                                  Number.parseInt(session.score.split("/")[1]) >=
                                0.4
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {session.score}
                      </Badge>
                      {expandedSession === session.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedSession === session.id && (
                    <motion.div
                      className="border-t border-gray-100"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          Session Details
                        </h3>

                        {getSessionDetails(session.id).questions.map((question, index) => (
                          <div key={index} className="mb-6 last:mb-0">
                            <div className="font-medium text-gray-800 mb-2 flex items-start gap-2">
                              <span className="bg-indigo-100 text-indigo-800 rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{question}</span>
                            </div>
                            <div className="ml-7">
                              <div className="text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg text-sm">
                                {getSessionDetails(session.id).answers[index]}
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getSessionDetails(session.id).isCorrect[index] ? (
                                    <CheckCircle className="text-green-500 h-4 w-4" />
                                  ) : (
                                    <XCircle className="text-red-500 h-4 w-4" />
                                  )}
                                  <div className="mt-1 text-xs font-semibold text-center bg-white rounded-full border border-gray-200 py-0.5 px-1">
                                    {getSessionDetails(session.id).scores[index]}/10
                                  </div>
                                </div>
                                <div
                                  className={
                                    getSessionDetails(session.id).isCorrect[index] ? "text-green-700" : "text-red-700"
                                  }
                                >
                                  <div className="whitespace-pre-wrap">
                                    {getSessionDetails(session.id).feedback[index]}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

