import { useQuery } from "@tanstack/react-query";
import { fetchBlogPosts, fetchBlogPostBySlug } from "@/services/blogService";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
    staleTime: 1000 * 60 * 10,
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}
