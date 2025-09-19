import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const CreateAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const { user, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  // Handle redirection based on user role
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'student' ? '/student' 
        : user.role === 'teacher' ? '/teacher' 
        : '/admin';
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup(name, email, password, role); // Original signature, no options object

    if (success) {
      toast({
        title: "Account created!",
        description: "You have been successfully registered and logged in.",
      });
      // Navigation handled by useEffect after user state updates
    } else {
      toast({
        title: "Signup failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Only render form if no user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="mx-auto w-16 h-16" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              उpasthiti
            </h1>
            <p className="text-muted-foreground">Education Management System</p>
          </div>

          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Enter your details to join the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'admin')}
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
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
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?
                <button
                  type="button"
                  className="ml-1 text-primary hover:underline"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null; // Return null if user is logged in (handled by useEffect)
};