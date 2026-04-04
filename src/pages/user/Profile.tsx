import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Building, Phone, MapPin } from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";

const Profile = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    phone: "",
    institution: "",
    city: "",
  });

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile({
              display_name: data.display_name || "",
              phone: data.phone || "",
              institution: data.institution || "",
              city: data.city || "",
            });
          }
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        phone: profile.phone,
        institution: profile.institution,
        city: profile.city,
      })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully!" });
    }
  };

  const initials = (profile.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <Layout>
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile.display_name || "User"}</CardTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary font-semibold capitalize mt-1">
                  {roles[0] || "user"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Display Name</Label>
                <Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Building className="h-4 w-4" /> Institution</Label>
                <Input value={profile.institution} onChange={(e) => setProfile({ ...profile, institution: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> City</Label>
                <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Profile;
