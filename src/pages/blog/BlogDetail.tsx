import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
}

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
      });
  }, [slug]);

  return (
    <Layout>
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link to="/blog" className="flex items-center gap-2 text-primary hover:underline text-sm mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : !post ? (
            <div className="text-center py-12 text-muted-foreground">Post not found.</div>
          ) : (
            <article>
              {post.cover_image_url && (
                <img src={post.cover_image_url} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-xl mb-8" />
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                {post.author_name && (
                  <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author_name}</span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString()}</span>
                )}
              </div>
              <div className="prose prose-sm md:prose-base max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
};

export default BlogDetail;
