import { supabase } from "@/integrations/supabase/client";
import type { Experiment, ExperimentBasic } from "@/types";

export async function fetchExperiments(): Promise<ExperimentBasic[]> {
  const { data, error } = await supabase
    .from("experiments")
    .select("id,title,subject,class,thumbnail_url,popularity,created_at")
    .eq("is_active", true)
    .order("popularity", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExperimentBasic[];
}

export async function fetchExperimentById(id: string): Promise<Experiment | null> {
  const { data, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Experiment;
}

export async function fetchExperimentsBySubject(subject: string): Promise<ExperimentBasic[]> {
  const { data, error } = await supabase
    .from("experiments")
    .select("id,title,subject,class,thumbnail_url,popularity,created_at")
    .eq("is_active", true)
    .eq("subject", subject)
    .order("popularity", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExperimentBasic[];
}

export async function updateExperimentPopularity(id: string, popularity: number): Promise<void> {
  await supabase.from("experiments").update({ popularity }).eq("id", id);
}
