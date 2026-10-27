import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { db } from "./db";
import { eq, and, desc, or, inArray } from "drizzle-orm";
import { classes, assignments, submissions, chatSessions, chatMessages, notifications, parentStudentRelations, messages, attendance, user, announcements, enrollments, quizResults, schedules } from "./db/schema";
import { uploadRouter } from "./upload-handler";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed"));
  },
  credentials: true,
}));
app.use(express.json());

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: "student" | "teacher" | "admin" | "parent" | null;
  schoolId?: string | null;
  xp?: number | null;
  level?: number | null;
};

type AuthedRequest = express.Request & { authUser: AuthUser };

function requestHeaders(req: express.Request) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(","));
    else if (typeof value === "string") headers.set(key, value);
  }
  return headers;
}

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: requestHeaders(req),
      query: { disableCookieCache: true },
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Please sign in to continue." });
    }

    (req as AuthedRequest).authUser = session.user as AuthUser;
    next();
  } catch (error) {
    console.error("Session validation failed:", error);
    res.status(401).json({ error: "Your session could not be verified. Please sign in again." });
  }
}

function requireRole(...roles: NonNullable<AuthUser["role"]>[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authUser = (req as AuthedRequest).authUser;
    if (!authUser || !authUser.role || !roles.includes(authUser.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

function requireText(value: unknown, field: string, max = 5000) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  if (value.length > max) {
    throw new Error(`${field} is too long.`);
  }
  return value.trim();
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Ready check endpoint - verifies database connection
app.get("/ready", async (req, res) => {
  try {
    // Try a simple database query to verify connection
    await db.select().from(user).limit(1);
    res.json({ status: "ready", database: "connected" });
  } catch (error: any) {
    res.status(503).json({ 
      status: "not_ready", 
      database: "disconnected",
      error: error.message 
    });
  }
});

// Health check for OAuth configuration
app.get("/api/oauth-config", (req, res) => {
  res.json({
    google: {
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientIdSet: !!process.env.GOOGLE_CLIENT_ID,
      clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
    },
  });
});

// ━━ MUST be registered before requireAuth so auth routes bypass session checks ━━
// Better Auth REST API Handler (Express 5 compatible wildcard)
app.all(/^\/api\/auth(\/.*)?$/, toNodeHandler(auth));

// Cloudinary Upload Handler
app.use("/api", uploadRouter);

// Update user profile (role, grade, etc.) — protected route
app.put("/api/user/profile", requireAuth, async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;

    const { role, grade } = req.body;
    
    const VALID_ROLES = ["student", "teacher", "parent", "admin"];
    const updates: any = {};
    if (role && VALID_ROLES.includes(role)) updates.role = role;
    if (typeof grade === "string" && grade.trim()) updates.grade = grade.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const updated = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, authUser.id))
      .returning();

    if (!updated[0]) return res.status(404).json({ error: "User not found." });
    res.json(updated[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

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
                    engine: { type: "string", enum: ["gemini", "rule-based"] },
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

app.use("/api", requireAuth);

// GET /api/me — returns the authenticated user's full profile
app.get("/api/me", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    const [fullUser] = await db.select().from(user).where(eq(user.id, authUser.id));
    if (!fullUser) return res.status(404).json({ error: "User not found." });
    res.json(fullUser);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/student/assignments/count — pending assignment count for the student
app.get("/api/student/assignments/count", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access required." });
    const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, authUser.id));
    const classIds = studentEnrollments.map(e => e.classId);
    const allAssigns = classIds.length > 0 ? await db.select().from(assignments).where(inArray(assignments.classId, classIds)) : [];
    // Count assignments that have no submission from this student
    const assignmentIds = allAssigns.map(a => a.id);
    const mySubmissions = assignmentIds.length > 0
      ? await db.select().from(submissions).where(and(eq(submissions.studentId, authUser.id), inArray(submissions.assignmentId, assignmentIds)))
      : [];
    const submittedIds = new Set(mySubmissions.map(s => s.assignmentId));
    const pending = allAssigns.filter(a => !submittedIds.has(a.id)).length;
    res.json({ count: pending, total: allAssigns.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Educational API Endpoints
app.get("/api/classes", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  if (authUser.role === "teacher") {
    const all = await db.select().from(classes).where(eq(classes.teacherId, authUser.id));
    return res.json(all);
  }
  if (authUser.role === "student") {
    const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, authUser.id));
    if (studentEnrollments.length === 0) return res.json([]);
    const classIds = studentEnrollments.map((item) => item.classId);
    const all = await db.select().from(classes).where(inArray(classes.id, classIds));
    return res.json(all);
  }
  if (authUser.role === "parent") {
    const relations = await db.select().from(parentStudentRelations).where(eq(parentStudentRelations.parentId, authUser.id));
    const classIds = new Set<string>();
    for (const relation of relations) {
      const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, relation.studentId));
      studentEnrollments.forEach((item) => classIds.add(item.classId));
    }
    if (classIds.size === 0) return res.json([]);
    const all = await db.select().from(classes).where(inArray(classes.id, Array.from(classIds)));
    return res.json(all);
  }
  const all = await db.select().from(classes);
  res.json(all);
});

app.post("/api/teacher/generate-homework", requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { fileUrl, grade, subject, classId, difficulty } = req.body;
    
    const fileRes = await fetch(fileUrl);
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing Gemini API Key." });

    const prompt = `You are an expert teacher. Generate a homework assignment based strictly on the provided document.
    Target Grade: ${grade}
    Subject: ${subject}
    Difficulty: ${difficulty || 'Mixed'}
    
    Return a JSON array of questions. Include a mix of types: 'mcq', 'true_false', 'short_answer'.
    For 'mcq', include 'options' array (strings) and 'answer' string.
    For 'true_false', include 'answer' string ('True' or 'False').
    For 'short_answer', include a 'rubric' string.
    Each question must have 'questionText' string and 'points' number.`;

    const responseCall = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "application/pdf", data: base64Data } },
            { text: prompt }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!responseCall.ok) {
      const err = await responseCall.text();
      return res.status(500).json({ error: "Gemini error: " + err });
    }

    const json = await responseCall.json();
    const generatedText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const questions = JSON.parse(generatedText);
    
    res.json({ questions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/teacher/analytics", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "teacher" && authUser.role !== "admin") {
      return res.status(403).json({ error: "Teacher access is required." });
    }
    const teacherClasses = await db.select().from(classes).where(eq(classes.teacherId, authUser.id));
    const classIds = teacherClasses.map((item) => item.id);
    const allAssigns = classIds.length > 0
      ? await db.select().from(assignments).where(inArray(assignments.classId, classIds))
      : [];
    const assignmentIds = allAssigns.map((item) => item.id);
    const allSubs = assignmentIds.length > 0
      ? await db.select().from(submissions).where(inArray(submissions.assignmentId, assignmentIds))
      : [];

    const totalAssignments = allAssigns.length;
    const totalSubmissions = allSubs.length;
    let averageScore = 0;
    let totalPointsReceived = 0;
    let totalPointsPossible = 0;

    allSubs.forEach(sub => {
      if (sub.markReceived !== null) {
        totalPointsReceived += sub.markReceived;
        const assignment = allAssigns.find(a => a.id === sub.assignmentId);
        if (assignment && assignment.totalPoints) {
          totalPointsPossible += assignment.totalPoints;
        }
      }
    });

    if (totalPointsPossible > 0) {
      averageScore = Math.round((totalPointsReceived / totalPointsPossible) * 100);
    }

    res.json({
      overview: { totalAssignments, totalSubmissions, averageScore },
      recentSubmissions: allSubs.slice(-10)
    });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/student/insights", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    
    const studentSubs = await db.select().from(submissions).where(eq(submissions.studentId, authUser.id));
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing API Key" });

    const prompt = `Analyze this student's submission history and provide learning insights.
    Identify weak topics, recommend study plans, and suggest teacher interventions.
    Data: ${JSON.stringify(studentSubs)}
    Return ONLY a JSON object: {"strengths": ["string"], "weaknesses": ["string"], "recommendations": ["string"]}`;

    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    if (!aiRes.ok) throw new Error("AI call failed");
    const json = await aiRes.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{"strengths":[],"weaknesses":[],"recommendations":[]}';
    res.json(JSON.parse(text));
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- STUDENT DASHBOARD ENDPOINTS ---

app.get("/api/student/dashboard/schedules", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    
    const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, authUser.id));
    if (studentEnrollments.length === 0) return res.json([]);
    
    const classIds = studentEnrollments.map(e => e.classId);
    const allSchedules = await db.select().from(schedules);
    const mySchedules = allSchedules.filter(s => classIds.includes(s.classId));
    
    res.json(mySchedules);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/student/dashboard/performance", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    
    const studentSubs = await db.select().from(submissions).where(eq(submissions.studentId, authUser.id));
    const allAssigns = await db.select().from(assignments);
    
    const subjectStats: Record<string, { earned: number, total: number }> = {};
    
    studentSubs.forEach(sub => {
      const assignment = allAssigns.find(a => a.id === sub.assignmentId);
      if (assignment && assignment.subject && assignment.totalPoints && sub.markReceived !== null) {
         if (!subjectStats[assignment.subject]) subjectStats[assignment.subject] = { earned: 0, total: 0 };
         subjectStats[assignment.subject].earned += sub.markReceived;
         subjectStats[assignment.subject].total += assignment.totalPoints;
      }
    });

    const performance = Object.entries(subjectStats).map(([subject, stats]) => {
      return { subject, score: Math.round((stats.earned / stats.total) * 100) };
    });

    res.json(performance);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/student/dashboard/notifications", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    
    const userNotifications = await db.select().from(notifications).where(eq(notifications.userId, authUser.id)).orderBy(desc(notifications.createdAt));
    res.json(userNotifications);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/student/dashboard/top-scores", async (req, res) => {
  try {
    const allUsers = await db.select().from(user).where(eq(user.role, 'student'));
    // Simple sort by XP for "Top Scores"
    const topStudents = allUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);
    
    const topScores = topStudents.map((u, i) => ({
      name: u.name,
      xp: u.xp || 0,
      score: (u.xp || 0).toLocaleString() + " XP",
      rank: i + 1,
      color: i === 0 ? "#D4952A" : i === 1 ? "#536B8A" : i === 2 ? "#0E9F6E" : "#4A8FE7"
    }));
    
    res.json(topScores);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- TEACHER SCHEDULE & NOTIFICATION ENDPOINTS ---

