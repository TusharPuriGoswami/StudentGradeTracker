import { useState } from "react";
import { useGrades } from "@/hooks/use-grades";
import { useCourses } from "@/hooks/use-courses";
import { useStudents } from "@/hooks/use-students";
import { 
  Search, 
  Pencil, 
  Trash2, 
  Plus, 
  Download, 
  SlidersHorizontal, 
  FileSpreadsheet 
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FullGrade } from "@shared/schema";
import GradeForm from "@/components/GradeForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Grades() {
  const { data: grades, isLoading } = useGrades();
  const { data: students } = useStudents();
  const { data: courses } = useCourses();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<FullGrade | null>(null);
  
  // Filtering logic
  const filteredGrades = grades
    ? grades.filter((grade) => {
        // Filter by search term
        const matchesSearch =
          grade.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grade.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grade.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grade.course.courseId.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by student
        const matchesStudent = !studentFilter || grade.studentId.toString() === studentFilter;
        
        // Filter by course
        const matchesCourse = !courseFilter || grade.courseId.toString() === courseFilter;
        
        // Filter by term
        const matchesTerm = !termFilter || grade.term === termFilter;
        
        return matchesSearch && matchesStudent && matchesCourse && matchesTerm;
      })
    : [];
  
  const handleEditGrade = (grade: FullGrade) => {
    setSelectedGrade(grade);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteGrade = (grade: FullGrade) => {
    setSelectedGrade(grade);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteGrade = async () => {
    if (!selectedGrade) return;
    
    try {
      await apiRequest("DELETE", `/api/grades/${selectedGrade.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Success",
        description: "Grade deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grade",
        variant: "destructive"
      });
    }
  };
  
  const exportGradeData = () => {
    if (!grades) return;
    
    const csvContent = [
      // CSV Header
      ["Student ID", "Student Name", "Course ID", "Course Name", "Score", "Term", "Graded Date"].join(","),
      // CSV Data
      ...grades.map(grade => [
        grade.student.studentId,
        grade.student.name,
        grade.course.courseId,
        grade.course.name,
        grade.score,
        grade.term,
        new Date(grade.gradedDate).toLocaleDateString()
      ].join(","))
    ].join("\n");
    
    // Create a download link and trigger it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "grades.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 70) return "bg-amber-100 text-amber-800";
    if (score >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  const getLetterGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  
  // Get unique terms for filter
  const uniqueTerms = grades 
    ? [...new Set(grades.map(grade => grade.term))]
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-6">
        <h2 className="text-xl font-bold">Grade Management</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Grade
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={exportGradeData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-full md:w-1/2">
                <Input
                  type="text"
                  placeholder="Search grades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Students</SelectItem>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.studentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courses</SelectItem>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.courseId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={termFilter} onValueChange={setTermFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Terms</SelectItem>
                      {uniqueTerms.map(term => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Grades Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Graded Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredGrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No grades found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <div className="font-medium">{grade.student.name}</div>
                      <div className="text-xs text-muted-foreground">{grade.student.studentId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{grade.course.name}</div>
                      <div className="text-xs text-muted-foreground">{grade.course.courseId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreBadgeColor(Number(grade.score))}>
                        {Number(grade.score).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getLetterGrade(Number(grade.score))}
                      </Badge>
                    </TableCell>
                    <TableCell>{grade.term}</TableCell>
                    <TableCell>
                      {new Date(grade.gradedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGrade(grade)}
                        >
                          <Pencil className="h-4 w-4 text-amber-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGrade(grade)}
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
      
      {/* Grade Statistics */}
      {filteredGrades.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="stats">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Grade Statistics
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-2">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Average Score</div>
                      <div className="text-2xl font-bold">
                        {(filteredGrades.reduce((sum, grade) => sum + Number(grade.score), 0) / filteredGrades.length).toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Highest Score</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.max(...filteredGrades.map(grade => Number(grade.score))).toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Lowest Score</div>
                      <div className="text-2xl font-bold text-red-600">
                        {Math.min(...filteredGrades.map(grade => Number(grade.score))).toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Grades</div>
                      <div className="text-2xl font-bold">
                        {filteredGrades.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    {['A', 'B', 'C', 'D', 'F'].map((letter, index) => {
                      const min = index === 0 ? 90 : index === 1 ? 80 : index === 2 ? 70 : index === 3 ? 60 : 0;
                      const max = index === 0 ? 100 : index === 1 ? 89.9 : index === 2 ? 79.9 : index === 3 ? 69.9 : 59.9;
                      const count = filteredGrades.filter(grade => 
                        Number(grade.score) >= min && Number(grade.score) <= max
                      ).length;
                      const percentage = (count / filteredGrades.length) * 100;
                      
                      return (
                        <div key={letter} className="flex flex-col items-center p-2 border rounded-md">
                          <div className={`text-lg font-bold ${
                            index === 0 ? 'text-green-600' : 
                            index === 1 ? 'text-blue-600' : 
                            index === 2 ? 'text-amber-600' : 
                            index === 3 ? 'text-orange-600' : 
                            'text-red-600'
                          }`}>
                            {letter}
                          </div>
                          <div className="text-sm">
                            {count} Students
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
      
      {/* Add Grade Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Grade</DialogTitle>
          </DialogHeader>
          <GradeForm 
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Grade Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
          </DialogHeader>
          {selectedGrade && (
            <GradeForm 
              defaultValues={selectedGrade}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the grade record for {selectedGrade?.student.name} in {selectedGrade?.course.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGrade}
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
