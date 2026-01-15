import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Attempting login with:', { email, password: '***' });
      
      // Make REAL API call to your backend
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response status:', response.status);
      
      const data = await response.json();
      console.log('✅ Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.status}`);
      }
      
      // Your backend returns: { user, accessToken, refreshToken }
      // Note: It's accessToken (camelCase), not access_token (snake_case)
      if (data.accessToken && data.user) {
        console.log('✅ Found accessToken and user');
        console.log('🔑 Token:', data.accessToken.substring(0, 50) + '...');
        console.log('👤 User:', data.user);
        
        login(data.accessToken, data.user);
        navigate('/dashboard');
      } 
      // If backend returns access_token (snake_case)
      else if (data.access_token && data.user) {
        console.log('✅ Found access_token and user');
        login(data.access_token, data.user);
        navigate('/dashboard');
      }
      // If backend returns just token
      else if (data.token && data.user) {
        console.log('✅ Found token and user');
        login(data.token, data.user);
        navigate('/dashboard');
      }
      // If user data is embedded in root
      else if (data.accessToken && data.id) {
        console.log('✅ Found accessToken with embedded user data');
        login(data.accessToken, {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
        navigate('/dashboard');
      }
      else {
        console.error('❌ No valid token structure found in response:', data);
        throw new Error('Invalid login response format from server');
      }
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 mb-6">
          <BellIcon className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-primary">Welcome Back</h2>
        <p className="mt-2 text-sm text-secondary font-medium">Customer Care Notification System</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-10 shadow-2xl rounded-3xl border border-color">
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-primary">Email Address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-primary border border-color rounded-xl text-primary placeholder-gray-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="admin@birdview.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-primary border border-color rounded-xl text-primary placeholder-gray-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="admin123"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-semibold text-blue-500 hover:text-blue-600">
                  Forgot password?
                </a>
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
      </div>
    </div>
  );
};

export default LoginPage;