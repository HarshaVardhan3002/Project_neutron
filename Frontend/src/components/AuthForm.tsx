/**
 * @fileoverview Reusable authentication form component for sign-in and sign-up.
 * It uses `react-hook-form` and `zod` for robust validation.
 */
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.context";

/**
 * Zod schema for sign-in form validation.
 */
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

/**
 * Zod schema for sign-up form validation.
 * Includes a refinement to ensure password and confirmPassword fields match.
 */
const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Apply error to the confirmPassword field
});

/**
 * Props for the AuthForm component.
 */
type AuthFormProps = {
  /** Determines whether the form is for 'signin' or 'signup'. */
  mode: 'signin' | 'signup';
};

/**
 * A form component that handles both sign-in and sign-up logic.
 * It dynamically adjusts its fields and validation based on the `mode` prop.
 * @param {AuthFormProps} props - The component props.
 * @returns {JSX.Element} The authentication form component.
 */
export default function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const formSchema = mode === 'signin' ? signInSchema : signUpSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'signin'
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" }
  });

  /**
   * Handles form submission by calling the authentication context.
   */
  const onSubmit = async (values: FormValues) => {
    try {
      let result;

      if (mode === 'signin') {
        result = await signIn(values.email, values.password);
      } else {
        const signUpValues = values as { name: string; email: string; password: string };
        result = await signUp(signUpValues.email, signUpValues.password, signUpValues.name);
      }

      // Handle authentication result
      if (result.error) {
        throw new Error(result.error.message || 'Authentication failed');
      }

      if (mode === 'signin') {
        toast.success('Welcome back!', {
          description: 'Redirecting to dashboard...'
        });
        // Redirect to dashboard after successful sign in
        setTimeout(() => {
          window.location.href = '/lms/dashboard';
        }, 1000);
      } else {
        toast.success('Account created successfully!', {
          description: 'Please check your email to verify your account.'
        });
      }

    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed', {
        description: error.message || 'Please check your credentials and try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {mode === 'signup' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
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
          {mode === 'signup' && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
