import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "teacher" | "student" | "organisation" | "moderator";

interface OrganisationData {
  org_name: string;
  phone?: string;
  address?: string;
  pincode?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface SignUpOptions {
  displayName?: string;
  // For student/teacher: name of the organisation they belong to
  // stored in profiles.institution column (already exists)
  institutionName?: string;
  // For organisation role: full org data goes to organisations table
  organisation?: OrganisationData;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  rolesLoading: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isOrganisation: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: AppRole, opts?: SignUpOptions) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]                   = useState<User | null>(null);
  const [session, setSession]             = useState<Session | null>(null);
  const [roles, setRoles]                 = useState<AppRole[]>([]);
  const [loading, setLoading]             = useState(true);
  const [rolesLoading, setRolesLoading]   = useState(true);

  const fetchRoles = async (userId: string) => {
    setRolesLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (data && !error) setRoles(data.map((r) => r.role as AppRole));
    } catch (e) {
      console.error("fetchRoles error:", e);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchRoles(session.user.id);
      else setRolesLoading(false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchRoles(session.user.id);
        else { setRoles([]); setRolesLoading(false); }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    role: AppRole,
    opts: SignUpOptions = {}
  ) => {
    const displayName = opts.displayName || (role === "organisation" ? opts.organisation?.org_name : "") || email;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, role } },
    });

    if (!error && data.user) {
      const userId = data.user.id;

      // Wait for DB trigger to create profile row
      await new Promise(r => setTimeout(r, 900));

      // Insert role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (roleError) {
        await new Promise(r => setTimeout(r, 1000));
        await supabase.from("user_roles").insert({ user_id: userId, role });
      }

      // Update profiles table
      // institution = org name they belong to (student/teacher)
      //             = their own org name (organisation role)
      const profileUpdate: Record<string, any> = {
        display_name: displayName,
      };
      if (opts.institutionName) {
        profileUpdate.institution = opts.institutionName;
      }
      if (role === "organisation" && opts.organisation?.org_name) {
        profileUpdate.institution = opts.organisation.org_name;
      }
      await supabase.from("profiles").update(profileUpdate).eq("user_id", userId);

      // For organisation role: insert into organisations table
      if (role === "organisation" && opts.organisation) {
        await supabase.from("organisations").insert({
          user_id:  userId,
          org_name: opts.organisation.org_name,
          phone:    opts.organisation.phone    || null,
          email:    email,
          address:  opts.organisation.address  || null,
          pincode:  opts.organisation.pincode  || null,
          district: opts.organisation.district || null,
          state:    opts.organisation.state    || null,
          country:  opts.organisation.country  || "India",
        });
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setRoles([]); setRolesLoading(true);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user, session, roles, loading, rolesLoading,
      isTeacher:      roles.includes("teacher"),
      isStudent:      roles.includes("student"),
      isOrganisation: roles.includes("organisation"),
      signIn, signUp, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
