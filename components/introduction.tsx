"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Brain, MessageSquare, BarChart3, Sparkles } from "lucide-react"

interface IntroductionProps {
  onStartDemo: () => void
}

export default function Introduction({ onStartDemo }: IntroductionProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-0" />

      {/* Animated circles */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-200 opacity-20 z-0"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-purple-200 opacity-20 z-0"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -10, 0],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <div className="relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="inline-block mb-6 p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <Sparkles className="h-12 w-12 text-indigo-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Interview Simulator
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-10 text-gray-700 max-w-xl mx-auto"
        >
          <p className="text-lg mb-6">
            Prepare for your next job interview with our powered simulator. Get real-time feedback and improve your
            skills.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm flex flex-col items-center">
              <Brain className="h-8 w-8 text-indigo-500 mb-2" />
              <span className="font-medium">Dynamic AI Interviews</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
              <span className="font-medium">Instant Feedback</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm flex flex-col items-center">
              <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
              <span className="font-medium">Progress Tracking</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onStartDemo}
            className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            Start Your Interview
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

