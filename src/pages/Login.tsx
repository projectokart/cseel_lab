import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { signIn, signUp, resetPassword, user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && roles.length > 0) {
      if (roles.includes("admin")) navigate("/admin");
      else if (roles.includes("teacher")) navigate("/teacher");
      else if (roles.includes("student")) navigate("/student");
      else navigate("/");
    }
  }, [user, roles, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      // useEffect will handle role-based redirect
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, role, displayName);
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent", description: "Check your email for the reset link" });
      setForgotMode(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <motion.div className="hidden lg:flex lg:w-1/2 about-hero-gradient items-center justify-center p-12" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="text-center">
          <img src="/images/logo.png" alt="CSEEL" className="h-20 w-20 mx-auto mb-6 brightness-200" />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">C.S.E.E.L</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">Center for Scientific Exploration and Experiential Learning</p>
        </div>
      </motion.div>
      <motion.div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/images/logo.png" alt="CSEEL" className="h-10 w-10" />
            <span className="text-xl font-bold text-primary">C.S.E.E.L</span>
          </div>
          {forgotMode ? (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
                <button type="button" onClick={() => setForgotMode(false)} className="text-sm text-primary hover:underline">Back to login</button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6"><TabsTrigger value="login">Login</TabsTrigger><TabsTrigger value="signup">Sign Up</TabsTrigger></TabsList>
              <TabsContent value="login">
                <h2 className="text-2xl font-bold text-foreground mb-6">Welcome Back</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                  <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-primary hover:underline">Forgot password?</button>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <h2 className="text-2xl font-bold text-foreground mb-6">Create Account</h2>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2"><Label>Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>I am a</Label><div className="flex gap-2"><Button type="button" variant={role === "teacher" ? "default" : "outline"} className="flex-1" onClick={() => setRole("teacher")}>Teacher</Button><Button type="button" variant={role === "student" ? "default" : "outline"} className="flex-1" onClick={() => setRole("student")}>Student</Button></div></div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Sign Up"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
          <p className="text-xs text-muted-foreground text-center mt-6"><Link to="/" className="text-primary hover:underline">← Back to Home</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
