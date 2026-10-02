import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden items-center justify-center p-4">
      {/* Premium Background Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] pointer-events-none mix-blend-screen animate-float-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen animate-float-slower" />

      <div className="w-full max-w-[440px] space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center space-y-3"
        >
          <div className="mx-auto w-20 h-20 bg-card/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl mb-6">
            <img src="/उpasthiti_SVG.svg" alt="उpasthiti" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold font-heading tracking-tight text-foreground">
            उpasthiti
          </h1>
          <p className="text-muted-foreground text-sm">Join the Education Management System</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Card className="glass-card-premium">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Create Account</CardTitle>
              <CardDescription>
                Enter your details to create an account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="text" placeholder="Enter your email" className="focus-glow-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" className="focus-glow-input" />
              </div>
              
              <Button className="w-full btn-premium h-11">Sign Up</Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?
                <Link to="/login" className="ml-1 text-primary hover:underline font-semibold">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
