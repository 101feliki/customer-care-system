import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BellIcon, 
  LockClosedIcon, 
  EnvelopeIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ==================== INTERFACE DEFINITIONS ====================
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: any;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  message?: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword?: string;
}

interface AuthResponse {
  message: string;
  success?: boolean;
  token?: string;
}

// ==================== AUTH SERVICE FUNCTIONS ====================
class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log(`🔐 Attempting login to: ${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Login response status:', response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  // Forgot password - send reset email
  static async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      console.log(`🔐 Requesting password reset for: ${email}`);
      
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Password reset request failed: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      console.log(`🔐 Resetting password with token`);
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password: newPassword 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Password reset failed: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }

  // Extract user data from login response
  static extractUserData(response: LoginResponse): { token: string; user: any } {
    // Check for accessToken (camelCase)
    if (response.accessToken) {
      console.log('✅ Found accessToken (camelCase)');
      return {
        token: response.accessToken,
        user: response.user || {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        }
      };
    }
    
    // Check for access_token (snake_case)
    if (response.access_token) {
      console.log('✅ Found access_token (snake_case)');
      return {
        token: response.access_token,
        user: response.user || {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        }
      };
    }
    
    // Check for token
    if (response.token) {
      console.log('✅ Found token');
      return {
        token: response.token,
        user: response.user || {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        }
      };
    }
    
    console.error('❌ No valid token structure found in response:', response);
    throw new Error('Invalid login response format from server');
  }
}

// ==================== LOGIN COMPONENT ====================
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // Reset password states (for when user comes from email link)
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check for reset token in URL (when user clicks email link)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      console.log('🔑 Reset token found in URL');
      setResetToken(token);
      setShowResetPassword(true);
      setShowForgotPassword(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call AuthService.login
      const loginResponse = await AuthService.login({ email, password });
      
      // Extract token and user data
      const { token, user } = AuthService.extractUserData(loginResponse);
      
      // Call the login function from AuthContext
      login(token, user);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      setForgotLoading(false);
      return;
    }

    try {
      const response = await AuthService.forgotPassword(forgotEmail);
      setForgotSuccess(response.message || 'Password reset instructions have been sent to your email.');
      setForgotEmail('');
      
      // Auto-close modal after 5 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      setForgotError(err instanceof Error ? err.message : 'Failed to send reset instructions. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    // Validate passwords
    if (!newPassword) {
      setResetError('Please enter a new password');
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      setResetLoading(false);
      return;
    }

    try {
      const response = await AuthService.resetPassword(resetToken, newPassword);
      setResetSuccess(response.message || 'Password has been reset successfully!');
      
      // Clear form and redirect to login after 3 seconds
      setTimeout(() => {
        setShowResetPassword(false);
        setResetSuccess('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
      
    } catch (err) {
      console.error('❌ Reset password error:', err);
      setResetError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const resetForgotPasswordForm = () => {
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess('');
    setShowForgotPassword(false);
  };

  const resetResetPasswordForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
    setShowResetPassword(false);
    setResetToken('');
    
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 mb-6">
          <BellIcon className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-primary dark:text-black">
          {showResetPassword ? 'Reset Password' : showForgotPassword ? 'Forgot Password' : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-sm text-secondary dark:text-gray-300 font-medium">
          {showResetPassword 
            ? 'Enter your new password' 
            : showForgotPassword 
              ? 'Enter your email to receive reset instructions'
              : 'Customer Care Notification System'
          }
        </p>
        
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Forgot Password Modal */}
        {showForgotPassword ? (
          <div className="bg-card py-8 px-10 shadow-2xl rounded-3xl border border-color">
            <button
              onClick={resetForgotPasswordForm}
              className="flex items-center text-sm text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-white mb-6"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Login
            </button>

            {forgotSuccess && (
              <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 rounded-lg text-sm flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {forgotSuccess}
              </div>
            )}

            {forgotError && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {forgotError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-900 dark:text-gray-900">
                  We'll send you a link to reset your password
                </p>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {forgotLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Sending...
                  </>
                ) : 'Send Reset Instructions'}
              </button>
            </form>
          </div>
        ) : showResetPassword ? (
          // Reset Password Form
          <div className="bg-card py-8 px-10 shadow-2xl rounded-3xl border border-color">
            <button
              onClick={resetResetPasswordForm}
              className="flex items-center text-sm text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-white mb-6"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Login
            </button>

            {resetSuccess && (
              <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 rounded-lg text-sm flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {resetSuccess}
              </div>
            )}

            {resetError && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {resetError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {resetLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Resetting...
                  </>
                ) : 'Reset Password'}
              </button>
            </form>
          </div>
        ) : (
          // Main Login Form
          <div className="bg-card py-8 px-10 shadow-2xl rounded-3xl border border-color">
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-primary dark:text-black">Email Address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="admin@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary dark:text-white">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded" 
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary dark:text-gray-400">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>

             
            </form>
          </div>
        )}
      </div>

      {/* Info about password reset process */}
      {(showForgotPassword || showResetPassword) && (
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          <p>
            {showForgotPassword 
              ? "You'll receive an email with a password reset link. Click the link to set a new password."
              : "Enter your new password. Make sure it's at least 6 characters long."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;