app.post("/api/teacher/schedules", requireRole("teacher", "admin"), async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    const { classId, title, description, date, type } = req.body;
    const teacherClass = await db.select().from(classes).where(and(eq(classes.id, classId), eq(classes.teacherId, authUser.id)));
    if (teacherClass.length === 0) return res.status(403).json({ error: "You can only schedule events for your own classes." });
    const cleanTitle = requireText(title, "Title", 180);
    if (!date || Number.isNaN(new Date(date).getTime())) return res.status(400).json({ error: "A valid date is required." });
    const scheduleId = crypto.randomUUID();
    const newSchedule = await db.insert(schedules).values({
      id: scheduleId,
      classId,
      teacherId: authUser.id,
      title: cleanTitle,
      description: typeof description === "string" ? description.trim() : undefined,
      date: new Date(date),
      type: type || 'event'
    }).returning();
    
    res.json(newSchedule[0]);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/teacher/notifications", requireRole("teacher", "admin"), async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    const { classId, title, message } = req.body;
    const teacherClass = await db.select().from(classes).where(and(eq(classes.id, classId), eq(classes.teacherId, authUser.id)));
    if (teacherClass.length === 0) return res.status(403).json({ error: "You can only notify your own classes." });
    const cleanTitle = requireText(title, "Title", 180);
    const cleanMessage = requireText(message, "Message", 2000);
    
    const enrolledStudents = await db.select().from(enrollments).where(eq(enrollments.classId, classId));
    
    for (const enrollment of enrolledStudents) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: enrollment.studentId,
        title: cleanTitle,
        message: cleanMessage,
        link: "/student/planner"
      });
    }
    
    res.json({ success: true, count: enrolledStudents.length });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/assignments", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role === "teacher") {
      const teacherClasses = await db.select().from(classes).where(eq(classes.teacherId, authUser.id));
      const classIds = teacherClasses.map((item) => item.id);
      const all = classIds.length > 0 ? await db.select().from(assignments).where(inArray(assignments.classId, classIds)) : [];
      return res.json(all);
    }
    if (authUser.role === "student") {
      const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, authUser.id));
      const classIds = studentEnrollments.map((item) => item.classId);
      const all = classIds.length > 0 ? await db.select().from(assignments).where(inArray(assignments.classId, classIds)) : [];
      return res.json(all);
    }
    const all = await db.select().from(assignments);
    res.json(all);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/assignments/:id", async (req, res) => {
  const { id } = req.params;
  const authUser = (req as unknown as AuthedRequest).authUser;
  const assignment = await db.select().from(assignments).where(eq(assignments.id, id));
  if (assignment.length === 0) return res.status(404).json({ error: "Assignment not found" });
  if (authUser.role === "student") {
    const studentEnrollments = await db.select().from(enrollments).where(and(eq(enrollments.studentId, authUser.id), eq(enrollments.classId, assignment[0].classId)));
    if (studentEnrollments.length === 0) return res.status(403).json({ error: "This assignment is not available to your account." });
  }
  if (authUser.role === "teacher") {
    const teacherClass = await db.select().from(classes).where(and(eq(classes.id, assignment[0].classId), eq(classes.teacherId, authUser.id)));
    if (teacherClass.length === 0) return res.status(403).json({ error: "This assignment is not in one of your classes." });
  }
  res.json(assignment[0]);
});

