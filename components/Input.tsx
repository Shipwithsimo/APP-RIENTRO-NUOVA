import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-gray-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-gray-400'}`}>
              {icon}
            </div>
          )}
          <input 
            ref={ref}
            className={`
              w-full bg-white border rounded-2xl py-3.5 
              ${icon ? 'pl-11' : 'pl-4'} pr-4 
              text-gray-900 placeholder-gray-400 
              focus:outline-none focus:ring-2 transition-all
              ${error 
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 ml-1 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
