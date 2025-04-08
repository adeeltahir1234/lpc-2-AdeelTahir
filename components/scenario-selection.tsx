"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { ArrowRight, Briefcase, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ScenarioSelectionProps {
  onStartInterview: (role: string, topic: string) => void
}

export default function ScenarioSelection({ onStartInterview }: ScenarioSelectionProps) {
  const [role, setRole] = useState("")
  const [topic, setTopic] = useState("")

  const handleStartInterview = () => {
    if (role && topic) {
      onStartInterview(role, topic)
    }
  }

  // Define available roles and topics
  const roles = [
    { value: "Backend Developer", icon: "🖥️" },
    { value: "Frontend Developer", icon: "🎨" },
    { value: "Data Scientist", icon: "📊" },
  ]

  const topics = {
    "Backend Developer": [
      { value: "Database Optimization", icon: "🔍" },
      { value: "API Design", icon: "🔌" },
      { value: "Microservices", icon: "🧩" },
    ],
    "Frontend Developer": [
      { value: "ReactJS Basics", icon: "⚛️" },
      { value: "UI/UX Principles", icon: "🎭" },
      { value: "State Management", icon: "🔄" },
    ],
    "Data Scientist": [
      { value: "Data Modeling", icon: "📈" },
      { value: "Machine Learning", icon: "🤖" },
      { value: "Data Visualization", icon: "📊" },
    ],
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-0" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Select Interview Scenario
          </h2>
        </motion.div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardContent className="p-6 space-y-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                <label className="text-sm font-medium text-gray-700">Job Role</label>
              </div>
              <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-12">
                  <SelectValue placeholder="Select a job role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value} className="py-3">
                      <div className="flex items-center">
                        <span className="mr-2">{roleOption.icon}</span>
                        <span>{roleOption.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                <label className="text-sm font-medium text-gray-700">Interview Topic</label>
              </div>
              <Select onValueChange={setTopic} value={topic} disabled={!role}>
                <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-12">
                  <SelectValue placeholder={role ? "Select a topic" : "Select a role first"} />
                </SelectTrigger>
                <SelectContent>
                  {role &&
                    topics[role as keyof typeof topics]?.map((topicOption) => (
                      <SelectItem key={topicOption.value} value={topicOption.value} className="py-3">
                        <div className="flex items-center">
                          <span className="mr-2">{topicOption.icon}</span>
                          <span>{topicOption.value}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleStartInterview}
                disabled={!role || !topic}
                className="w-full mt-6 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Start Interview
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

