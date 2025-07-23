'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading, error } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'reset') {
      if (!formData.email) {
        return;
      }
      try {
        await resetPassword(formData.email);
        setMode('signin');
      } catch (error) {
        // Error is handled in the hook
      }
      return;
    }

    if (!formData.email || !formData.password) {
      return;
    }

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        return;
      }
      try {
        await signUpWithEmail(formData.email, formData.password, formData.displayName);
        onSuccess?.();
      } catch (error) {
        // Error is handled in the hook
      }
    } else {
      try {
        await signInWithEmail(formData.email, formData.password);
        onSuccess?.();
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-2xl font-semibold text-gray-800">
          {mode === 'signin' ? t('auth.signIn') : 
           mode === 'signup' ? 'Create Account' : 
           'Reset Password'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'signin' ? 'Welcome back to WBSO Simpel' :
           mode === 'signup' ? 'Join WBSO Simpel today' :
           'Enter your email to reset password'}
        </p>
      </div>

      {/* Google Sign-In */}
      {mode !== 'reset' && (
        <div className="mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <div className="w-5 h-5 mr-3">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="text-gray-700 font-medium">
              {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
            </span>
          </button>
        </div>
      )}

      {/* Divider */}
      {mode !== 'reset' && (
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or continue with email</span>
          </div>
        </div>
      )}

      {/* Email Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {/* Name field for signup */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name (optional)
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your full name"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@company.com"
          />
        </div>

        {/* Password */}
        {mode !== 'reset' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {/* Confirm Password for signup */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
              minLength={6}
            />
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 
           mode === 'signin' ? 'Sign In' :
           mode === 'signup' ? 'Create Account' :
           'Send Reset Email'}
        </button>
      </form>

      {/* Mode Switcher */}
      <div className="mt-6 text-center text-sm">
        {mode === 'signin' && (
          <>
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </button>
            </p>
            <button
              onClick={() => setMode('reset')}
              className="text-blue-600 hover:text-blue-500 font-medium mt-2 block mx-auto"
            >
              Forgot password?
            </button>
          </>
        )}
        
        {mode === 'signup' && (
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </button>
          </p>
        )}
        
        {mode === 'reset' && (
          <p className="text-gray-600">
            Remember your password?{' '}
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm; 