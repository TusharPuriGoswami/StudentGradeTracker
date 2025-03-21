import { useQuery } from "@tanstack/react-query";
import { StudentWithCourses } from "@shared/schema";

export function useStudents() {
  return useQuery<StudentWithCourses[]>({
    queryKey: ["/api/students"],
  });
}

export function useStudent(id: number) {
  return useQuery<StudentWithCourses>({
    queryKey: ["/api/students", id],
    enabled: !!id,
  });
}
