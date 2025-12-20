import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, User, Phone } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../types';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterFormData } from '../lib/validation';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export const Register: React.FC<Props> = ({ onNavigate }) => {
  const { register: registerUser, error: authError, clearError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data.email, data.password, data.name, data.phone);
      onNavigate(Screen.HOME);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-white overflow-y-auto">
      <button 
        onClick={() => onNavigate(Screen.LOGIN)} 
        className="mb-6 text-gray-400 hover:text-gray-600 w-fit transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Crea Account</h1>
        <p className="text-gray-500">Unisciti a RIENTRO per viaggiare sempre in sicurezza.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1">
        {/* Global Error */}
        {authError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            <AlertCircle size={20} />
            <span className="text-sm">{authError}</span>
          </div>
        )}

        {/* Name Field */}
        <Input 
          label="Nome" 
          type="text" 
          icon={<User size={18} />} 
          placeholder="Il tuo nome"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email Field */}
        <Input 
          label="Email" 
          type="email" 
          icon={<Mail size={18} />} 
          placeholder="sara@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone Field (Optional) */}
        <Input 
          label="Telefono (opzionale)" 
          type="tel" 
          icon={<Phone size={18} />} 
          placeholder="+39 333 1234567"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Password Field */}
        <div className="relative">
          <Input 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            icon={<Lock size={18} />} 
            placeholder="Minimo 6 caratteri"
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

        {/* Confirm Password Field */}
        <div className="relative">
          <Input 
            label="Conferma Password" 
            type={showConfirmPassword ? 'text' : 'password'} 
            icon={<Lock size={18} />} 
            placeholder="Ripeti la password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>La password deve contenere:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Almeno 6 caratteri</li>
            <li>Almeno una lettera maiuscola</li>
            <li>Almeno un numero</li>
          </ul>
        </div>

        <Button 
          type="submit"
          fullWidth 
          isLoading={isSubmitting || loading}
          className="mt-6"
        >
          Crea Account
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Creando un account accetti i nostri{' '}
          <span className="text-indigo-600">Termini di Servizio</span> e la{' '}
          <span className="text-indigo-600">Privacy Policy</span>
        </p>
      </form>
      
      <div className="text-center pt-6 pb-4">
        <p className="text-gray-400 text-sm">
          Hai già un account?{' '}
          <button 
            onClick={() => onNavigate(Screen.LOGIN)}
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            Accedi
          </button>
        </p>
      </div>
    </div>
  );
};

