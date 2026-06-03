import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { db } from "./db";
import { classes, assignments, submissions, chatSessions, chatMessages } from "./db/schema";

const app = express();
app.use(cors());
app.use(express.json());

// 1. Better Auth REST API Handler (Express 5 compatible wildcard)
app.all("/api/auth/{*path}", toNodeHandler(auth));

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Vive AI API",
    version: "1.0.0",
    description: "The complete backend REST API for **Vive AI** — an AI-powered, inclusive learning platform for African students. Covers Authentication, Teacher Portal, Student Portal, AI Tutor, Library, Planner, Community, and Career tools.",
    contact: { name: "Vive AI Support", email: "support@vive-ai.edu" },
  },
  tags: [
    { name: "Auth", description: "Authentication (Better Auth — email/password)" },
    { name: "Teacher", description: "Teacher portal — manage classes, assignments, and staff" },
    { name: "Student", description: "Student portal — view assignments and submit homework" },
    { name: "AI", description: "AI Tutor chat sessions and message history" },
    { name: "Library", description: "Digital library — books and learning content" },
    { name: "Quizzes", description: "AI-generated and manual quizzes" },
    { name: "Community", description: "Community posts and comments" },
    { name: "Planner", description: "Student planner tasks and career goals" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Session token returned by /api/auth/sign-in/email",
      },
    },
  },
  paths: {
    // ── AUTH ──
    "/api/auth/sign-up/email": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user (student or teacher)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email", example: "amara.diallo@vive-ai.edu" },
                  password: { type: "string", example: "mysecretpassword" },
                  name: { type: "string", example: "Amara Diallo" },
                  role: { type: "string", enum: ["student", "teacher"], default: "student" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "User created successfully" } },
      },
    },
    "/api/auth/sign-in/email": {
      post: {
        tags: ["Auth"],
        summary: "Login an existing user — returns a session token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "amara.diallo@vive-ai.edu" },
                  password: { type: "string", example: "mysecretpassword" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful — session cookie set" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/sign-out": {
      post: {
        tags: ["Auth"],
        summary: "Logout the current user and destroy session",
        responses: { 200: { description: "Logged out successfully" } },
      },
    },
    // ── TEACHER — CLASSES ──
    "/api/classes": {
      get: {
        tags: ["Teacher"],
        summary: "Get all classes",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Array of Class objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "uuid-1234" },
                      name: { type: "string", example: "Mathematics P6" },
                      teacherId: { type: "string" },
                      description: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Teacher"],
        summary: "Create a new class",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "teacherId"],
                properties: {
                  name: { type: "string", example: "Biology Grade 10" },
                  teacherId: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Class created successfully" },
          500: { description: "Server error" },
        },
      },
    },
    // ── TEACHER — ASSIGNMENTS ──
    "/api/assignments": {
      get: {
        tags: ["Teacher"],
        summary: "Get all assignments (teacher view)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Array of Assignment objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      classId: { type: "string" },
                      title: { type: "string", example: "Chapter 3 Exercises" },
                      description: { type: "string" },
                      dueDate: { type: "string", format: "date-time" },
                      totalPoints: { type: "integer", example: 100 },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ── STUDENT — ASSIGNMENTS ──
    "/api/student/assignments": {
      get: {
        tags: ["Student"],
        summary: "Get all assignments visible to the current student",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Array of Assignment objects" } },
      },
    },
    // ── STUDENT — SUBMISSIONS ──
    "/api/student/submissions": {
      post: {
        tags: ["Student"],
        summary: "Submit homework for an assignment",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["assignmentId", "studentId", "content"],
                properties: {
                  assignmentId: { type: "string" },
                  studentId: { type: "string" },
                  content: { type: "string", example: "My completed answer..." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Submission saved" },
          500: { description: "Server error" },
        },
      },
    },
    // ── AI TUTOR ──
    "/api/ai/chat": {
      get: {
        tags: ["AI"],
        summary: "Get all AI chat sessions for the current user",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Array of ChatSession objects" } },
      },
      post: {
        tags: ["AI"],
        summary: "Send a message to the Vive AI Tutor",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId", "message"],
                properties: {
                  sessionId: { type: "string", example: "session-uuid" },
                  message: { type: "string", example: "Can you explain photosynthesis in simple steps?" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "AI tutor response message" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/ai/simplify": {
      post: {
        tags: ["AI"],
        summary: "Simplify difficult text using AI or rule-based engine",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", example: "Photosynthesis is the process by which plants utilize sunlight to facilitate the production of food." },
                  grade: { type: "string", example: "P6" },
                  subject: { type: "string", example: "Science" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Simplified text",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    simplified: { type: "string" },
                    engine: { type: "string", enum: ["cohere", "rule-based"] },
                  },
                },
              },
            },
          },
          500: { description: "Server error" },
        },
      },
    },
    // ── QUIZZES ──
    "/api/quizzes": {
      get: {
        tags: ["Quizzes"],
        summary: "Get all quizzes (including AI-generated)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Array of Quiz objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string", example: "Photosynthesis Quick Quiz" },
                      classId: { type: "string", nullable: true },
                      isAiGenerated: { type: "boolean" },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Quizzes"],
        summary: "Create a new quiz",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Fractions Quiz" },
                  classId: { type: "string" },
                  isAiGenerated: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Quiz created" }, 500: { description: "Server error" } },
      },
    },
    "/api/quizzes/{quizId}/results": {
      post: {
        tags: ["Quizzes"],
        summary: "Submit a quiz result",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "quizId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId", "score"],
                properties: {
                  studentId: { type: "string" },
                  score: { type: "integer", example: 8 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Result saved" } },
      },
    },
    // ── LIBRARY / CONTENT ──
    "/api/library": {
      get: {
        tags: ["Library"],
        summary: "Get all digital library content (books, videos)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Array of ContentLibrary items",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string", example: "Mathematics Grade 6" },
                      type: { type: "string", enum: ["video", "book", "pdf"] },
                      url: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/library/{contentId}/progress": {
      post: {
        tags: ["Library"],
        summary: "Update reading/watching progress for a student",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "contentId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId", "progressPercentage"],
                properties: {
                  studentId: { type: "string" },
                  progressPercentage: { type: "integer", minimum: 0, maximum: 100, example: 45 },
                  status: { type: "string", enum: ["started", "completed"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Progress updated" } },
      },
    },
    // ── COMMUNITY ──
    "/api/community/posts": {
      get: {
        tags: ["Community"],
        summary: "Get all community posts",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Array of Post objects" } },
      },
      post: {
        tags: ["Community"],
        summary: "Create a new community post",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["authorId", "title", "content"],
                properties: {
                  authorId: { type: "string" },
                  title: { type: "string", example: "Study tips for science!" },
                  content: { type: "string", example: "Here are my top 3 tips for memorising the periodic table..." },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Post created" } },
      },
    },
    "/api/community/posts/{postId}/comments": {
      post: {
        tags: ["Community"],
        summary: "Add a comment to a post",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["authorId", "content"],
                properties: {
                  authorId: { type: "string" },
                  content: { type: "string", example: "Great tips, thanks!" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Comment added" } },
      },
    },
    // ── PLANNER ──
    "/api/planner/tasks": {
      get: {
        tags: ["Planner"],
        summary: "Get all planner tasks for a student",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "studentId", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Array of PlannerTask objects" } },
      },
      post: {
        tags: ["Planner"],
        summary: "Create a new planner task",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId", "title"],
                properties: {
                  studentId: { type: "string" },
                  title: { type: "string", example: "Study fractions for 30 minutes" },
                  dueDate: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Task created" } },
      },
    },
    "/api/planner/tasks/{taskId}/complete": {
      patch: {
        tags: ["Planner"],
        summary: "Mark a planner task as completed",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "taskId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Task marked complete" } },
      },
    },
    // ── CAREER GOALS ──
    "/api/career/goals": {
      get: {
        tags: ["Planner"],
        summary: "Get career goals for a student",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "studentId", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Array of CareerGoal objects" } },
      },
      post: {
        tags: ["Planner"],
        summary: "Add a new career goal",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId", "goalDescription"],
                properties: {
                  studentId: { type: "string" },
                  goalDescription: { type: "string", example: "Become a software engineer" },
                  targetDate: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Career goal saved" } },
      },
    },
  },
};
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3. Educational API Endpoints
app.get("/api/classes", async (req, res) => {
  const all = await db.select().from(classes);
  res.json(all);
});

app.get("/api/assignments", async (req, res) => {
  const all = await db.select().from(assignments);
  res.json(all);
});

app.get("/api/student/assignments", async (req, res) => {
  const all = await db.select().from(assignments);
  res.json(all);
});

app.post("/api/student/submissions", async (req, res) => {
  try {
    const data = req.body;
    const newSub = await db.insert(submissions).values({
      id: crypto.randomUUID(),
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      content: data.content,
    }).returning();
    res.json(newSub[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/ai/chat", async (req, res) => {
  const all = await db.select().from(chatSessions);
  res.json(all);
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(chatMessages).values({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      role: "user",
      content: data.message,
    });
    
    const aiMsg = await db.insert(chatMessages).values({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      role: "ai",
      content: "I am Vive's AI tutor! I can help you with your homework.",
    }).returning();
    res.json(aiMsg[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/ai/simplify", async (req, res) => {
  try {
    const { text, grade = "3", subject = "General" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text to simplify" });
    }

    const apiKey = process.env.VITE_COHERE_API_KEY || process.env.COHERE_API_KEY;
    if (!apiKey) {
      const simplified = fallbackSimplify(text);
      return res.json({ simplified, engine: "rule-based" });
    }

    // Call Cohere API
    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Client-Name": "vive-ai",
      },
      body: JSON.stringify({
        model: "command-r-plus-08-2024",
        messages: [
          {
            role: "system",
            content: "You are a friendly teacher helping a dyslexic primary school student understand difficult text. Please rewrite the following text so it is very easy to understand. Use SHORT, simple words, short sentences (max 10 words each), and replacement of hard words. Add a short 'What this means:' summary in 1-2 sentences at the end."
          },
          { role: "user", content: `Simplify this text:\n"${text}"` },
        ],
      }),
    });

    if (!response.ok) {
      const simplified = fallbackSimplify(text);
      return res.json({ simplified, engine: "rule-based" });
    }

    const json = await response.json();
    const content = json?.message?.content;
    let simplifiedText = "";
    if (Array.isArray(content)) {
      simplifiedText = content.map((c: any) => c.text ?? "").join("");
    } else {
      simplifiedText = json.text ?? json.message ?? "";
    }

    res.json({ simplified: simplifiedText, engine: "cohere" });
  } catch (e: any) {
    const fallback = fallbackSimplify(req.body.text || "");
    res.json({ simplified: fallback, engine: "rule-based-error" });
  }
});

function fallbackSimplify(text: string): string {
  if (!text.trim()) return "";
  const replacements: Record<string, string> = {
    utilize: "use", commence: "start", terminate: "end", endeavor: "try",
    subsequently: "then", additionally: "also", approximately: "about",
    demonstrate: "show", facilitate: "help", consequently: "so",
    photosynthesis: "how plants make food", precipitation: "rain",
  };
  let out = text;
  Object.entries(replacements).forEach(([k, v]) => {
    out = out.replace(new RegExp(`\\b${k}\\b`, "gi"), v);
  });
  out = out.replace(/([.!?])\s+/g, "$1\n\n");
  return out;
}


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});
