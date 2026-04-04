import { useQuery } from "@tanstack/react-query";
import { fetchExperiments, fetchExperimentById } from "@/services/experimentService";

export function useExperiments() {
  return useQuery({
    queryKey: ["experiments"],
    queryFn: fetchExperiments,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExperiment(id: string | undefined) {
  return useQuery({
    queryKey: ["experiment", id],
    queryFn: () => fetchExperimentById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
