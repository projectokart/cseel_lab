import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";

import PageTransition from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  is_featured: boolean | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, cover_image_url, author_name, published_at, is_featured"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPost[]) || []);
        setLoading(false);
      });
  }, []);

  const featured = posts.filter((p) => p.is_featured);
  const regular = posts.filter((p) => !p.is_featured);

  return (
    <Layout>
      <PageTransition>
      <SEOHead
        title="Science Education Blog | Tips, Experiments & STEM News India | CSEEL"
        description="Read the CSEEL blog for science education tips, experiment ideas, STEM news, and teacher resources. Helping educators and students across India stay inspired."
        keywords="science education blog India, STEM blog India, science experiments blog, science teacher resources India, science news India"
        canonical="https://www.cseel.org/blog"
      />

        {/* HERO */}
        <section className="relative py-24 text-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Blog
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Discover insights, experiments, robotics ideas and learning
              resources from the CSEEL community.
            </p>
          </div>
        </section>

        {/* BLOG LIST */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">

            {loading ? (
              <div className="text-center py-20 text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No blog posts yet. Check back soon!
              </div>
            ) : (
              <>
                {/* FEATURED */}
                {featured.length > 0 && (
                  <div className="mb-16">

                    <h2 className="text-3xl font-bold mb-8">
                      Featured Articles
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                      {featured.map((post) => (
                        <BlogCard key={post.id} post={post} featured />
                      ))}
                    </div>
                  </div>
                )}

                {/* REGULAR POSTS */}
                <div>
                  <h2 className="text-2xl font-semibold mb-8">
                    Latest Posts
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regular.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

const BlogCard = ({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) => (
  <Link to={`/blog/${post.slug}`}>

    <Card
      className={`
      group overflow-hidden transition-all duration-300
      hover:-translate-y-1 hover:shadow-2xl
      ${featured ? "h-[420px]" : ""}
    `}
    >

      {/* IMAGE */}
      {post.cover_image_url && (
        <div className="overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className={`w-full object-cover transition-transform duration-500 group-hover:scale-110
            ${featured ? "h-60" : "h-48"}
            `}
          />
        </div>
      )}

      <CardContent className="p-6">

        {post.is_featured && (
          <Badge className="mb-3 bg-primary text-white">
            Featured
          </Badge>
        )}

        {/* TITLE */}
        <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* EXCERPT */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* META */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">

          <Calendar className="h-3 w-3" />

          {post.published_at
            ? new Date(post.published_at).toLocaleDateString()
            : "Draft"}

          {post.author_name && (
            <span>• {post.author_name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default Blog;
