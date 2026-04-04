import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("is_active", true)
    .order("popularity", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Project;
}

export async function fetchUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("user_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function createUserProject(
  userId: string,
  payload: Partial<Project>
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("user_projects")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function updateUserProject(
  id: string,
  payload: Partial<Project>
): Promise<void> {
  const { error } = await supabase
    .from("user_projects")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteUserProject(id: string): Promise<void> {
  const { error } = await supabase
    .from("user_projects")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
