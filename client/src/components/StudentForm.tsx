import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStudentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
// No LoadingButton is needed since we're using the standard Button
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const formSchema = insertStudentSchema.extend({
  courseIds: z.array(z.number()).optional()
});

type StudentFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StudentForm({
  defaultValues,
  onSuccess,
  onCancel
}: StudentFormProps) {
  const { toast } = useToast();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      name: "",
      email: "",
      year: 1,
      courseIds: [],
      ...defaultValues
    }
  });
  
  const isSubmitting = form.formState.isSubmitting;
  
  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        studentId: defaultValues.studentId || "",
        name: defaultValues.name || "",
        email: defaultValues.email || "",
        year: defaultValues.year || 1,
        courseIds: defaultValues.courseIds || [],
        ...defaultValues
      });
    }
  }, [defaultValues, form]);
  
  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (defaultValues?.id) {
        // Update existing student
        await apiRequest("PUT", `/api/students/${defaultValues.id}`, data);
        
        // Create enrollments for new courses if needed
        if (data.courseIds && data.courseIds.length > 0) {
          for (const courseId of data.courseIds) {
            try {
              await apiRequest("POST", "/api/enrollments", {
                studentId: defaultValues.id,
                courseId: courseId
              });
            } catch (error) {
              // Skip if enrollment already exists
              console.log("Enrollment error:", error);
            }
          }
        }
        
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        // Create new student
        const result = await apiRequest("POST", "/api/students", {
          studentId: data.studentId,
          name: data.name,
          email: data.email,
          year: data.year,
          avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        });
        
        const studentResponse = await result.json();
        
        // Create enrollments if needed
        if (data.courseIds && data.courseIds.length > 0) {
          for (const courseId of data.courseIds) {
            await apiRequest("POST", "/api/enrollments", {
              studentId: studentResponse.id,
              courseId: courseId
            });
          }
        }
        
        toast({
          title: "Success",
          description: "Student created successfully",
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save student",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student ID</FormLabel>
              <FormControl>
                <Input placeholder="S1001" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for the student
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value ? field.value.toString() : "1"}
                value={field.value ? field.value.toString() : "1"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="courseIds"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Courses</FormLabel>
                <FormDescription>
                  Select the courses for this student
                </FormDescription>
              </div>
              {isLoadingCourses ? (
                <div>Loading courses...</div>
              ) : (
                <div className="flex flex-col space-y-2">
                  {courses?.map((course) => (
                    <FormField
                      key={course.id}
                      control={form.control}
                      name="courseIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={course.id}
                            className="flex flex-row items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(course.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), course.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== course.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {course.name} ({course.courseId})
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              )}
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
            {isSubmitting ? "Saving..." : defaultValues?.id ? "Update Student" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
