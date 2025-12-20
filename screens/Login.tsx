import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../types';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormData } from '../lib/validation';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export const Login: React.FC<Props> = ({ onNavigate }) => {
  const { login, error: authError, clearError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      onNavigate(Screen.HOME);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-white">
      <button 
        onClick={() => onNavigate(Screen.ONBOARDING)} 
        className="mb-8 text-gray-400 hover:text-gray-600 w-fit transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Bentornata</h1>
        <p className="text-gray-500">Accedi per continuare il tuo viaggio in sicurezza.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {/* Global Error */}
        {authError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            <AlertCircle size={20} />
            <span className="text-sm">{authError}</span>
          </div>
        )}

        {/* Email Field */}
        <div>
          <Input 
            label="Email" 
            type="email" 
            icon={<Mail size={18} />} 
            placeholder="sara@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Input 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            icon={<Lock size={18} />} 
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="text-right">
          <button 
            type="button"
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
          >
            Password dimenticata?
          </button>
        </div>

        <Button 
          type="submit"
          fullWidth 
          isLoading={isSubmitting || loading}
          className="mt-4"
        >
          Accedi
        </Button>
      </form>
      
      <div className="mt-auto text-center pt-8">
        <p className="text-gray-400 text-sm">
          Non hai un account?{' '}
          <button 
            onClick={() => onNavigate(Screen.REGISTER)}
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            Registrati
          </button>
        </p>
      </div>
    </div>
  );
};
