import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { User, Pencil, Trash2, Eye, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentWithCourses } from "@shared/schema";
import StudentForm from "@/components/StudentForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Students() {
  const { data: students, isLoading } = useStudents();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithCourses | null>(null);
  
  // Filtering and sorting logic
  const filteredStudents = students
    ? students.filter((student) => {
        // Filter by search term
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by course
        const matchesCourse =
          !courseFilter || courseFilter === "all" ||
          student.courses?.some(
            (course) => course.courseId.toLowerCase() === courseFilter.toLowerCase()
          );
        
        // Filter by grade range
        let matchesGrade = true;
        if (gradeFilter && gradeFilter !== "all") {
          const avg = student.averageGrade || 0;
          switch (gradeFilter) {
            case "a":
              matchesGrade = avg >= 90;
              break;
            case "b":
              matchesGrade = avg >= 80 && avg < 90;
              break;
            case "c":
              matchesGrade = avg >= 70 && avg < 80;
              break;
            case "d":
              matchesGrade = avg >= 60 && avg < 70;
              break;
            case "f":
              matchesGrade = avg < 60;
              break;
          }
        }
        
        return matchesSearch && matchesCourse && matchesGrade;
      })
    : [];
  
  const handleViewStudent = (student: StudentWithCourses) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };
  
  const handleEditStudent = (student: StudentWithCourses) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteStudent = (student: StudentWithCourses) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      await apiRequest("DELETE", `/api/students/${selectedStudent.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive"
      });
    }
  };
  
  const exportStudentData = () => {
    if (!students) return;
    
    const csvContent = [
      // CSV Header
      ["ID", "Name", "Email", "Year", "Courses", "Average Grade"].join(","),
      // CSV Data
      ...students.map(student => [
        student.studentId,
        student.name,
        student.email,
        `Year ${student.year}`,
        student.courses?.map(c => c.name).join("; ") || "",
        (student.averageGrade || 0).toFixed(1) + "%"
      ].join(","))
    ].join("\n");
    
    // Create a download link and trigger it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getGradeBadgeColor = (grade?: number) => {
    if (!grade) return "bg-gray-100 text-gray-800";
    if (grade >= 90) return "bg-green-100 text-green-800";
    if (grade >= 80) return "bg-blue-100 text-blue-800";
    if (grade >= 70) return "bg-amber-100 text-amber-800";
    if (grade >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-6">
        <h2 className="text-xl font-bold">Student Management</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={exportStudentData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="MATH101">Mathematics 101</SelectItem>
                  <SelectItem value="ENG201">English 201</SelectItem>
                  <SelectItem value="SCI301">Science 301</SelectItem>
                  <SelectItem value="HIS202">History 202</SelectItem>
                  <SelectItem value="PHY301">Physics 301</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="a">A (90-100%)</SelectItem>
                  <SelectItem value="b">B (80-89%)</SelectItem>
                  <SelectItem value="c">C (70-79%)</SelectItem>
                  <SelectItem value="d">D (60-69%)</SelectItem>
                  <SelectItem value="f">F (Below 60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Avg. Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-12 mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No students found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-2">
                          <AvatarImage src={student.avatarUrl} />
                          <AvatarFallback>
                            {student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">Year {student.year}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.courses?.map((course) => (
                          <Badge key={course.id} variant="outline" className="text-xs">
                            {course.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getGradeBadgeColor(student.averageGrade)}>
                        {student.averageGrade?.toFixed(1) || 'N/A'}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Pencil className="h-4 w-4 text-amber-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <StudentForm 
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm 
              defaultValues={{
                ...selectedStudent,
                courseIds: selectedStudent.courses?.map(c => c.id) || []
              }}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedStudent.avatarUrl} />
                  <AvatarFallback>
                    {selectedStudent.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                <Badge>Year {selectedStudent.year}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-semibold">Student ID:</div>
                <div className="text-sm">{selectedStudent.studentId}</div>
                
                <div className="text-sm font-semibold">Email:</div>
                <div className="text-sm">{selectedStudent.email}</div>
                
                <div className="text-sm font-semibold">Average Grade:</div>
                <div className="text-sm">
                  <Badge className={getGradeBadgeColor(selectedStudent.averageGrade)}>
                    {selectedStudent.averageGrade?.toFixed(1) || 'N/A'}%
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-semibold mb-2">Enrolled Courses:</div>
                {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedStudent.courses.map((course) => (
                      <Badge key={course.id} variant="outline" className="justify-start">
                        {course.name} ({course.courseId})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No courses enrolled</div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleEditStudent(selectedStudent)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleDeleteStudent(selectedStudent);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedStudent?.name}'s record and all associated
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
