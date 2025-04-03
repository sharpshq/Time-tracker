import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSubmit: (data: SignUpFormValues) => Promise<void>;
  onLogin: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, onLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Create a new account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={onLogin}
            >
              sign in to your existing account
            </button>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}
        <form id="signup-form" onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
          <Input
            label="Full Name"
            autoComplete="name"
            icon={<User className="h-5 w-5 text-gray-400" />}
            {...register('full_name')}
            error={errors.full_name?.message}
          />

          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            {...register('password')}
            error={errors.password?.message}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="signup-form"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          icon={<UserPlus className="h-5 w-5" />}
        >
          Create Account
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
