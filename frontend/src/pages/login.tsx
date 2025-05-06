import type React from "react";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "demo@revenuefix.com", // Default demo email
    password: "password", // Default demo password
    rememberMe: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // For demo purposes, we'll simulate a successful login
      
      // Simulate successful login
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "demo-user-id",
        name: "Demo User",
        email: formData.email
      }));
      
      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (isAuthenticated) return <Navigate to='/dashboard' />;

  return (
    <div className='flex min-h-screen bg-gradient-to-br from-[#7e3af2]/5 to-[#7e3af2]/10'>
      <div className='container mx-auto flex items-center justify-center py-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[#7e3af2] text-white">
              <span className="text-xl font-bold">RF</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome to RevenueFix</h1>
            <p className="text-sm text-muted-foreground">Sign in to access your account</p>
          </div>
          
          <Card className='mx-auto w-full border-[#7e3af2]/10 shadow-lg'>
            <CardHeader>
              <CardTitle className='text-xl'>Sign in</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='demo@revenuefix.com'
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    className="border-[#7e3af2]/20 focus-visible:ring-[#7e3af2]/30"
                  />
                  {errors.email && <p className='text-sm text-destructive'>{errors.email}</p>}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='password'>Password</Label>
                    <Link to='/forgot-password' className='text-sm text-[#7e3af2] underline-offset-4 hover:underline'>
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    className="border-[#7e3af2]/20 focus-visible:ring-[#7e3af2]/30"
                  />
                  {errors.password && <p className='text-sm text-destructive'>{errors.password}</p>}
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox 
                    id='rememberMe' 
                    checked={formData.rememberMe} 
                    onCheckedChange={handleCheckboxChange}
                    className="border-[#7e3af2]/20 data-[state=checked]:bg-[#7e3af2] data-[state=checked]:border-[#7e3af2]"
                  />
                  <Label htmlFor='rememberMe' className='text-sm font-normal'>
                    Remember me
                  </Label>
                </div>
              </CardContent>

              <CardFooter className='flex flex-col space-y-4'>
                <Button 
                  type='submit' 
                  className='w-full bg-[#7e3af2] hover:bg-[#7e3af2]/90' 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <p className='text-center text-sm text-muted-foreground'>
                  Don't have an account?{" "}
                  <Link to='/signup' className='text-[#7e3af2] underline-offset-4 hover:underline'>
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}