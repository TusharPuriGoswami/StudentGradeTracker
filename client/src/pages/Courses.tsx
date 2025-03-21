import { useState } from "react";
import { useCourses } from "@/hooks/use-courses";
import { Search, Pencil, Trash2, Eye, Plus, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseWithStudents } from "@shared/schema";
import CourseForm from "@/components/CourseForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Courses() {
  const { data: courses, isLoading } = useCourses();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithStudents | null>(null);
  
  // Filtering logic
  const filteredCourses = courses
    ? courses.filter((course) => {
        return (
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];
  
  const handleViewCourse = (course: CourseWithStudents) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };
  
  const handleEditCourse = (course: CourseWithStudents) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteCourse = (course: CourseWithStudents) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      await apiRequest("DELETE", `/api/courses/${selectedCourse.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    }
  };
  
  const exportCourseData = () => {
    if (!courses) return;
    
    const csvContent = [
      // CSV Header
      ["Course ID", "Name", "Description", "Credits", "Student Count", "Average Grade"].join(","),
      // CSV Data
      ...courses.map(course => [
        course.courseId,
        course.name,
        course.description ? course.description.replace(/,/g, ";") : "",
        course.credits,
        course.students?.length || 0,
        (course.averageGrade || 0).toFixed(1) + "%"
      ].join(","))
    ].join("\n");
    
    // Create a download link and trigger it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "courses.csv");
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
        <h2 className="text-xl font-bold">Course Management</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={exportCourseData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      {/* Courses Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Students</TableHead>
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
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No courses found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.courseId}</TableCell>
                    <TableCell>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {course.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {course.students?.length || 0} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getGradeBadgeColor(course.averageGrade)}>
                        {course.averageGrade?.toFixed(1) || 'N/A'}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Pencil className="h-4 w-4 text-amber-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourse(course)}
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
      
      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <CourseForm 
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <CourseForm 
              defaultValues={selectedCourse}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCourse.name}</h3>
                  <div className="text-sm text-muted-foreground">{selectedCourse.courseId}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-semibold">Credits:</div>
                <div className="text-sm">{selectedCourse.credits}</div>
                
                <div className="text-sm font-semibold">Students Enrolled:</div>
                <div className="text-sm">{selectedCourse.students?.length || 0}</div>
                
                <div className="text-sm font-semibold">Average Grade:</div>
                <div className="text-sm">
                  <Badge className={getGradeBadgeColor(selectedCourse.averageGrade)}>
                    {selectedCourse.averageGrade?.toFixed(1) || 'N/A'}%
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-semibold mb-1">Description:</div>
                <div className="text-sm border rounded-md p-2 bg-gray-50 min-h-[80px]">
                  {selectedCourse.description || "No description provided."}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-semibold mb-2">Enrolled Students:</div>
                {selectedCourse.students && selectedCourse.students.length > 0 ? (
                  <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
                    {selectedCourse.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span className="text-sm">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.studentId}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No students enrolled</div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleEditCourse(selectedCourse)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleDeleteCourse(selectedCourse);
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
              This will permanently delete the course "{selectedCourse?.name}" and all associated
              grade data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCourse}
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
