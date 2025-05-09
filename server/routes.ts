import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStudentSchema, 
  insertCourseSchema, 
  insertGradeSchema, 
  insertEnrollmentSchema,
  loginUserSchema,
  insertUserSchema,
  updateProfileSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  AuthRequest, 
  authenticateToken, 
  checkRole,
  hashPassword,
  comparePassword,
  generateToken
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router
  const apiRouter = express.Router();
  
  // Error handler helper
  const handleError = (err: any, res: Response) => {
    console.error('API Error:', err);
    
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ error: validationError.message });
    }
    
    res.status(500).json({ error: err.message || 'An unexpected error occurred' });
  };

  // Student routes
  apiRouter.get('/students', async (_req, res) => {
    try {
      const students = await storage.getStudentsWithCourses();
      res.json(students);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.get('/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const student = await storage.getStudentWithCourses(id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json(student);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.post('/students', async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      
      // Check for duplicate studentId or email
      const existingStudentId = await storage.getStudentByStudentId(studentData.studentId);
      if (existingStudentId) {
        return res.status(400).json({ error: 'Student ID already exists' });
      }
      
      const existingEmail = await storage.getStudentByEmail(studentData.email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.put('/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Validate the request body against the schema
      const studentData = insertStudentSchema.partial().parse(req.body);
      
      // Check if student exists
      const existingStudent = await storage.getStudent(id);
      if (!existingStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      // Check for duplicate studentId or email if they are being updated
      if (studentData.studentId && studentData.studentId !== existingStudent.studentId) {
        const existingStudentId = await storage.getStudentByStudentId(studentData.studentId);
        if (existingStudentId) {
          return res.status(400).json({ error: 'Student ID already exists' });
        }
      }
      
      if (studentData.email && studentData.email !== existingStudent.email) {
        const existingEmail = await storage.getStudentByEmail(studentData.email);
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      
      const updatedStudent = await storage.updateStudent(id, studentData);
      res.json(updatedStudent);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.delete('/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const success = await storage.deleteStudent(id);
      if (!success) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Course routes
  apiRouter.get('/courses', async (_req, res) => {
    try {
      const courses = await storage.getCoursesWithStudents();
      res.json(courses);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.get('/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const course = await storage.getCourseWithStudents(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      res.json(course);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.post('/courses', async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      
      // Check for duplicate courseId
      const existingCourseId = await storage.getCourseByCourseId(courseData.courseId);
      if (existingCourseId) {
        return res.status(400).json({ error: 'Course ID already exists' });
      }
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.put('/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Validate the request body against the schema
      const courseData = insertCourseSchema.partial().parse(req.body);
      
      // Check if course exists
      const existingCourse = await storage.getCourse(id);
      if (!existingCourse) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      // Check for duplicate courseId if it's being updated
      if (courseData.courseId && courseData.courseId !== existingCourse.courseId) {
        const existingCourseId = await storage.getCourseByCourseId(courseData.courseId);
        if (existingCourseId) {
          return res.status(400).json({ error: 'Course ID already exists' });
        }
      }
      
      const updatedCourse = await storage.updateCourse(id, courseData);
      res.json(updatedCourse);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.delete('/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const success = await storage.deleteCourse(id);
      if (!success) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Enrollment routes
  apiRouter.get('/enrollments', async (_req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.post('/enrollments', async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      
      // Check if student exists
      const student = await storage.getStudent(enrollmentData.studentId);
      if (!student) {
        return res.status(400).json({ error: 'Student not found' });
      }
      
      // Check if course exists
      const course = await storage.getCourse(enrollmentData.courseId);
      if (!course) {
        return res.status(400).json({ error: 'Course not found' });
      }
      
      // Check if enrollment already exists
      const existingEnrollments = await storage.getEnrollmentsByStudentId(enrollmentData.studentId);
      const alreadyEnrolled = existingEnrollments.some(
        e => e.courseId === enrollmentData.courseId
      );
      
      if (alreadyEnrolled) {
        return res.status(400).json({ error: 'Student is already enrolled in this course' });
      }
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.delete('/enrollments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const success = await storage.deleteEnrollment(id);
      if (!success) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Grade routes
  apiRouter.get('/grades', async (_req, res) => {
    try {
      const grades = await storage.getFullGrades();
      res.json(grades);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.get('/grades/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const grade = await storage.getGrade(id);
      if (!grade) {
        return res.status(404).json({ error: 'Grade not found' });
      }
      
      res.json(grade);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.post('/grades', async (req, res) => {
    try {
      const gradeData = insertGradeSchema.parse(req.body);
      
      // Check if student exists
      const student = await storage.getStudent(gradeData.studentId);
      if (!student) {
        return res.status(400).json({ error: 'Student not found' });
      }
      
      // Check if course exists
      const course = await storage.getCourse(gradeData.courseId);
      if (!course) {
        return res.status(400).json({ error: 'Course not found' });
      }
      
      // Check if student is enrolled in the course
      const enrollments = await storage.getEnrollmentsByStudentId(gradeData.studentId);
      const isEnrolled = enrollments.some(e => e.courseId === gradeData.courseId);
      
      if (!isEnrolled) {
        return res.status(400).json({ error: 'Student is not enrolled in this course' });
      }
      
      const grade = await storage.createGrade(gradeData);
      res.status(201).json(grade);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.put('/grades/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Validate the request body against the schema
      const gradeData = insertGradeSchema.partial().parse(req.body);
      
      // Check if grade exists
      const existingGrade = await storage.getGrade(id);
      if (!existingGrade) {
        return res.status(404).json({ error: 'Grade not found' });
      }
      
      const updatedGrade = await storage.updateGrade(id, gradeData);
      res.json(updatedGrade);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.delete('/grades/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const success = await storage.deleteGrade(id);
      if (!success) {
        return res.status(404).json({ error: 'Grade not found' });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // Dashboard stats
  apiRouter.get('/dashboard/stats', async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Auth routes
  apiRouter.post('/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Hash the password
      const passwordHash = await hashPassword(userData.password);
      
      // Create the user
      const user = await storage.createUser(userData, passwordHash);
      
      // Generate a token
      const token = generateToken(user);
      
      // Return user data without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.post('/auth/login', async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      
      // Find user by username or email
      const user = await storage.getUserByUsernameOrEmail(credentials.usernameOrEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if password matches
      const isPasswordValid = await comparePassword(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login time
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Generate a token
      const token = generateToken(user);
      
      // Return user data without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Protected user profile routes
  apiRouter.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return user data without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const profileData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return user data without password hash
      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (err) {
      handleError(err, res);
    }
  });

  apiRouter.put('/profile/password', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash the new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // Update the password
      await storage.updateUserPassword(userId, newPasswordHash);
      
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Admin routes (protected by role)
  apiRouter.get('/users', authenticateToken, checkRole(['admin']), async (_req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Remove password hashes
      const usersWithoutPasswords = users.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Use the API router with the /api prefix
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
