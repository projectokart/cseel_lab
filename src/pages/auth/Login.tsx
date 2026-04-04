import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ── Pincode API ───────────────────────────────────────────────────────────────
const fetchPincodeData = async (pincode: string) => {
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const json = await res.json();
    if (json?.[0]?.Status === "Success" && json[0].PostOffice?.length > 0) {
      const po = json[0].PostOffice[0];
      return { district: po.District, state: po.State, country: "India" };
    }
  } catch {}
  return null;
};

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

type Step = "role" | "details" | "credentials";

interface OrgForm {
  org_name: string; phone: string; address: string;
  pincode: string; district: string; state: string; country: string;
}

interface UserForm {
  display_name: string; phone: string;
  institution_id: string; institution_name: string;
}

const ROLES: { value: AppRole; label: string; desc: string; accent: string }[] = [
  { value: "student",      label: "Student",      desc: "Access experiments & assignments",  accent: "border-green-400  bg-green-50"  },
  { value: "teacher",      label: "Teacher",      desc: "Manage classes & assignments",       accent: "border-blue-400   bg-blue-50"   },
  { value: "organisation", label: "Organisation", desc: "Institution / centre management",    accent: "border-purple-400 bg-purple-50" },
];

// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  // Login
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [forgotMode, setForgotMode]     = useState(false);
  const [isSignup, setIsSignup]         = useState(false);

  // Signup
  const [step, setStep]     = useState<Step>("role");
  const [role, setRole]     = useState<AppRole>("student");
  const [orgForm, setOrgForm] = useState<OrgForm>({
    org_name: "", phone: "", address: "", pincode: "", district: "", state: "", country: "India",
  });
  const [userForm, setUserForm] = useState<UserForm>({
    display_name: "", phone: "", institution_id: "", institution_name: "",
  });
  const [signupEmail, setSignupEmail]         = useState("");
  const [signupPassword, setSignupPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pincodeLoading, setPincodeLoading]   = useState(false);
  const [pincodeOk, setPincodeOk]             = useState(false);
  const [organisations, setOrganisations]     = useState<{ id: string; org_name: string; district: string; state: string }[]>([]);
  const [orgSearch, setOrgSearch]             = useState("");

  const { signIn, signUp, resetPassword, user, roles, rolesLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in — go to home page
  // User can navigate to their dashboard from TopBar
  useEffect(() => {
    if (user && !rolesLoading) {
      navigate("/");
    }
  }, [user, rolesLoading, navigate]);

  // Load organisations list when student/teacher reaches details step
  useEffect(() => {
    if ((role === "student" || role === "teacher") && step === "details") {
      supabase
        .from("organisations")
        .select("id, org_name, district, state")
        .order("org_name")
        .then(({ data }) => { if (data) setOrganisations(data); });
    }
  }, [role, step]);

  // Pincode auto-fill
  const handlePincodeChange = async (val: string) => {
    setOrgForm(f => ({ ...f, pincode: val, district: "", state: "", country: "India" }));
    setPincodeOk(false);
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      setPincodeLoading(true);
      const data = await fetchPincodeData(val);
      setPincodeLoading(false);
      if (data) {
        setOrgForm(f => ({ ...f, district: data.district, state: data.state, country: data.country }));
        setPincodeOk(true);
      } else {
        toast({ title: "Invalid pincode", description: "Location data not found", variant: "destructive" });
      }
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast({ title: "Password too short", description: "Min. 6 characters", variant: "destructive" }); return;
    }
    if (signupPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (role === "organisation" && !orgForm.org_name.trim()) {
      toast({ title: "Organisation name required", variant: "destructive" }); return;
    }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, role, {
      displayName:     role === "organisation" ? orgForm.org_name : userForm.display_name,
      institutionName: (role === "student" || role === "teacher") ? userForm.institution_name || undefined : undefined,
      organisation:    role === "organisation" ? orgForm : undefined,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Check your email to verify your account." });
      setIsSignup(false); setStep("role");
    }
  };

  // ── Forgot ─────────────────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Reset link sent!" }); setForgotMode(false); }
  };

  const filteredOrgs = organisations.filter(o =>
    o.org_name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    (o.district || "").toLowerCase().includes(orgSearch.toLowerCase())
  );

  const selectSel = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <motion.div
        className="hidden lg:flex lg:w-[42%] about-hero-gradient items-center justify-center p-12"
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <img src="/images/logo.png" alt="CSEEL" className="h-20 w-20 mx-auto mb-6 brightness-200" />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">C.S.E.E.L</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">Center for Scientific Exploration and Experiential Learning</p>
        </div>
      </motion.div>

      {/* Right */}
      <motion.div
        className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto"
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src="/images/logo.png" alt="CSEEL" className="h-9 w-9" />
            <span className="text-lg font-bold text-primary">C.S.E.E.L</span>
          </div>

          {/* ── FORGOT PASSWORD ──────────────────────────────────────────── */}
          {forgotMode && (
            <div>
              <button onClick={() => setForgotMode(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>
              <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
              <p className="text-muted-foreground text-sm mb-6">We'll send a reset link to your email</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}</Button>
              </form>
            </div>
          )}

          {/* ── LOGIN ────────────────────────────────────────────────────── */}
          {!forgotMode && !isSignup && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
              <p className="text-muted-foreground text-sm mb-6">Sign in to your CSEEL account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Password</Label>
                    <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-primary hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <button onClick={() => { setIsSignup(true); setStep("role"); }} className="text-primary font-medium hover:underline">Sign up</button>
              </p>
            </div>
          )}

          {/* ── SIGNUP MULTI-STEP ─────────────────────────────────────────── */}
          {!forgotMode && isSignup && (
            <div>
              {/* Back button */}
              <button
                onClick={() => {
                  if (step === "role")        setIsSignup(false);
                  else if (step === "details") setStep("role");
                  else                         setStep("details");
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === "role" ? "Back to login" : "Back"}
              </button>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                {(["role", "details", "credentials"] as Step[]).map((s, i) => {
                  const current = ["role", "details", "credentials"].indexOf(step);
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s ? "bg-primary text-primary-foreground" :
                        current > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>{i + 1}</div>
                      {i < 2 && <div className={`h-0.5 w-8 transition-all ${current > i ? "bg-primary/40" : "bg-muted"}`} />}
                    </div>
                  );
                })}
                <span className="ml-2 text-xs text-muted-foreground">
                  {step === "role" ? "Choose role" : step === "details" ? "Your details" : "Set credentials"}
                </span>
              </div>

              {/* ── STEP 1: Role ──────────────────────────────────────────── */}
              {step === "role" && (
                <div>
                  <h2 className="text-2xl font-bold mb-1">Create account</h2>
                  <p className="text-muted-foreground text-sm mb-6">Who are you joining as?</p>
                  <div className="space-y-3">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${role === r.value ? r.accent + " border-current" : "border-border hover:border-primary/40"}`}
                      >
                        <p className="font-semibold text-foreground">{r.label}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full mt-6" onClick={() => setStep("details")}>Continue →</Button>
                </div>
              )}

              {/* ── STEP 2: Details ───────────────────────────────────────── */}
              {step === "details" && (
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {role === "organisation" ? "Organisation Details" : "Your Details"}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {role === "organisation"
                      ? "Tell us about your organisation"
                      : "Basic information for your profile"}
                  </p>

                  {/* Organisation form */}
                  {role === "organisation" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Organisation Name *</Label>
                        <Input
                          value={orgForm.org_name}
                          onChange={e => setOrgForm(f => ({ ...f, org_name: e.target.value }))}
                          placeholder="e.g. CSEEL Centre, Bhubaneswar"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input value={orgForm.phone} onChange={e => setOrgForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" type="tel" />
                      </div>
                      <div className="space-y-2">
                        <Label>Pin Code *</Label>
                        <div className="relative">
                          <Input
                            value={orgForm.pincode}
                            onChange={e => handlePincodeChange(e.target.value)}
                            placeholder="Enter 6-digit pin code"
                            maxLength={6}
                            inputMode="numeric"
                          />
                          {pincodeLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                          {pincodeOk && !pincodeLoading && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                        </div>
                        {pincodeOk && <p className="text-xs text-green-600">District & state auto-filled ✓</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>District</Label>
                          <Input value={orgForm.district} onChange={e => setOrgForm(f => ({ ...f, district: e.target.value }))} placeholder="Auto-filled" />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <select className={selectSel} value={orgForm.state} onChange={e => setOrgForm(f => ({ ...f, state: e.target.value }))}>
                            <option value="">Select state</option>
                            {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Input value={orgForm.country} onChange={e => setOrgForm(f => ({ ...f, country: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Full Address *</Label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          value={orgForm.address}
                          onChange={e => setOrgForm(f => ({ ...f, address: e.target.value }))}
                          placeholder="Building, street, area..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Student / Teacher form */}
                  {(role === "student" || role === "teacher") && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input value={userForm.display_name} onChange={e => setUserForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone (optional)</Label>
                        <Input value={userForm.phone} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 ..." type="tel" />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {role === "student" ? "My Organisation" : "Organisation I work at"}
                        </Label>
                        <p className="text-xs text-muted-foreground">Select from registered organisations (optional)</p>
                        <Input
                          placeholder="Search by name or district..."
                          value={orgSearch}
                          onChange={e => {
                            setOrgSearch(e.target.value);
                            if (!e.target.value) setUserForm(f => ({ ...f, institution_id: "", institution_name: "" }));
                          }}
                        />
                        {orgSearch && !userForm.institution_id && filteredOrgs.length > 0 && (
                          <div className="border border-border rounded-lg overflow-hidden max-h-44 overflow-y-auto bg-background shadow-sm">
                            {filteredOrgs.map(o => (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => {
                                  setUserForm(f => ({ ...f, institution_id: o.id, institution_name: o.org_name }));
                                  setOrgSearch(o.org_name);
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm border-b border-border last:border-0 transition-colors"
                              >
                                <p className="font-medium text-foreground">{o.org_name}</p>
                                <p className="text-xs text-muted-foreground">{[o.district, o.state].filter(Boolean).join(", ")}</p>
                              </button>
                            ))}
                          </div>
                        )}
                        {orgSearch && !userForm.institution_id && filteredOrgs.length === 0 && (
                          <p className="text-xs text-muted-foreground px-1">No organisations found — you can skip this</p>
                        )}
                        {userForm.institution_id && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span className="flex-1 truncate">{userForm.institution_name}</span>
                            <button
                              type="button"
                              onClick={() => { setUserForm(f => ({ ...f, institution_id: "", institution_name: "" })); setOrgSearch(""); }}
                              className="text-muted-foreground hover:text-destructive text-xs shrink-0"
                            >Remove</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-6"
                    onClick={() => {
                      if (role === "organisation" && !orgForm.org_name.trim()) {
                        toast({ title: "Organisation name required", variant: "destructive" }); return;
                      }
                      if ((role === "student" || role === "teacher") && !userForm.display_name.trim()) {
                        toast({ title: "Full name is required", variant: "destructive" }); return;
                      }
                      setStep("credentials");
                    }}
                  >
                    Continue →
                  </Button>
                </div>
              )}

              {/* ── STEP 3: Credentials ───────────────────────────────────── */}
              {step === "credentials" && (
                <div>
                  <h2 className="text-2xl font-bold mb-1">Set credentials</h2>
                  <p className="text-muted-foreground text-sm mb-6">Email and password for your account</p>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required autoFocus placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <div className="relative">
                        <Input type={showPwd ? "text" : "password"} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required placeholder="Min. 6 characters" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPwd(v => !v)}>
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <Input type={showPwd ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat password" />
                      {confirmPassword && signupPassword !== confirmPassword && (
                        <p className="text-xs text-destructive">Passwords don't match</p>
                      )}
                    </div>

                    {/* Summary card */}
                    <div className="bg-muted/50 border border-border rounded-xl p-3 text-xs space-y-1">
                      <p className="font-semibold text-foreground text-sm mb-1">Account summary</p>
                      <p>Role: <span className="font-medium text-foreground capitalize">{role}</span></p>
                      {role === "organisation" && <p>Organisation: <span className="font-medium text-foreground">{orgForm.org_name}</span></p>}
                      {role === "organisation" && orgForm.district && <p>Location: {orgForm.district}, {orgForm.state} — {orgForm.pincode}</p>}
                      {(role === "student" || role === "teacher") && <p>Name: <span className="font-medium text-foreground">{userForm.display_name}</span></p>}
                      {userForm.institution_name && <p>Organisation: <span className="font-medium text-foreground">{userForm.institution_name}</span></p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating account…</> : "Create Account"}
                    </Button>
                  </form>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <button onClick={() => { setIsSignup(false); setStep("role"); }} className="text-primary font-medium hover:underline">Sign in</button>
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
