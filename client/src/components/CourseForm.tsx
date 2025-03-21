import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCourseSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const formSchema = insertCourseSchema.extend({});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  defaultValues?: Partial<CourseFormValues> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CourseForm({
  defaultValues,
  onSuccess,
  onCancel
}: CourseFormProps) {
  const { toast } = useToast();
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      name: "",
      description: "",
      credits: 3,
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
  
  const onSubmit = async (data: CourseFormValues) => {
    try {
      if (defaultValues?.id) {
        // Update existing course
        await apiRequest("PUT", `/api/courses/${defaultValues.id}`, data);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        // Create new course
        await apiRequest("POST", "/api/courses", data);
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save course",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course ID</FormLabel>
              <FormControl>
                <Input placeholder="MATH101" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for the course
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
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input placeholder="Mathematics 101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Course description..." 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credits</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={6}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Number of credits for this course (1-6)
              </FormDescription>
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
            {isSubmitting ? "Saving..." : defaultValues?.id ? "Update Course" : "Add Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
