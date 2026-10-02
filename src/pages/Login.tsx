import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, isStudentProfileComplete } from "@/contexts/AuthContext";
import { Eye, EyeOff, ShieldCheck, GraduationCap, Users, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (user) {
    if (user.role === "student") {
      const isComplete = isStudentProfileComplete(user);
      const redirectPath = isComplete ? "/student" : "/student/complete-profile";
      return <Navigate to={redirectPath} replace />;
    }
    const from = (location.state as any)?.from;
    const redirectPath = from 
      ? from.pathname + from.search 
      : (user.role === "teacher" ? "/teacher" : "/admin");
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Authenticated Successfully",
        description: "Welcome back to Upasthiti Academic Portal.",
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid institutional credentials. Please try demo accounts below.",
        variant: "destructive",
      });
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand & Institution Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-20 w-20 relative flex items-center justify-center p-2 rounded-2xl bg-primary/5 border border-primary/20 shadow-brand-soft">
            <img
              src="/उpasthiti_SVG.svg"
              alt="Upasthiti Logo"
              className="h-16 w-16 object-contain drop-shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground flex items-center justify-center gap-2">
              Sign In to Upasthiti
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                2.0
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Institutional Academic Attendance & Operations Platform
            </p>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-7 shadow-subtle space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@edu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <button
                  type="button"
                  onClick={() => navigate('/signin-otp')}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Use OTP Instead
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 text-xs pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 text-xs font-semibold shadow-xs" 
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign In to Workspace"}
            </Button>
          </form>

          {/* Institutional Fast Login Demo Credentials */}
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block text-center">
              Quick Role Demonstration
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@edu.com', 'student123')}
                className="p-2 border border-border rounded-md hover:bg-primary/5 hover:border-primary/30 text-center transition-all group flex flex-col items-center gap-1"
              >
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold text-foreground group-hover:text-primary">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@edu.com', 'teacher123')}
                className="p-2 border border-border rounded-md hover:bg-primary/5 hover:border-primary/30 text-center transition-all group flex flex-col items-center gap-1"
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold text-foreground group-hover:text-primary">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@edu.com', 'admin123')}
                className="p-2 border border-border rounded-md hover:bg-primary/5 hover:border-primary/30 text-center transition-all group flex flex-col items-center gap-1"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold text-foreground group-hover:text-primary">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Don't have an institutional profile?{' '}
          <button
            type="button"
            className="text-primary hover:underline font-semibold"
            onClick={() => navigate('/create-account')}
          >
            Register Student / Faculty Account
          </button>
        </div>
      </div>
    </div>
  );
};