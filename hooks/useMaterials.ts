import { useQuery } from "@tanstack/react-query";
import { fetchLabMaterials, fetchLabMaterialById } from "@/services/materialService";

export function useLabMaterials() {
  return useQuery({
    queryKey: ["lab-materials"],
    queryFn: fetchLabMaterials,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLabMaterial(id: string | undefined) {
  return useQuery({
    queryKey: ["lab-material", id],
    queryFn: () => fetchLabMaterialById(id!),
    enabled: !!id,
  });
}
