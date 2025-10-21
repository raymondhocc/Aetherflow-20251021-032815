import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth(state => state.login);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = (values: LoginFormValues) => {
    setIsSubmitting(true);
    // Mock authentication
    setTimeout(() => {
      if (values.email === 'demo@aetherflow.io' && values.password === 'password') {
        login({ id: 'user-1', name: 'Demo User', email: values.email });
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid email or password.');
      }
      setIsSubmitting(false);
    }, 1000);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero-pattern p-4">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-semibold font-display">AetherFlow</span>
          </div>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="demo@aetherflow.io" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}