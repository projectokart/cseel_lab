import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building2, Phone, MapPin, Save, Loader2, CheckCircle2 } from "lucide-react";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const fetchPincodeData = async (pincode: string) => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const json = await res.json();
    if (json?.[0]?.Status === "Success" && json[0].PostOffice?.length > 0) {
      const po = json[0].PostOffice[0];
      return { district: po.District, state: po.State, country: "India" };
    }
  } catch {}
  return null;
};

const OrgSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading]           = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeOk, setPincodeOk]       = useState(false);
  const [orgId, setOrgId]               = useState<string | null>(null);
  const [form, setForm] = useState({
    org_name: "", phone: "", email: "", address: "",
    pincode: "", district: "", state: "", country: "India",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("organisations").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOrgId(data.id);
          setForm({
            org_name: data.org_name || "",
            phone:    data.phone    || "",
            email:    data.email    || user.email || "",
            address:  data.address  || "",
            pincode:  data.pincode  || "",
            district: data.district || "",
            state:    data.state    || "",
            country:  data.country  || "India",
          });
          if (data.district) setPincodeOk(true);
        } else {
          setForm(f => ({ ...f, email: user.email || "" }));
        }
      });
  }, [user]);

  const handlePincodeChange = async (val: string) => {
    setForm(f => ({ ...f, pincode: val, district: "", state: "", country: "India" }));
    setPincodeOk(false);
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      setPincodeLoading(true);
      const data = await fetchPincodeData(val);
      setPincodeLoading(false);
      if (data) {
        setForm(f => ({ ...f, district: data.district, state: data.state, country: data.country }));
        setPincodeOk(true);
      } else {
        toast({ title: "Invalid pincode", variant: "destructive" });
      }
    }
  };

  const handleSave = async () => {
    if (!user || !form.org_name.trim()) {
      toast({ title: "Organisation name required", variant: "destructive" }); return;
    }
    setLoading(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    let error;
    if (orgId) {
      ({ error } = await supabase.from("organisations").update(payload).eq("id", orgId));
    } else {
      const res = await supabase.from("organisations").insert({ ...payload, user_id: user.id }).select("id").single();
      error = res.error;
      if (!error && res.data) setOrgId(res.data.id);
    }
    setLoading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Settings saved!" });
  };

  const inp = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Organisation Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Organisation Profile</CardTitle>
          <CardDescription>Update your school or institution details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>School / Organisation Name *</Label>
            <Input value={form.org_name} onChange={e => setForm(f => ({ ...f, org_name: e.target.value }))} placeholder="e.g. Delhi Public School" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Pin Code</Label>
            <div className="relative">
              <Input
                value={form.pincode}
                onChange={e => handlePincodeChange(e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                inputMode="numeric"
              />
              {pincodeLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
              {pincodeOk && !pincodeLoading && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
            </div>
            {pincodeOk && <p className="text-xs text-green-600">Location auto-filled ✓</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>District</Label>
              <Input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="Auto-filled from pincode" />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <select className={inp} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                <option value="">Select state</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Address</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Street address, building, area..."
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgSettings;