app.get("/api/student/assignments", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
  const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, authUser.id));
  const classIds = studentEnrollments.map((item) => item.classId);
  const all = classIds.length > 0 ? await db.select().from(assignments).where(inArray(assignments.classId, classIds)) : [];
  res.json(all);
});

app.post("/api/student/submissions", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    const data = req.body;
    const assignmentId = requireText(data.assignmentId, "Assignment ID", 120);
    const studentEnrollment = await db.select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId));
    if (studentEnrollment.length === 0) return res.status(404).json({ error: "Assignment not found." });
    const enrolled = await db.select().from(enrollments).where(and(eq(enrollments.studentId, authUser.id), eq(enrollments.classId, studentEnrollment[0].classId)));
    if (enrolled.length === 0) return res.status(403).json({ error: "You cannot submit work for this assignment." });
    const submissionId = crypto.randomUUID();
    const newSub = await db.insert(submissions).values({
      id: submissionId,
      assignmentId,
      studentId: authUser.id,
      content: typeof data.content === "string" ? data.content.trim() : "Submission completed",
      answers: data.answers 
    }).returning();
    
    res.json(newSub[0]);

    // Async auto-grading
    (async () => {
      try {
        const assignmentRecs = await db.select().from(assignments).where(eq(assignments.id, assignmentId));
        if (assignmentRecs.length === 0) return;
        const assignment = assignmentRecs[0];
        const questions = (assignment.questions as any[]) || [];
        
        let totalMark = 0;
        let aiFeedback = "Automated grading completed.\n\n";

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const studentAns = data.answers[`q-${i}`] || "";
          
          if (q.type === 'mcq' || q.type === 'multiple_choice' || q.type === 'true_false') {
             if (studentAns === q.answer || studentAns === q.correctAnswer) {
               totalMark += (q.points || 1);
             }
          } else if (q.type === 'short_answer' || q.type === 'essay') {
             const apiKey = process.env.GEMINI_API_KEY;
             if (apiKey) {
               const prompt = `Grade this short answer for a ${q.points || 1} points question.
               Question: ${q.questionText || q.text}
               Rubric: ${q.rubric || 'N/A'}
               Student Answer: ${studentAns}
               Return ONLY a JSON object: {"awardedPoints": number, "feedback": "string"}`;
               
               try {
                 const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({
                     contents: [{ role: "user", parts: [{ text: prompt }] }],
                     generationConfig: { responseMimeType: "application/json" }
                   })
                 });
                 if (aiRes.ok) {
                   const json = await aiRes.json();
                   const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{"awardedPoints":0,"feedback":""}';
                   const grading = JSON.parse(text);
                   totalMark += (grading.awardedPoints || 0);
                   aiFeedback += `Q${i+1}: ${grading.feedback}\n`;
                 }
               } catch(e) {
                 console.warn("AI grading failed for Q" + i, e);
               }
             }
          }
        }

        // Update submission with marks
        await db.update(submissions)
          .set({ markReceived: totalMark, feedback: aiFeedback })
          .where(eq(submissions.id, submissionId));

        // Create Notification
        await db.insert(notifications).values({
          id: crypto.randomUUID(),
          userId: authUser.id,
          title: "Assignment Graded!",
          message: `Your submission for ${assignment.title} has been automatically graded. Score: ${totalMark}/${assignment.totalPoints}`,
          link: `/student/homework/${assignmentId}`
        });
      } catch (err) {
        console.error("Async grading error:", err);
      }
    })();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/ai/chat", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
  const all = await db.select().from(chatSessions).where(eq(chatSessions.studentId, authUser.id));
  res.json(all);
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    const data = req.body;
    const sessionId = requireText(data.sessionId, "Session ID", 120);
    const ownedSession = await db.select().from(chatSessions).where(and(eq(chatSessions.id, sessionId), eq(chatSessions.studentId, authUser.id)));
    if (ownedSession.length === 0) return res.status(403).json({ error: "Chat session not found for your account." });
    await db.insert(chatMessages).values({
      id: crypto.randomUUID(),
      sessionId,
      role: "user",
      content: requireText(data.message, "Message", 8000),
    });
    
    const aiMsg = await db.insert(chatMessages).values({
      id: crypto.randomUUID(),
      sessionId,
      role: "ai",
      content: "I can help you with this. Tell me what part feels confusing and we will work through it step by step.",
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const simplified = fallbackSimplify(text);
      return res.json({ simplified, engine: "rule-based" });
    }

    // Attempt to call Gemini API with models in sequence as fallback
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let response: any = null;
    let lastErrorMsg = "";

    for (const model of models) {
      try {
        const responseCall = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: `Simplify this text:\n"${text}"` }] }
            ],
            systemInstruction: {
              parts: [{ text: "You are a friendly teacher helping a dyslexic primary school student understand difficult text. Please rewrite the following text so it is very easy to understand. Use SHORT, simple words, short sentences (max 10 words each), and replacement of hard words. Add a short 'What this means:' summary in 1-2 sentences at the end." }]
            }
          })
        });

        if (responseCall.ok) {
          response = responseCall;
          break;
        } else {
          const errText = await responseCall.text();
          lastErrorMsg = `Model ${model} failed: ${errText}`;
          console.warn(lastErrorMsg);
        }
      } catch (e: any) {
        lastErrorMsg = `Fetch to ${model} threw: ${e.message}`;
        console.warn(lastErrorMsg);
      }
    }

    if (!response) {
      const cohereKey = process.env.COHERE_API_KEY;
      if (cohereKey) {
        try {
          const cohereRes = await fetch("https://api.cohere.com/v1/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${cohereKey}`
            },
            body: JSON.stringify({
              message: `Simplify this text:\n"${text}"`,
              preamble: "You are a friendly teacher helping a dyslexic primary school student understand difficult text. Please rewrite the following text so it is very easy to understand. Use SHORT, simple words, short sentences (max 10 words each), and replacement of hard words. Add a short 'What this means:' summary in 1-2 sentences at the end."
            })
          });
          if (cohereRes.ok) {
            const cohereJson = await cohereRes.json();
            return res.json({ simplified: cohereJson.text, engine: "cohere" });
          }
        } catch (e) {
          console.warn("Cohere fallback failed:", e);
        }
      }
      const simplified = fallbackSimplify(text);
      return res.json({ simplified, engine: "rule-based" });
    }

    const json = await response.json();
    const simplifiedText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ simplified: simplifiedText, engine: "gemini" });
  } catch (e: any) {
    const fallback = fallbackSimplify(req.body.text || "");
    res.json({ simplified: fallback, engine: "rule-based-error" });
  }
});

