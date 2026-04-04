import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { FlaskConical, Trash2, BookmarkCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserSelections = () => {
  const { selectedExperiments, selectedIds, toggleSelect } = useCart();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookmarkCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Selections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedIds.length} experiment{selectedIds.length !== 1 ? "s" : ""} selected</p>
        </div>
      </div>

      {selectedExperiments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2 font-medium">No experiments selected yet</p>
          <p className="text-sm text-muted-foreground mb-6">Browse experiments and click "+ Select" to save them here</p>
          <Link to="/simulations">
            <Button>Browse Experiments</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedExperiments.map((exp: any) => (
            <div key={exp.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
              {exp.thumbnail_url && (
                <img src={exp.thumbnail_url} alt={exp.title} className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{exp.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{exp.subject}</p>
                  </div>
                  <FlaskConical className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Link to={`/experiment/${exp.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      <ExternalLink className="h-3 w-3" /> View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => toggleSelect(exp)}
                    className="text-destructive hover:text-destructive hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSelections;
