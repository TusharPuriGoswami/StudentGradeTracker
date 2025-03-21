import { 
  Student, InsertStudent, students,
  Course, InsertCourse, courses,
  Enrollment, InsertEnrollment, enrollments,
  Grade, InsertGrade, grades,
  StudentWithCourses, CourseWithStudents, FullGrade,
  DashboardStats
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getStudentWithCourses(id: number): Promise<StudentWithCourses | undefined>;
  getStudentsWithCourses(): Promise<StudentWithCourses[]>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseByCourseId(courseId: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  getCourseWithStudents(id: number): Promise<CourseWithStudents | undefined>;
  getCoursesWithStudents(): Promise<CourseWithStudents[]>;
  
  // Enrollment operations
  getEnrollments(): Promise<Enrollment[]>;
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  deleteEnrollment(id: number): Promise<boolean>;
  
  // Grade operations
  getGrades(): Promise<Grade[]>;
  getGrade(id: number): Promise<Grade | undefined>;
  getGradesByStudentId(studentId: number): Promise<Grade[]>;
  getGradesByCourseId(courseId: number): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  deleteGrade(id: number): Promise<boolean>;
  getFullGrades(): Promise<FullGrade[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private grades: Map<number, Grade>;
  
  private studentCurrentId: number;
  private courseCurrentId: number;
  private enrollmentCurrentId: number;
  private gradeCurrentId: number;

  constructor() {
    this.students = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.grades = new Map();
    
    this.studentCurrentId = 1;
    this.courseCurrentId = 1;
    this.enrollmentCurrentId = 1;
    this.gradeCurrentId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // Helper methods for demo data
  private initializeDemoData() {
    // Create courses
    const courseData: InsertCourse[] = [
      { courseId: 'MATH101', name: 'Mathematics 101', description: 'Introduction to advanced mathematics', credits: 3 },
      { courseId: 'ENG201', name: 'English 201', description: 'Composition and Literature', credits: 3 },
      { courseId: 'SCI301', name: 'Science 301', description: 'Applied Physics', credits: 4 },
      { courseId: 'HIS202', name: 'History 202', description: 'World History', credits: 3 },
      { courseId: 'PHY301', name: 'Physics 301', description: 'Advanced Physics', credits: 4 }
    ];
    
    courseData.forEach(course => this.createCourse(course));
    
    // Create students
    const studentData: InsertStudent[] = [
      { studentId: 'S1001', name: 'Emily Johnson', email: 'emily.johnson@example.com', year: 3, avatarUrl: 'https://i.pravatar.cc/150?img=1' },
      { studentId: 'S1002', name: 'Daniel Smith', email: 'daniel.smith@example.com', year: 2, avatarUrl: 'https://i.pravatar.cc/150?img=2' },
      { studentId: 'S1003', name: 'Sophia Martinez', email: 'sophia.martinez@example.com', year: 4, avatarUrl: 'https://i.pravatar.cc/150?img=3' },
      { studentId: 'S1004', name: 'Michael Brown', email: 'michael.brown@example.com', year: 1, avatarUrl: 'https://i.pravatar.cc/150?img=4' }
    ];
    
    studentData.forEach(student => this.createStudent(student));
    
    // Create enrollments
    const enrollmentData: InsertEnrollment[] = [
      { studentId: 1, courseId: 1 }, // Emily in Math 101
      { studentId: 1, courseId: 3 }, // Emily in Science 301
      { studentId: 1, courseId: 4 }, // Emily in History 202
      { studentId: 2, courseId: 2 }, // Daniel in English 201
      { studentId: 2, courseId: 3 }, // Daniel in Science 301
      { studentId: 3, courseId: 1 }, // Sophia in Math 101
      { studentId: 3, courseId: 4 }, // Sophia in History 202
      { studentId: 4, courseId: 2 }, // Michael in English 201
      { studentId: 4, courseId: 5 }  // Michael in Physics 301
    ];
    
    enrollmentData.forEach(enrollment => this.createEnrollment(enrollment));
    
    // Create grades
    const gradeData: InsertGrade[] = [
      { studentId: 1, courseId: 1, score: 98.5, term: 'Spring 2023' },
      { studentId: 1, courseId: 3, score: 97.8, term: 'Spring 2023' },
      { studentId: 1, courseId: 4, score: 99.2, term: 'Spring 2023' },
      { studentId: 2, courseId: 2, score: 96.2, term: 'Spring 2023' },
      { studentId: 2, courseId: 3, score: 96.0, term: 'Spring 2023' },
      { studentId: 3, courseId: 1, score: 95.7, term: 'Spring 2023' },
      { studentId: 3, courseId: 4, score: 95.8, term: 'Spring 2023' },
      { studentId: 4, courseId: 2, score: 75.8, term: 'Spring 2023' },
      { studentId: 4, courseId: 5, score: 73.8, term: 'Spring 2023' }
    ];
    
    gradeData.forEach(grade => this.createGrade(grade));
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.studentId === studentId);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.email === email);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentCurrentId++;
    const timestamp = new Date();
    const newStudent: Student = { 
      ...student, 
      id,
      createdAt: timestamp
    };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;

    const updatedStudent: Student = {
      ...existingStudent,
      ...student
    };
    
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    // Delete associated enrollments and grades first
    const studentEnrollments = await this.getEnrollmentsByStudentId(id);
    for (const enrollment of studentEnrollments) {
      await this.deleteEnrollment(enrollment.id);
    }

    const studentGrades = await this.getGradesByStudentId(id);
    for (const grade of studentGrades) {
      await this.deleteGrade(grade.id);
    }

    return this.students.delete(id);
  }

  async getStudentWithCourses(id: number): Promise<StudentWithCourses | undefined> {
    const student = await this.getStudent(id);
    if (!student) return undefined;

    const studentEnrollments = await this.getEnrollmentsByStudentId(id);
    const studentCourses = await Promise.all(
      studentEnrollments.map(async (enrollment) => {
        const course = await this.getCourse(enrollment.courseId);
        return course ? { 
          id: course.id, 
          courseId: course.courseId, 
          name: course.name 
        } : null;
      })
    );

    const studentGrades = await this.getGradesByStudentId(id);
    const totalScore = studentGrades.reduce((sum, grade) => sum + Number(grade.score), 0);
    const averageGrade = studentGrades.length > 0 ? totalScore / studentGrades.length : 0;

    return {
      ...student,
      courses: studentCourses.filter(Boolean) as { id: number; courseId: string; name: string; }[],
      averageGrade: Number(averageGrade.toFixed(1))
    };
  }

  async getStudentsWithCourses(): Promise<StudentWithCourses[]> {
    const students = await this.getStudents();
    return Promise.all(students.map(student => this.getStudentWithCourses(student.id) as Promise<StudentWithCourses>));
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseByCourseId(courseId: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(course => course.courseId === courseId);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseCurrentId++;
    const timestamp = new Date();
    const newCourse: Course = { 
      ...course, 
      id,
      createdAt: timestamp
    };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;

    const updatedCourse: Course = {
      ...existingCourse,
      ...course
    };
    
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    // Delete associated enrollments and grades first
    const courseEnrollments = await this.getEnrollmentsByCourseId(id);
    for (const enrollment of courseEnrollments) {
      await this.deleteEnrollment(enrollment.id);
    }

    const courseGrades = await this.getGradesByCourseId(id);
    for (const grade of courseGrades) {
      await this.deleteGrade(grade.id);
    }

    return this.courses.delete(id);
  }

  async getCourseWithStudents(id: number): Promise<CourseWithStudents | undefined> {
    const course = await this.getCourse(id);
    if (!course) return undefined;

    const courseEnrollments = await this.getEnrollmentsByCourseId(id);
    const courseStudents = await Promise.all(
      courseEnrollments.map(async (enrollment) => {
        const student = await this.getStudent(enrollment.studentId);
        return student ? { 
          id: student.id, 
          studentId: student.studentId, 
          name: student.name 
        } : null;
      })
    );

    const courseGrades = await this.getGradesByCourseId(id);
    const totalScore = courseGrades.reduce((sum, grade) => sum + Number(grade.score), 0);
    const averageGrade = courseGrades.length > 0 ? totalScore / courseGrades.length : 0;

    return {
      ...course,
      students: courseStudents.filter(Boolean) as { id: number; studentId: string; name: string; }[],
      averageGrade: Number(averageGrade.toFixed(1))
    };
  }

  async getCoursesWithStudents(): Promise<CourseWithStudents[]> {
    const courses = await this.getCourses();
    return Promise.all(courses.map(course => this.getCourseWithStudents(course.id) as Promise<CourseWithStudents>));
  }

  // Enrollment operations
  async getEnrollments(): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values());
  }

  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }

  async getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.studentId === studentId);
  }

  async getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.courseId === courseId);
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentCurrentId++;
    const timestamp = new Date();
    const newEnrollment: Enrollment = { 
      ...enrollment, 
      id,
      enrollmentDate: timestamp
    };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async deleteEnrollment(id: number): Promise<boolean> {
    return this.enrollments.delete(id);
  }

  // Grade operations
  async getGrades(): Promise<Grade[]> {
    return Array.from(this.grades.values());
  }

  async getGrade(id: number): Promise<Grade | undefined> {
    return this.grades.get(id);
  }

  async getGradesByStudentId(studentId: number): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(grade => grade.studentId === studentId);
  }

  async getGradesByCourseId(courseId: number): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(grade => grade.courseId === courseId);
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const id = this.gradeCurrentId++;
    const timestamp = new Date();
    const newGrade: Grade = { 
      ...grade, 
      id,
      gradedDate: timestamp
    };
    this.grades.set(id, newGrade);
    return newGrade;
  }

  async updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined> {
    const existingGrade = this.grades.get(id);
    if (!existingGrade) return undefined;

    const updatedGrade: Grade = {
      ...existingGrade,
      ...grade
    };
    
    this.grades.set(id, updatedGrade);
    return updatedGrade;
  }

  async deleteGrade(id: number): Promise<boolean> {
    return this.grades.delete(id);
  }

  async getFullGrades(): Promise<FullGrade[]> {
    const grades = await this.getGrades();
    return Promise.all(grades.map(async (grade) => {
      const student = await this.getStudent(grade.studentId);
      const course = await this.getCourse(grade.courseId);
      
      if (!student || !course) {
        throw new Error(`Grade ${grade.id} has invalid references`);
      }
      
      return {
        ...grade,
        student: {
          id: student.id,
          studentId: student.studentId,
          name: student.name
        },
        course: {
          id: course.id,
          courseId: course.courseId,
          name: course.name
        }
      };
    }));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents();
    const courses = await this.getCourses();
    const grades = await this.getGrades();
    
    // Calculate average grade
    const totalScore = grades.reduce((sum, grade) => sum + Number(grade.score), 0);
    const averageGrade = grades.length > 0 ? totalScore / grades.length : 0;
    
    // Calculate grade distribution
    const gradeDistribution = {
      labels: ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (Below 60%)'],
      data: [0, 0, 0, 0, 0]
    };
    
    grades.forEach(grade => {
      const score = Number(grade.score);
      if (score >= 90) gradeDistribution.data[0]++;
      else if (score >= 80) gradeDistribution.data[1]++;
      else if (score >= 70) gradeDistribution.data[2]++;
      else if (score >= 60) gradeDistribution.data[3]++;
      else gradeDistribution.data[4]++;
    });
    
    // Get top students
    const studentsWithAvg = await this.getStudentsWithCourses();
    const topStudents = [...studentsWithAvg]
      .filter(student => student.averageGrade !== undefined)
      .sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
      .slice(0, 3)
      .map(student => ({
        id: student.id,
        name: student.name,
        averageGrade: student.averageGrade || 0
      }));
    
    // Recent activity (demo data)
    const recentActivity = [
      { 
        type: 'add_student', 
        message: 'New student added: Sarah Johnson', 
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago 
      },
      { 
        type: 'update_grade', 
        message: 'Grade updated: Math 101 for James Wilson', 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago 
      },
      { 
        type: 'complete_course', 
        message: 'Course completed: History 202 by Emma Davis', 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() // 25 hours ago 
      },
      { 
        type: 'attendance_alert', 
        message: 'Low attendance alert: Michael Brown in Physics 301', 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() // 15 days ago 
      }
    ];
    
    return {
      totalStudents: students.length,
      activeCourses: courses.length,
      averageGrade: Number(averageGrade.toFixed(1)),
      pendingGrades: 36, // Demo number for UI
      gradeDistribution,
      recentActivity,
      topStudents
    };
  }
}

export const storage = new MemStorage();