app.post("/api/ai/chat-stream", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "student") return res.status(403).json({ error: "Student access is required." });
    const { message, chatHistory, systemPrompt, sessionId } = req.body;
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing Gemini API Key." });
    }

    // Set headers for streaming raw newline-separated JSON
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Save user message to DB if sessionId is present
    if (sessionId) {
      try {
        const ownedSession = await db.select().from(chatSessions).where(and(eq(chatSessions.id, sessionId), eq(chatSessions.studentId, authUser.id)));
        if (ownedSession.length === 0) {
          return res.status(403).json({ error: "Chat session not found for your account." });
        }
        await db.insert(chatMessages).values({
          id: crypto.randomUUID(),
          sessionId,
          role: "user",
          content: message,
        });
      } catch (err) {
        console.error("DB User Message Error:", err);
      }
    }

    // Format chat history for Gemini API
    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const item of chatHistory) {
        contents.push({
          role: item.role === "USER" || item.role === "user" ? "user" : "model",
          parts: [{ text: item.message || item.text || "" }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Attempt to call Gemini streaming API with models in sequence as fallback
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let response: any = null;
    let lastErrorMsg = "";

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const resCall = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
          })
        });

        if (resCall.ok) {
          response = resCall;
          break;
        } else {
          const errText = await resCall.text();
          lastErrorMsg = `Model ${model} failed (status ${resCall.status}): ${errText}`;
          console.warn(lastErrorMsg);
        }
      } catch (err: any) {
        lastErrorMsg = `Fetch to ${model} threw: ${err.message}`;
        console.warn(lastErrorMsg);
      }
    }

    if (!response) {
      const cohereKey = process.env.COHERE_API_KEY;
      if (!cohereKey) {
        return res.status(503).json({ error: `All Gemini models failed and no Cohere fallback key. Last error: ${lastErrorMsg}` });
      }
      
      try {
        const cohereHistory = (chatHistory || []).map((item: any) => ({
          role: item.role === "USER" || item.role === "user" ? "USER" : "CHATBOT",
          message: item.message || item.text || ""
        }));

        const cohereRes = await fetch("https://api.cohere.com/v1/chat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cohereKey}`
          },
          body: JSON.stringify({
            message,
            chat_history: cohereHistory,
            preamble: systemPrompt,
            stream: true
          })
        });

        if (!cohereRes.ok) {
          throw new Error("Cohere stream failed: " + await cohereRes.text());
        }

        const reader = cohereRes.body?.getReader();
        if (!reader) throw new Error("No response body from Cohere");

        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullTextResponse = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          let boundary = buffer.indexOf("\n");
          while (boundary !== -1) {
            const line = buffer.substring(0, boundary).trim();
            buffer = buffer.substring(boundary + 1);
            if (line) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.event_type === "text-generation" && parsed.text) {
                  fullTextResponse += parsed.text;
                  res.write(JSON.stringify({ event_type: "text-generation", text: parsed.text }) + "\n");
                }
              } catch (e) {}
            }
            boundary = buffer.indexOf("\n");
          }
        }
        
        if (sessionId && fullTextResponse) {
          try {
            await db.insert(chatMessages).values({
              id: crypto.randomUUID(),
              sessionId,
              role: "ai",
              content: fullTextResponse,
            });
          } catch (err) {}
        }
        
        return res.end();
      } catch (err: any) {
        return res.status(503).json({ error: "Cohere fallback failed: " + err.message });
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: "No response body from Gemini" });
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullTextResponse = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      let boundary = buffer.indexOf("\n");
      while (boundary !== -1) {
        const line = buffer.substring(0, boundary).trim();
        buffer = buffer.substring(boundary + 1);

        if (line.startsWith("data: ")) {
          const jsonStr = line.substring(6).trim();
          if (jsonStr === "[DONE]") {
            continue;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const textToken = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (textToken) {
              fullTextResponse += textToken;
              // Send chunk in Cohere format to keep frontend logic unchanged
              res.write(JSON.stringify({ event_type: "text-generation", text: textToken }) + "\n");
            }
          } catch (e) {
            // Partial JSON or other format
          }
        }
        boundary = buffer.indexOf("\n");
      }
    }

    // Process any remaining text in buffer
    if (buffer.trim().startsWith("data: ")) {
      const jsonStr = buffer.trim().substring(6).trim();
      if (jsonStr !== "[DONE]") {
        try {
          const parsed = JSON.parse(jsonStr);
          const textToken = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (textToken) {
            fullTextResponse += textToken;
            res.write(JSON.stringify({ event_type: "text-generation", text: textToken }) + "\n");
          }
        } catch (e) {}
      }
    }

    // Save AI message to DB if sessionId is present
    if (sessionId && fullTextResponse) {
      try {
        await db.insert(chatMessages).values({
          id: crypto.randomUUID(),
          sessionId,
          role: "ai",
          content: fullTextResponse,
        });
      } catch (err) {
        console.error("DB AI Message Error:", err);
      }
    }

    res.end();
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    res.status(500).json({ error: error.message || "Failed to stream AI response" });
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

