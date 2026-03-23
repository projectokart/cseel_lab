import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const StudentExperiments = () => {
  const [experiments, setExperiments] = useState<any[]>([]);

  useEffect(() => {
    const fetchExperiments = async () => {
      const { data } = await supabase.from("experiments").select("*").eq("is_active", true).order("title");
      if (data) setExperiments(data);
    };
    fetchExperiments();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Experiments Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((exp) => (
          <Card key={exp.id} className="hover:shadow-lg transition-shadow">
            {exp.thumbnail_url && (
              <img src={exp.thumbnail_url} alt={exp.title} className="w-full h-40 object-cover rounded-t-lg" />
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{exp.title}</CardTitle>
                <Badge variant="secondary">{exp.subject}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{exp.description || "No description"}</p>
              {exp.difficulty && (
                <Badge variant="outline" className="mt-2 capitalize">{exp.difficulty}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
        {experiments.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No experiments available yet</p>}
      </div>
    </div>
  );
};

export default StudentExperiments;
