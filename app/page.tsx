"use client"

import { useState } from "react"
import Introduction from "@/components/introduction"
import ScenarioSelection from "@/components/scenario-selection"
import InterviewSession from "@/components/interview-session"
import ProgressDashboard from "@/components/progress-dashboard"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState("introduction")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [sessionHistory, setSessionHistory] = useState<any[]>([])

  const handleStartDemo = () => {
    setCurrentScreen("scenarioSelection")
  }

  const handleStartInterview = (role: string, topic: string) => {
    setSelectedRole(role)
    setSelectedTopic(topic)
    setCurrentScreen("interviewSession")
  }

  const handleEndSession = (score: number) => {
    const newSession = {
      id: sessionHistory.length + 1,
      date: new Date().toLocaleDateString(),
      role: selectedRole,
      topic: selectedTopic,
      score: `${score}/5`,
    }

    setSessionHistory([newSession, ...sessionHistory])
    setCurrentScreen("progressDashboard")
  }

  const handleBackToIntro = () => {
    setCurrentScreen("introduction")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div
        className={`w-full ${currentScreen === "interviewSession" ? "max-w-6xl" : "max-w-4xl"} bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden transition-all duration-500`}
      >
        {currentScreen === "introduction" && <Introduction onStartDemo={handleStartDemo} />}

        {currentScreen === "scenarioSelection" && <ScenarioSelection onStartInterview={handleStartInterview} />}

        {currentScreen === "interviewSession" && (
          <InterviewSession role={selectedRole} topic={selectedTopic} onEndSession={handleEndSession} />
        )}

        {currentScreen === "progressDashboard" && (
          <ProgressDashboard sessionHistory={sessionHistory} onBackToIntro={handleBackToIntro} />
        )}
      </div>
    </main>
  )
}

