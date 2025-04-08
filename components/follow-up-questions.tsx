"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Copy, HelpCircle, Lightbulb, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FollowUpQuestion {
  question: string
  suggestedAnswer: string
}

interface FollowUpQuestionsProps {
  questions: FollowUpQuestion[]
  onSelectQuestion: (question: string) => void
  onSelectAnswer: (answer: string) => void
  isLoading?: boolean
}

export default function FollowUpQuestions({
  questions,
  onSelectQuestion,
  onSelectAnswer,
  isLoading = false,
}: FollowUpQuestionsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (!questions || questions.length === 0) {
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-500" />
                Related Follow-up Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex items-center justify-center p-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Generating follow-up questions...</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }
    return null
  }

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
  }

  const handleCopyAnswer = (answer: string) => {
    onSelectAnswer(answer)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="backdrop-blur-sm bg-white/90 shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-500" />
            Related Follow-up Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {questions.map((item, index) => (
              <li key={index} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="flex flex-col">
                  <button
                    className="text-left w-full p-3 transition-colors text-sm font-medium"
                  >
                    {item.question}
                  </button>

                  <div
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleExpand(index)}
                  >
                    <span className="text-xs text-gray-600 flex items-center">
                      <Lightbulb className="h-3 w-3 text-amber-500 mr-1" />
                      View its answer
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  {expandedIndex === index && (
                    <motion.div
                      className="p-3 bg-gray-50 border-t border-gray-100"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{item.suggestedAnswer}</div>
                    </motion.div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

