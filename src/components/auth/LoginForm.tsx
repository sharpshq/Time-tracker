import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  onSignUp: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onSignUp }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={onSignUp}
            >
              create a new account
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
        <form id="login-form" onSubmit={handleSubmit(handleLogin)} className="space-y-4">
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
            autoComplete="current-password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            {...register('password')}
            error={errors.password?.message}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          icon={<LogIn className="h-5 w-5" />}
        >
          Sign in
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
