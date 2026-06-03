import { pgTable, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
export const contentStatusEnum = pgEnum("content_status", ["started", "completed"]);

// ---- AUTH TABLES ----
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
    // Custom Vive fields
    role: roleEnum("role").default("student"),
    xp: integer("xp").default(0),
    level: integer("level").default(1),
    bio: text("bio"),
    schoolId: text("school_id")
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at")
});

// ---- VIVE EDUCATIONAL TABLES ----

// Classes
export const classes = pgTable("classes", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    teacherId: text("teacher_id").notNull().references(() => user.id),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Enrollments (Students in Classes)
export const enrollments = pgTable("enrollments", {
    studentId: text("student_id").notNull().references(() => user.id),
    classId: text("class_id").notNull().references(() => classes.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Teacher Announcements / Posts
export const announcements = pgTable("announcements", {
    id: text("id").primaryKey(),
    classId: text("class_id").notNull().references(() => classes.id),
    teacherId: text("teacher_id").notNull().references(() => user.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Assignments
export const assignments = pgTable("assignments", {
    id: text("id").primaryKey(),
    classId: text("class_id").notNull().references(() => classes.id),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date"),
    totalPoints: integer("total_points").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Submissions & Marks (Grades)
export const submissions = pgTable("submissions", {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id),
    studentId: text("student_id").notNull().references(() => user.id),
    content: text("content"), // e.g., URL or text
    markReceived: integer("mark_received"), // The grade kept for the kid
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull()
});

// Quizzes
export const quizzes = pgTable("quizzes", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    classId: text("class_id").references(() => classes.id),
    isAiGenerated: boolean("is_ai_generated").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Quiz Results
export const quizResults = pgTable("quiz_results", {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => user.id),
    quizId: text("quiz_id").notNull().references(() => quizzes.id),
    score: integer("score").notNull(), // Another form of mark
    completedAt: timestamp("completed_at").defaultNow().notNull()
});

// AI Chat History (Tutor)
export const chatSessions = pgTable("chat_sessions", {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => user.id),
    topic: text("topic"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const chatMessages = pgTable("chat_messages", {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => chatSessions.id),
    role: text("role").notNull(), // 'user' or 'ai'
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Content Library (Videos, Books)
export const contentLibrary = pgTable("content_library", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    type: text("type").notNull(), // 'video', 'book', etc
    url: text("url")
});

export const contentProgress = pgTable("content_progress", {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => user.id),
    contentId: text("content_id").notNull().references(() => contentLibrary.id),
    status: contentStatusEnum("status").default("started"),
    progressPercentage: integer("progress_percentage").default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Community
export const posts = pgTable("posts", {
    id: text("id").primaryKey(),
    authorId: text("author_id").notNull().references(() => user.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const comments = pgTable("comments", {
    id: text("id").primaryKey(),
    postId: text("post_id").notNull().references(() => posts.id),
    authorId: text("author_id").notNull().references(() => user.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// Planner / Goals
export const plannerTasks = pgTable("planner_tasks", {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => user.id),
    title: text("title").notNull(),
    dueDate: timestamp("due_date"),
    isCompleted: boolean("is_completed").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const careerGoals = pgTable("career_goals", {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => user.id),
    goalDescription: text("goal_description").notNull(),
    targetDate: timestamp("target_date")
});
