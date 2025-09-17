import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, isLoading } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    const redirectPath = user.role === 'student' ? '/student' 
      : user.role === 'teacher' ? '/teacher' 
      : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const quickLogin = (role: 'student' | 'teacher' | 'admin') => {
    const credentials = {
      // student: { email: 'student@edu.com', password: 'student123' },
      teacher: { email: 'teacher@edu.com', password: 'teacher123' },
      // admin: { email: 'admin@edu.com', password: 'admin123' }
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="mx-auto w-16 h-16" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            उpasthiti
          </h1>
          <p className="text-muted-foreground">Education Management System</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or try demo accounts</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('student')}
                  className="text-xs"
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('teacher')}
                  className="text-xs"
                >
                  Teacher
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('admin')}
                  className="text-xs"
                >
                  Admin
                </Button>
              </div>

              {/* Sign up / Create account */}
              <div className="text-center text-sm text-muted-foreground">
                Don’t have an account?
                <button
                  type="button"
                  className="ml-1 text-primary hover:underline"
                  onClick={() => alert('Sign Up flow can be wired to your API or a new page.')}
                >
                  Create account
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => alert('Sign In with OTP coming soon')}>Sign In with OTP</Button>
          <Button variant="outline" onClick={() => alert('Sign Up flow coming soon')}>Sign Up</Button>
        </div>
      </div>
    </div>
  );
};