// ─── NOTIFICATIONS API ───
app.get("/api/notifications", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    const list = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, authUser.id))
      .orderBy(desc(notifications.createdAt));
    res.json(list);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const authUser = (req as unknown as AuthedRequest).authUser;
    const { id } = req.params;
    const updated = await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, authUser.id)))
      .returning();
    res.json(updated[0] || { success: false });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PARENT PORTAL API ───
app.post("/api/parent/link-student", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "parent") return res.status(403).json({ error: "Parent access is required." });
    const studentIdentifier = requireText(req.body.studentIdentifier, "Student identifier", 180);
    
    // Find student by email or id
    let studentUser = await db.select().from(user).where(eq(user.email, studentIdentifier));
    if (studentUser.length === 0) {
      studentUser = await db.select().from(user).where(eq(user.id, studentIdentifier));
    }
    if (studentUser.length === 0) {
      const clean = studentIdentifier.trim();
      const match = clean.match(/^(?:vive-)?(\d+)-(\d+)$/i);
      if (match) {
        const email = `${match[1]}-${match[2]}@vive.edu`;
        studentUser = await db.select().from(user).where(eq(user.email, email));
      }
    }
    
    if (studentUser.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student = studentUser[0];
    if (student.role !== "student") {
      return res.status(400).json({ error: "Selected user is not a student" });
    }

    // Check if link already exists
    const existing = await db.select()
      .from(parentStudentRelations)
      .where(
        and(
          eq(parentStudentRelations.parentId, authUser.id),
          eq(parentStudentRelations.studentId, student.id)
        )
      );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Student is already linked to this parent" });
    }

    await db.insert(parentStudentRelations).values({
      parentId: authUser.id,
      studentId: student.id
    });

    res.json({ success: true, student });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/parent/students", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    if (authUser.role !== "parent") return res.status(403).json({ error: "Parent access is required." });
    const relations = await db.select()
      .from(parentStudentRelations)
      .where(eq(parentStudentRelations.parentId, authUser.id));
    
    const studentsList = [];
    for (const rel of relations) {
      const users = await db.select().from(user).where(eq(user.id, rel.studentId));
      if (users.length > 0) {
        studentsList.push(users[0]);
      }
    }
    res.json(studentsList);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/parent/student/:studentId/progress", async (req, res) => {
  try {
    const authUser = (req as unknown as AuthedRequest).authUser;
    if (authUser.role !== "parent") return res.status(403).json({ error: "Parent access is required." });
    const { studentId } = req.params;
    const relation = await db.select().from(parentStudentRelations).where(and(eq(parentStudentRelations.parentId, authUser.id), eq(parentStudentRelations.studentId, studentId)));
    if (relation.length === 0) return res.status(403).json({ error: "This student is not linked to your account." });
    const studentSubmissions = await db.select().from(submissions).where(eq(submissions.studentId, studentId));
    const studentQuizzes = await db.select().from(quizResults).where(eq(quizResults.studentId, studentId));
    const studentAttendance = await db.select().from(attendance).where(eq(attendance.studentId, studentId));
    
    res.json({
      submissions: studentSubmissions,
      quizzes: studentQuizzes,
      attendance: studentAttendance
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DIRECT MESSAGES API ───
app.post("/api/messages", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;
    const { receiverId } = req.body;
    const content = requireText(req.body.content, "Message", 5000);
    if (typeof receiverId !== "string" || !receiverId.trim()) {
      return res.status(400).json({ error: "Receiver is required." });
    }
    const receiver = await db.select().from(user).where(eq(user.id, receiverId));
    if (receiver.length === 0) return res.status(404).json({ error: "Receiver not found." });
    
    const msgId = crypto.randomUUID();
    const newMsg = await db.insert(messages).values({
      id: msgId,
      senderId: authUser.id,
      receiverId,
      content
    }).returning();

    // Create a notification for the receiver
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: receiverId,
      title: `Message from ${authUser.name}`,
      message: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
      link: `/messages`
    });

    res.json(newMsg[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const authUser = (req as AuthedRequest).authUser;

    const userMsgs = await db.select().from(messages).where(or(eq(messages.senderId, authUser.id), eq(messages.receiverId, authUser.id)));

    const threadsMap: Record<string, { lastMessage: any; otherUser: any }> = {};
    for (const msg of userMsgs) {
      const otherId = msg.senderId === authUser.id ? msg.receiverId : msg.senderId;
      if (!threadsMap[otherId] || new Date(msg.createdAt) > new Date(threadsMap[otherId].lastMessage.createdAt)) {
        const users = await db.select().from(user).where(eq(user.id, otherId));
        if (users.length > 0) {
          threadsMap[otherId] = {
            lastMessage: msg,
            otherUser: users[0]
          };
        }
      }
    }
    res.json(Object.values(threadsMap));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/messages/:otherUserId", async (req, res) => {
  try {
    const authUser = (req as unknown as AuthedRequest).authUser;
    const { otherUserId } = req.params;
    const history = await db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, authUser.id), eq(messages.receiverId, otherUserId)),
        and(eq(messages.senderId, otherUserId), eq(messages.receiverId, authUser.id))
      ));
    history.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark as read
    await db.update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.senderId, otherUserId), eq(messages.receiverId, authUser.id)));

    res.json(history);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ANNOUNCEMENTS API ───
