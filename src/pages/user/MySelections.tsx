import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { FlaskConical, ArrowLeft, Trash2, BookmarkCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const MySelections = () => {
  const { selectedExperiments, selectedIds, toggleSelect } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <PageTransition>
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <BookmarkCheck className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Login karein apne selected experiments dekhne ke liye</p>
            <Button onClick={() => navigate("/login")}>Login</Button>
          </div>
        </PageTransition>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/hands-on-experiments"
              className="text-primary hover:underline flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Experiments
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <BookmarkCheck className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Selections</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {selectedIds.length} experiment{selectedIds.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>

          {selectedExperiments.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <BookmarkCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2 font-medium">Koi experiment select nahi kiya</p>
              <p className="text-sm text-muted-foreground mb-6">
                Experiment library mein jaao aur "+ Select" button dabao
              </p>
              <Link to="/hands-on-experiments">
                <Button>Browse Experiments</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedExperiments.map((exp, idx) => (
                <div key={exp.id}
                  className="flex items-center gap-4 p-4 bg-background border border-border rounded-2xl hover:border-primary/30 transition-all group">

                  {/* Serial */}
                  <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
                    {idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    {exp.thumbnail_url
                      ? <img src={exp.thumbnail_url} alt={exp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <FlaskConical className="h-6 w-6 text-muted-foreground" />
                        </div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/experiment/${exp.id}`}
                      className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block">
                      {exp.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{exp.subject}</span>
                      {exp.class && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {exp.class}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/experiment/${exp.id}`}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="View experiment">
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </Link>
                    <button
                      onClick={() => toggleSelect(exp)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from selection">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length} selected · Refresh karne par bhi saved rahega
                </p>
                <Link to="/hands-on-experiments">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" />
                    More Experiments
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </PageTransition>
    </Layout>
  );
};

export default MySelections;