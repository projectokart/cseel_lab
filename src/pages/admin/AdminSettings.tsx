import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Setting {
  id: string;
  key: string;
  value: boolean;
  label: string;
}

const GROUPS = [
  {
    title: "Experiment Page — Lab Materials Table",
    keys: [
      "show_material_price",
      "show_material_stock",
      "show_material_warning",
      "show_material_safety",
      "show_material_add_to_cart",
    ],
  },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("admin_settings")
        .select("id, key, value, label")
        .order("key");
      if (error) throw error;
      setSettings(data || []);
    } catch (err: any) {
      toast({ title: "Load failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const toggle = (key: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: !s.value } : s));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const s of settings) {
        const { error } = await (supabase as any)
          .from("admin_settings")
          .update({ value: s.value })
          .eq("id", s.id);
        if (error) throw error;
      }
      toast({ title: "Settings saved ✓" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (key: string) => settings.find(s => s.key === key);

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Website pe kya show/hide ho — yahan se control karo</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {GROUPS.map(group => (
            <Card key={group.title}>
              <CardContent className="p-0">
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">{group.title}</p>
                </div>
                <div className="divide-y divide-border">
                  {group.keys.map(key => {
                    const s = getSetting(key);
                    if (!s) return null;
                    return (
                      <div key={key} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.label}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{s.key}</p>
                        </div>
                        <button
                          onClick={() => toggle(key)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            s.value
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {s.value
                            ? <><Eye className="h-3.5 w-3.5" /> Visible</>
                            : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;