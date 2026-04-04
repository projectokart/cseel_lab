import { supabase } from "@/integrations/supabase/client";
import type { LabMaterial } from "@/types";

export async function fetchLabMaterials(): Promise<LabMaterial[]> {
  const { data, error } = await supabase
    .from("lab_materials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LabMaterial[];
}

export async function fetchLabMaterialById(id: string): Promise<LabMaterial | null> {
  const { data, error } = await supabase
    .from("lab_materials")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as LabMaterial;
}
