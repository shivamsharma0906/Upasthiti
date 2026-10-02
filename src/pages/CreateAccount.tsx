import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, isStudentProfileComplete } from '@/contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export const CreateAccount = () => {
  // Required
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);

  // Optional
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const { user, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  // Handle redirection based on user role and profile completeness
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        const isComplete = isStudentProfileComplete(user);
        navigate(isComplete ? '/student' : '/student/complete-profile');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please choose an image under 2MB.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your full name, college email, and password.",
        variant: "destructive",
      });
      return;
    }

    const extra: { personalEmail?: string; phone?: string; avatar?: string } = {};
    if (personalEmail.trim()) extra.personalEmail = personalEmail.trim();
    if (phone.trim()) extra.phone = phone.trim();
    if (avatar.trim()) extra.avatar = avatar.trim();

    const success = await signup(name.trim(), email.trim(), password, role, extra);

    if (success) {
      toast({
        title: "Account Created Successfully",
        description: role === 'student' 
          ? "Please complete your required academic profile to access your dashboard." 
          : "Welcome to Upasthiti Portal.",
      });
    } else {
      toast({
        title: "Registration Failed",
        description: "An account with this email may already exist. Please try signing in.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex relative overflow-hidden items-center justify-center p-4 sm:p-6">
        {/* Ambient background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="w-full max-w-[460px] space-y-5 relative z-10 my-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-2"
          >
            <div className="mx-auto w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-border shadow-subtle mb-4">
              <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground text-xs">
              Register your institutional identity for Upasthiti 2.0
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <Card className="border border-border bg-card shadow-subtle">
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-lg">Account Registration</CardTitle>
                <CardDescription className="text-xs">
                  Enter your credentials below to establish your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Account Role Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-semibold">Institutional Role</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'admin')}
                      className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-all cursor-pointer font-medium"
                      required
                    >
                      <option value="student">Student Account</option>
                      <option value="teacher">Faculty / Teacher Account</option>
                      <option value="admin">Administrator Account</option>
                    </select>
                  </div>

                  {/* Required: Full Name */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                      <span className="text-[10px] text-primary font-medium">Required</span>
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Shivam Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  {/* Required: College Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        {role === 'student' ? 'College Email' : 'Institutional Email'}
                      </Label>
                      <span className="text-[10px] text-primary font-medium">Required</span>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  {/* Required: Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                      <span className="text-[10px] text-primary font-medium">Required</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-9 text-xs pr-9"
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-0 top-0 h-full px-2.5 flex items-center text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Optional Details Collapsible Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                      className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 text-xs font-medium text-muted-foreground transition-colors border border-dashed border-border"
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>Optional Profile Details (Personal Email, Phone, Photo)</span>
                      </span>
                      {showOptionalFields ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Optional Fields Container */}
                  {showOptionalFields && (
                    <div className="space-y-3 p-3 bg-muted/20 border border-border rounded-lg text-xs animate-in fade-in-50 duration-200">
                      {/* Optional: Personal Email */}
                      <div className="space-y-1">
                        <Label htmlFor="personalEmail" className="text-[11px] font-medium text-muted-foreground">
                          Personal Email (Optional)
                        </Label>
                        <Input
                          id="personalEmail"
                          type="email"
                          placeholder="personal@gmail.com"
                          value={personalEmail}
                          onChange={(e) => setPersonalEmail(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Optional: Phone Number */}
                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-[11px] font-medium text-muted-foreground">
                          Phone Number (Optional)
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Optional: Profile Photo */}
                      <div className="space-y-1">
                        <Label htmlFor="avatarFile" className="text-[11px] font-medium text-muted-foreground">
                          Profile Photo (Optional)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="avatarFile"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFile}
                            className="h-8 text-xs file:text-xs file:mr-2 file:py-0 file:px-2 cursor-pointer"
                          />
                          {avatar && (
                            <img 
                              src={avatar} 
                              alt="Preview" 
                              className="h-8 w-8 rounded-full object-cover border border-border shrink-0" 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-10 text-xs font-semibold mt-2 shadow-xs" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account & Continue"}
                  </Button>
                </form>

                <div className="text-center text-xs text-muted-foreground pt-1 border-t border-border">
                  Already have an institutional account?
                  <button
                    type="button"
                    className="ml-1 text-primary hover:underline font-semibold"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};
export default CreateAccount;