app.get("/api/classes/:classId/announcements", async (req, res) => {
  try {
    const authUser = (req as unknown as AuthedRequest).authUser;
    const { classId } = req.params;
    if (authUser.role === "student") {
      const enrolled = await db.select().from(enrollments).where(and(eq(enrollments.studentId, authUser.id), eq(enrollments.classId, classId)));
      if (enrolled.length === 0) return res.status(403).json({ error: "You are not enrolled in this class." });
    }
    if (authUser.role === "teacher") {
      const teacherClass = await db.select().from(classes).where(and(eq(classes.id, classId), eq(classes.teacherId, authUser.id)));
      if (teacherClass.length === 0) return res.status(403).json({ error: "This is not one of your classes." });
    }
    const list = await db.select()
      .from(announcements)
      .where(eq(announcements.classId, classId))
      .orderBy(desc(announcements.createdAt));
    res.json(list);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/classes/:classId/announcements", async (req, res) => {
  try {
    const authUser = (req as unknown as AuthedRequest).authUser;
    if (authUser.role !== "teacher" && authUser.role !== "admin") return res.status(403).json({ error: "Teacher access is required." });
    const { classId } = req.params;
    const { attachmentUrl } = req.body;
    const title = requireText(req.body.title, "Title", 180);
    const content = requireText(req.body.content, "Content", 5000);
    if (authUser.role === "teacher") {
      const teacherClass = await db.select().from(classes).where(and(eq(classes.id, classId), eq(classes.teacherId, authUser.id)));
      if (teacherClass.length === 0) return res.status(403).json({ error: "You can only post to your own classes." });
    }

    const id = crypto.randomUUID();
    const newAnn = await db.insert(announcements).values({
      id,
      classId,
      teacherId: authUser.id,
      title,
      content,
      attachmentUrl
    }).returning();

    // Notify all enrolled students in the class
    const enrolls = await db.select()
      .from(enrollments)
      .where(eq(enrollments.classId, classId));
    
    const cl = await db.select().from(classes).where(eq(classes.id, classId));
    const className = cl[0]?.name || "Class";

    for (const enroll of enrolls) {
      // Create notification for student
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: enroll.studentId,
        title: `New Announcement in ${className}`,
        message: `${title}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        link: `/student`
      });

      // Create notification for their parent(s) if any
      const parentsList = await db.select()
        .from(parentStudentRelations)
        .where(eq(parentStudentRelations.studentId, enroll.studentId));
      for (const parentRel of parentsList) {
        await db.insert(notifications).values({
          id: crypto.randomUUID(),
          userId: parentRel.parentId,
          title: `Announcement for ${className}`,
          message: `Your child's class has a new announcement: ${title}`,
          link: `/parent`
        });
      }
    }

    res.json(newAnn[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found", path: req.path, method: req.method });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Unhandled Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err?.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: err?.stack })
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Backend Server running on http://localhost:${PORT}`);
  console.log(`✓ Swagger UI available at http://localhost:${PORT}/api/docs`);
  console.log(`✓ Health check: GET http://localhost:${PORT}/health`);
  console.log(`✓ Ready check: GET http://localhost:${PORT}/ready`);
});
