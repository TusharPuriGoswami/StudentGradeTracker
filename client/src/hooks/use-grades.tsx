import { useQuery } from "@tanstack/react-query";
import { FullGrade, DashboardStats } from "@shared/schema";

export function useGrades() {
  return useQuery<FullGrade[]>({
    queryKey: ["/api/grades"],
  });
}

export function useGrade(id: number) {
  return useQuery<FullGrade>({
    queryKey: ["/api/grades", id],
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
}
