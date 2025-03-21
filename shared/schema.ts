import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students Table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  year: integer("year").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  courseId: text("course_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  credits: integer("credits").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Student Course Enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrollmentDate: true,
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

// Grades Table
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  score: numeric("score").notNull(),
  term: text("term").notNull(),
  gradedDate: timestamp("graded_date").defaultNow(),
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
  gradedDate: true,
});

export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof grades.$inferSelect;

// Extended schemas for frontend use
export const studentWithCoursesSchema = z.object({
  ...insertStudentSchema.shape,
  id: z.number(),
  courses: z.array(z.object({
    id: z.number(),
    courseId: z.string(),
    name: z.string(),
  })).optional(),
  averageGrade: z.number().optional(),
});

export type StudentWithCourses = z.infer<typeof studentWithCoursesSchema>;

export const courseWithStudentsSchema = z.object({
  ...insertCourseSchema.shape,
  id: z.number(),
  students: z.array(z.object({
    id: z.number(),
    studentId: z.string(),
    name: z.string(),
  })).optional(),
  averageGrade: z.number().optional(),
});

export type CourseWithStudents = z.infer<typeof courseWithStudentsSchema>;

export const fullGradeSchema = z.object({
  ...insertGradeSchema.shape,
  id: z.number(),
  student: z.object({
    id: z.number(),
    studentId: z.string(),
    name: z.string(),
  }),
  course: z.object({
    id: z.number(),
    courseId: z.string(),
    name: z.string(),
  }),
});

export type FullGrade = z.infer<typeof fullGradeSchema>;

// Dashboard Stats
export const dashboardStatsSchema = z.object({
  totalStudents: z.number(),
  activeCourses: z.number(),
  averageGrade: z.number(),
  pendingGrades: z.number(),
  gradeDistribution: z.object({
    labels: z.array(z.string()),
    data: z.array(z.number()),
  }),
  recentActivity: z.array(z.object({
    type: z.string(),
    message: z.string(),
    timestamp: z.string(),
  })),
  topStudents: z.array(z.object({
    id: z.number(),
    name: z.string(),
    averageGrade: z.number(),
  })),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
