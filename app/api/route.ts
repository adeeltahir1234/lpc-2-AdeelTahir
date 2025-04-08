import { type NextRequest, NextResponse } from "next/server"
import { Database } from "sqlite3"
import { open } from "sqlite"

// Initialize database
async function openDb() {
  return open({
    filename: "./interview.db",
    driver: Database,
  })
}

// Initialize the database and create tables if they don't exist
async function initializeDb() {
  const db = await openDb()

  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      topic TEXT NOT NULL,
      question TEXT NOT NULL
    )
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      role TEXT NOT NULL,
      topic TEXT NOT NULL,
      score INTEGER NOT NULL
    )
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer TEXT NOT NULL,
      feedback TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions (id),
      FOREIGN KEY (question_id) REFERENCES questions (id)
    )
  `)

  // Check if we need to seed the database with initial questions
  const count = await db.get("SELECT COUNT(*) as count FROM questions")

  if (count.count === 0) {
    // Seed database with initial questions
    const questions = [
      // Backend Developer - Database Optimization
      {
        role: "Backend Developer",
        topic: "Database Optimization",
        question: "Can you explain how database indexing impacts query performance?",
      },
      {
        role: "Backend Developer",
        topic: "Database Optimization",
        question: "What strategies would you use to optimize a slow SQL query?",
      },
      {
        role: "Backend Developer",
        topic: "Database Optimization",
        question: "Explain the difference between horizontal and vertical scaling for databases.",
      },
      {
        role: "Backend Developer",
        topic: "Database Optimization",
        question: "How would you handle database connection pooling in a high-traffic application?",
      },
      {
        role: "Backend Developer",
        topic: "Database Optimization",
        question: "What are the trade-offs between denormalization and normalization in database design?",
      },

      // Frontend Developer - ReactJS Basics
      {
        role: "Frontend Developer",
        topic: "ReactJS Basics",
        question: "Explain the difference between state and props in React.",
      },
      {
        role: "Frontend Developer",
        topic: "ReactJS Basics",
        question: "How does React's virtual DOM work and why is it beneficial?",
      },
      {
        role: "Frontend Developer",
        topic: "ReactJS Basics",
        question: "What are React hooks and how do they improve component development?",
      },
      { role: "Frontend Developer", topic: "ReactJS Basics", question: "Describe the component lifecycle in React." },
      {
        role: "Frontend Developer",
        topic: "ReactJS Basics",
        question: "How would you optimize performance in a React application?",
      },

      // Data Scientist - Data Modeling
      {
        role: "Data Scientist",
        topic: "Data Modeling",
        question: "What is the difference between supervised and unsupervised learning?",
      },
      { role: "Data Scientist", topic: "Data Modeling", question: "How do you handle missing data in a dataset?" },
      { role: "Data Scientist", topic: "Data Modeling", question: "Explain overfitting and how to prevent it." },
      {
        role: "Data Scientist",
        topic: "Data Modeling",
        question: "What evaluation metrics would you use for a classification problem?",
      },
      {
        role: "Data Scientist",
        topic: "Data Modeling",
        question: "Describe the process of feature selection and why it's important.",
      },
    ]

    const stmt = await db.prepare("INSERT INTO questions (role, topic, question) VALUES (?, ?, ?)")

    for (const q of questions) {
      await stmt.run(q.role, q.topic, q.question)
    }

    await stmt.finalize()
  }

  return db
}

// API route to get questions
export async function GET(request: NextRequest) {
  try {
    const db = await initializeDb()
    const { searchParams } = new URL(request.url)

    const role = searchParams.get("role")
    const topic = searchParams.get("topic")

    if (!role || !topic) {
      return NextResponse.json({ error: "Role and topic are required" }, { status: 400 })
    }

    const questions = await db.all("SELECT * FROM questions WHERE role = ? AND topic = ? LIMIT 5", [role, topic])

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

// API route to submit an answer and get feedback
export async function POST(request: NextRequest) {
  try {
    const db = await initializeDb()
    const body = await request.json()

    const { sessionId, questionId, answer } = body

    if (!answer) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 })
    }

    // In a real application, this would call an AI service to evaluate the answer
    // For this demo, we'll use a simple length-based evaluation
    const isCorrect = answer.length > 50 ? 1 : 0

    // Generate feedback based on the answer
    let feedback = ""
    if (isCorrect) {
      feedback = "Great answer! You demonstrated a solid understanding of the concept."
    } else {
      feedback = "Your answer could be improved by providing more details and examples."
    }

    // If this is a new session, create it
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const result = await db.run("INSERT INTO sessions (date, role, topic, score) VALUES (?, ?, ?, ?)", [
        new Date().toISOString(),
        "Unknown",
        "Unknown",
        0,
      ])
      currentSessionId = result.lastID
    }

    // Save the answer
    await db.run("INSERT INTO answers (session_id, question_id, answer, feedback, is_correct) VALUES (?, ?, ?, ?, ?)", [
      currentSessionId,
      questionId,
      answer,
      feedback,
      isCorrect,
    ])

    // Update the session score if the answer is correct
    if (isCorrect) {
      await db.run("UPDATE sessions SET score = score + 1 WHERE id = ?", [currentSessionId])
    }

    return NextResponse.json({
      success: true,
      feedback,
      isCorrect: Boolean(isCorrect),
      sessionId: currentSessionId,
    })
  } catch (error) {
    console.error("Error processing answer:", error)
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 })
  }
}

