import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    await signIn(email, password);
  };

  const handleSignUp = async ({ email, password, full_name }: { email: string; password: string; full_name: string }) => {
    await signUp(email, password, full_name);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Clock className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="mt-3 text-center text-3xl font-extrabold text-gray-900">TimeTrack</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Comprehensive time tracking and task management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm
            onSubmit={handleLogin}
            onSignUp={() => setIsLogin(false)}
          />
        ) : (
          <SignUpForm
            onSubmit={handleSignUp}
            onLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
