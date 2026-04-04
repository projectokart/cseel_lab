import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchProjectById,
  fetchUserProjects,
  createUserProject,
  updateUserProject,
  deleteUserProject,
} from "@/services/projectService";
import type { Project } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProjectById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUserProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-projects", userId],
    queryFn: () => fetchUserProjects(userId!),
    enabled: !!userId,
  });
}

export function useCreateProject(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Project>) => createUserProject(userId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-projects", userId] }),
  });
}

export function useUpdateProject(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Project> }) =>
      updateUserProject(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-projects", userId] }),
  });
}

export function useDeleteProject(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-projects", userId] }),
  });
}
