import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { useCourses } from "@/hooks/use-courses";
import { useGrades } from "@/hooks/use-grades";
import { 
  Download, 
  FileBarChart, 
  FileSpreadsheet, 
  Users, 
  BookOpen 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Grade report with charts and data visualization
export default function Reports() {
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();
  const { data: grades, isLoading: isLoadingGrades } = useGrades();
  
  const [reportType, setReportType] = useState("students");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  
  // Determine available terms
  const terms = grades 
    ? [...new Set(grades.map(grade => grade.term))]
    : [];
  
  // Data processing functions
  const getStudentPerformance = () => {
    if (!students || !grades) return [];
    
    return students.map(student => {
      const studentGrades = grades.filter(g => 
        g.studentId === student.id && 
        (selectedTerm ? g.term === selectedTerm : true)
      );
      
      const avgScore = studentGrades.length 
        ? studentGrades.reduce((sum, g) => sum + Number(g.score), 0) / studentGrades.length 
        : 0;
      
      return {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        year: student.year,
        courseCount: student.courses?.length || 0,
        averageScore: avgScore,
        letter: getLetterGrade(avgScore)
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  };
  
  const getCoursePerformance = () => {
    if (!courses || !grades) return [];
    
    return courses.map(course => {
      const courseGrades = grades.filter(g => 
        g.courseId === course.id && 
        (selectedTerm ? g.term === selectedTerm : true)
      );
      
      const avgScore = courseGrades.length 
        ? courseGrades.reduce((sum, g) => sum + Number(g.score), 0) / courseGrades.length 
        : 0;
      
      const gradeDistribution = {
        A: courseGrades.filter(g => Number(g.score) >= 90).length,
        B: courseGrades.filter(g => Number(g.score) >= 80 && Number(g.score) < 90).length,
        C: courseGrades.filter(g => Number(g.score) >= 70 && Number(g.score) < 80).length,
        D: courseGrades.filter(g => Number(g.score) >= 60 && Number(g.score) < 70).length,
        F: courseGrades.filter(g => Number(g.score) < 60).length
      };
      
      return {
        id: course.id,
        courseId: course.courseId,
        name: course.name,
        credits: course.credits,
        studentCount: course.students?.length || 0,
        averageScore: avgScore,
        gradeDistribution
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  };
  
  const getGradeDistribution = () => {
    if (!grades) return [];
    
    const filteredGrades = grades.filter(g => 
      (selectedCourse ? g.courseId.toString() === selectedCourse : true) && 
      (selectedTerm ? g.term === selectedTerm : true)
    );
    
    const distribution = [
      { name: 'A (90-100%)', count: filteredGrades.filter(g => Number(g.score) >= 90).length },
      { name: 'B (80-89%)', count: filteredGrades.filter(g => Number(g.score) >= 80 && Number(g.score) < 90).length },
      { name: 'C (70-79%)', count: filteredGrades.filter(g => Number(g.score) >= 70 && Number(g.score) < 80).length },
      { name: 'D (60-69%)', count: filteredGrades.filter(g => Number(g.score) >= 60 && Number(g.score) < 70).length },
      { name: 'F (Below 60%)', count: filteredGrades.filter(g => Number(g.score) < 60).length }
    ];
    
    return distribution;
  };
  
  const getScoreComparison = () => {
    if (!courses || !grades) return [];
    
    const filteredCourses = selectedCourse 
      ? courses.filter(c => c.id.toString() === selectedCourse) 
      : courses;
    
    return filteredCourses.map(course => {
      const courseGrades = grades.filter(g => 
        g.courseId === course.id && 
        (selectedTerm ? g.term === selectedTerm : true)
      );
      
      const avgScore = courseGrades.length 
        ? courseGrades.reduce((sum, g) => sum + Number(g.score), 0) / courseGrades.length 
        : 0;
      
      return {
        name: course.name,
        averageScore: Number(avgScore.toFixed(1))
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  // Helper function to get letter grade
  const getLetterGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  
  // Format data for export
  const exportReportData = () => {
    let csvContent = "";
    let filename = "";
    
    if (reportType === "students") {
      const data = getStudentPerformance();
      csvContent = [
        ["Student ID", "Name", "Year", "Course Count", "Average Score", "Grade"].join(","),
        ...data.map(student => [
          student.studentId,
          student.name,
          `Year ${student.year}`,
          student.courseCount,
          student.averageScore.toFixed(1) + "%",
          student.letter
        ].join(","))
      ].join("\n");
      filename = "student-performance-report.csv";
    } 
    else if (reportType === "courses") {
      const data = getCoursePerformance();
      csvContent = [
        ["Course ID", "Name", "Credits", "Student Count", "Average Score", "A Count", "B Count", "C Count", "D Count", "F Count"].join(","),
        ...data.map(course => [
          course.courseId,
          course.name,
          course.credits,
          course.studentCount,
          course.averageScore.toFixed(1) + "%",
          course.gradeDistribution.A,
          course.gradeDistribution.B,
          course.gradeDistribution.C,
          course.gradeDistribution.D,
          course.gradeDistribution.F
        ].join(","))
      ].join("\n");
      filename = "course-performance-report.csv";
    }
    else if (reportType === "distribution") {
      const data = getGradeDistribution();
      csvContent = [
        ["Grade Range", "Count"].join(","),
        ...data.map(item => [
          item.name,
          item.count
        ].join(","))
      ].join("\n");
      filename = "grade-distribution-report.csv";
    }
    else if (reportType === "comparison") {
      const data = getScoreComparison();
      csvContent = [
        ["Course", "Average Score"].join(","),
        ...data.map(item => [
          item.name,
          item.averageScore + "%"
        ].join(","))
      ].join("\n");
      filename = "course-comparison-report.csv";
    }
    
    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Chart colors
  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9e9e9e'];
  const RADIAN = Math.PI / 180;
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  const isLoading = isLoadingStudents || isLoadingCourses || isLoadingGrades;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-6">
          <h2 className="text-xl font-bold">Reports & Analytics</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-6">
        <h2 className="text-xl font-bold">Reports & Analytics</h2>
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={exportReportData}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="students" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Student Performance</span>
            <span className="md:hidden">Students</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Course Performance</span>
            <span className="md:hidden">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <FileBarChart className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Grade Distribution</span>
            <span className="md:hidden">Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Course Comparison</span>
            <span className="md:hidden">Comparison</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Student Performance Report */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Report</CardTitle>
              <CardDescription>
                Comprehensive overview of student academic performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {terms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-center">Courses</TableHead>
                        <TableHead className="text-center">Avg. Score</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentPerformance().map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.studentId}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>Year {student.year}</TableCell>
                          <TableCell className="text-center">{student.courseCount}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {student.averageScore.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={
                                student.letter === 'A' ? 'bg-green-100 text-green-800' : 
                                student.letter === 'B' ? 'bg-blue-100 text-blue-800' : 
                                student.letter === 'C' ? 'bg-amber-100 text-amber-800' : 
                                student.letter === 'D' ? 'bg-orange-100 text-orange-800' : 
                                'bg-red-100 text-red-800'
                              }
                            >
                              {student.letter}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="h-[350px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getStudentPerformance().slice(0, 10)} // Show top 10 students
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 40,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Average Score']} />
                      <Legend />
                      <Bar 
                        dataKey="averageScore" 
                        name="Average Score" 
                        fill="#3f51b5" 
                        barSize={20} 
                        label={{ position: 'right', formatter: (value: any) => `${value.toFixed(1)}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {getStudentPerformance().length} students
              </div>
              <Button variant="outline" size="sm" onClick={exportReportData}>
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Course Performance Report */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Report</CardTitle>
              <CardDescription>
                Analysis of performance across different courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {terms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">Students</TableHead>
                        <TableHead className="text-center">Avg. Score</TableHead>
                        <TableHead className="text-center">Grade Distribution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCoursePerformance().map(course => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.courseId}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell className="text-center">{course.credits}</TableCell>
                          <TableCell className="text-center">{course.studentCount}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {course.averageScore.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1 justify-center">
                              <Badge className="bg-green-100 text-green-800">
                                A: {course.gradeDistribution.A}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800">
                                B: {course.gradeDistribution.B}
                              </Badge>
                              <Badge className="bg-amber-100 text-amber-800">
                                C: {course.gradeDistribution.C}
                              </Badge>
                              <Badge className="bg-orange-100 text-orange-800">
                                D: {course.gradeDistribution.D}
                              </Badge>
                              <Badge className="bg-red-100 text-red-800">
                                F: {course.gradeDistribution.F}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="h-[350px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getCoursePerformance()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 80,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        interval={0}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Average Score']} />
                      <Legend />
                      <Bar 
                        dataKey="averageScore" 
                        name="Average Score" 
                        fill="#2196f3" 
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {getCoursePerformance().length} courses
              </div>
              <Button variant="outline" size="sm" onClick={exportReportData}>
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Grade Distribution Report */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution Report</CardTitle>
              <CardDescription>
                Analysis of grade distribution across all courses or specific course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {terms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getGradeDistribution()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Students']} />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          name="Number of Students" 
                          fill="#4caf50" 
                          barSize={50}
                          label={{ position: 'top', formatter: (value: any) => value }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getGradeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={130}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="name"
                        >
                          {getGradeDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Students']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="rounded-md border mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade Range</TableHead>
                        <TableHead className="text-center">Count</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getGradeDistribution().map((grade, index) => {
                        const total = getGradeDistribution().reduce((sum, g) => sum + g.count, 0);
                        const percentage = total > 0 ? (grade.count / total) * 100 : 0;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <Badge 
                                className={
                                  index === 0 ? 'bg-green-100 text-green-800' : 
                                  index === 1 ? 'bg-blue-100 text-blue-800' : 
                                  index === 2 ? 'bg-amber-100 text-amber-800' : 
                                  index === 3 ? 'bg-orange-100 text-orange-800' : 
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {grade.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{grade.count}</TableCell>
                            <TableCell className="text-center">{percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Total: {getGradeDistribution().reduce((sum, g) => sum + g.count, 0)} grades
              </div>
              <Button variant="outline" size="sm" onClick={exportReportData}>
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Course Comparison Report */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Course Comparison Report</CardTitle>
              <CardDescription>
                Compare average grades across different courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {terms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getScoreComparison()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 80,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        interval={0}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Average Score']} />
                      <Legend />
                      <Bar 
                        dataKey="averageScore" 
                        name="Average Score" 
                        fill="#f50057"
                        label={{ position: 'top', formatter: (value: any) => `${value}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="rounded-md border mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-center">Average Score</TableHead>
                        <TableHead className="text-center">Letter Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getScoreComparison().map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {course.averageScore.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={
                                course.averageScore >= 90 ? 'bg-green-100 text-green-800' : 
                                course.averageScore >= 80 ? 'bg-blue-100 text-blue-800' : 
                                course.averageScore >= 70 ? 'bg-amber-100 text-amber-800' : 
                                course.averageScore >= 60 ? 'bg-orange-100 text-orange-800' : 
                                'bg-red-100 text-red-800'
                              }
                            >
                              {getLetterGrade(course.averageScore)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {getScoreComparison().length} courses
              </div>
              <Button variant="outline" size="sm" onClick={exportReportData}>
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
