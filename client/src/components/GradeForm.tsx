import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGradeSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useStudents } from "@/hooks/use-students";
import { useCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const formSchema = insertGradeSchema.extend({});

type GradeFormValues = z.infer<typeof formSchema>;

interface GradeFormProps {
  defaultValues?: Partial<GradeFormValues> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GradeForm({
  defaultValues,
  onSuccess,
  onCancel
}: GradeFormProps) {
  const { toast } = useToast();
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();
  
  const form = useForm<GradeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 1,
      courseId: 1,
      score: 0,
      term: "Spring 2023",
      ...defaultValues
    }
  });
  
  const isSubmitting = form.formState.isSubmitting;
  
  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);
  
  const onSubmit = async (data: GradeFormValues) => {
    try {
      if (defaultValues?.id) {
        // Update existing grade
        await apiRequest("PUT", `/api/grades/${defaultValues.id}`, data);
        toast({
          title: "Success",
          description: "Grade updated successfully",
        });
      } else {
        // Create new grade
        await apiRequest("POST", "/api/grades", data);
        toast({
          title: "Success",
          description: "Grade created successfully",
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving grade:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save grade",
        variant: "destructive"
      });
    }
  };
  
  if (isLoadingStudents || isLoadingCourses) {
    return <div>Loading...</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value ? field.value.toString() : students && students.length > 0 ? students[0].id.toString() : "1"}
                value={field.value ? field.value.toString() : students && students.length > 0 ? students[0].id.toString() : "1"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value ? field.value.toString() : courses && courses.length > 0 ? courses[0].id.toString() : "1"}
                value={field.value ? field.value.toString() : courses && courses.length > 0 ? courses[0].id.toString() : "1"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.courseId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  max={100}
                  step={0.1}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Grade score from 0 to 100
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Term</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "Spring 2023"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Spring 2023">Spring 2023</SelectItem>
                  <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                  <SelectItem value="Winter 2023">Winter 2023</SelectItem>
                  <SelectItem value="Summer 2023">Summer 2023</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : defaultValues?.id ? "Update Grade" : "Add Grade"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
