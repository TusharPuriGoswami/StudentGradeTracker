import { useQuery } from "@tanstack/react-query";
import { CourseWithStudents } from "@shared/schema";

export function useCourses() {
  return useQuery<CourseWithStudents[]>({
    queryKey: ["/api/courses"],
  });
}

export function useCourse(id: number) {
  return useQuery<CourseWithStudents>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });
}
