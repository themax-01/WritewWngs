import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Pen } from 'lucide-react';
import { Link } from 'wouter';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be less than 50 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Set page title
  useEffect(() => {
    document.title = 'Login or Register - Pencraft';
  }, []);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="flex w-full max-w-5xl shadow-lg rounded-xl overflow-hidden">
          {/* Left side - Auth forms */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 p-8">
            <div className="mb-6 text-center">
              <Link href="/" className="inline-flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
                <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Pencraft</span>
              </Link>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue your writing journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username or Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username or email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Password</FormLabel>
                                <Link href="/forgot-password" className="text-sm text-primary hover:text-blue-700">
                                  Forgot password?
                                </Link>
                              </div>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center w-full">
                      Don't have an account? 
                      <button 
                        onClick={() => document.querySelector('[data-value="register"]')?.click()}
                        className="ml-1 text-primary hover:text-blue-700 font-medium"
                      >
                        Sign up
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Join Pencraft to share your stories with the world
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a unique username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a secure password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center w-full">
                      Already have an account? 
                      <button 
                        onClick={() => document.querySelector('[data-value="login"]')?.click()}
                        className="ml-1 text-primary hover:text-blue-700 font-medium"
                      >
                        Sign in
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right side - Hero/Promo */}
          <div className="hidden lg:block w-1/2 bg-gradient-to-br from-blue-500 to-violet-600 p-12 text-white">
            <div className="h-full flex flex-col justify-center">
              <div className="mb-8">
                <Pen className="h-12 w-12 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Unleash Your Creativity</h1>
                <p className="text-blue-100 text-lg mb-6">
                  Join thousands of writers on Pencraft and share your unique voice with the world. 
                  Connect with readers, participate in challenges, and grow as a writer.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-2 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Publish your stories, poems, and essays</p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-2 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Get feedback from a supportive community</p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-2 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Participate in writing challenges and improve your craft</p>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-2 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Discover writing from authors around the world</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <blockquote className="border-l-4 border-blue-300 pl-4 italic">
                  "The scariest moment is always just before you start."
                  <footer className="mt-2 text-blue-200">― Stephen King</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
