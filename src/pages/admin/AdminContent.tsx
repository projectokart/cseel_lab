import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const sections = [
  { key: "hero", label: "Hero Section", fields: ["title", "subtitle", "description", "cta_text", "cta_link"] },
  { key: "stats", label: "Statistics", fields: ["stat1_value", "stat1_label", "stat2_value", "stat2_label", "stat3_label"] },
  { key: "metrics", label: "Key Metrics", fields: ["metric1_value", "metric1_label", "metric2_value", "metric2_label", "metric3_value", "metric3_label"] },
];

const AdminContent = () => {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from("homepage_content").select("*");
      if (data) {
        const mapped: Record<string, Record<string, string>> = {};
        data.forEach((d) => { mapped[d.section_key] = (d.content as Record<string, string>) || {}; });
        setContent(mapped);
      }
    };
    fetchContent();
  }, []);

  const updateField = (section: string, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const saveSection = async (sectionKey: string) => {
    const existing = await supabase.from("homepage_content").select("id").eq("section_key", sectionKey).maybeSingle();
    if (existing.data) {
      await supabase.from("homepage_content").update({ content: content[sectionKey] as any }).eq("section_key", sectionKey);
    } else {
      await supabase.from("homepage_content").insert({ section_key: sectionKey, content: content[sectionKey] as any });
    }
    toast({ title: "Saved", description: `${sectionKey} section updated` });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Homepage Content</h1>
      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{section.label}</CardTitle>
              <Button size="sm" onClick={() => saveSection(section.key)}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="capitalize">{field.replace(/_/g, " ")}</Label>
                    {field === "description" ? (
                      <Textarea
                        value={content[section.key]?.[field] || ""}
                        onChange={(e) => updateField(section.key, field, e.target.value)}
                      />
                    ) : (
                      <Input
                        value={content[section.key]?.[field] || ""}
                        onChange={(e) => updateField(section.key, field, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminContent;
