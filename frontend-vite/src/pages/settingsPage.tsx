import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  BellIcon, 
  UserIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  ChevronRightIcon,
  UsersIcon,
  UserPlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  EnvelopeIcon,
  XMarkIcon,
  KeyIcon,
  SparklesIcon,
  PencilIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Types
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  isVerified: boolean;
  createdAt: string;
}

const SettingsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Admin State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'SUPERADMIN',
    isVerified: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationFrequency: 'immediate'
  });

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Helper functions for role checks
  const isUserAdmin = () => {
    const role = user?.role || '';
    return role === 'ADMIN' || role === 'SUPERADMIN' || 
           role === 'admin' || role === 'superadmin';
  };

  const isUserSuperAdmin = () => {
    const role = user?.role || '';
    return role === 'SUPERADMIN' || role === 'superadmin';
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  // Add admin tab if user is admin
  if (isUserAdmin()) {
    tabs.push({ id: 'admin', label: 'Admin', icon: ShieldCheckIcon });
  }

  // ========== REAL API FUNCTIONS ==========

  // 1. FETCH USERS FROM BACKEND
  const fetchUsers = async () => {
    if (!token) {
      console.log('❌ No token available');
      setError('Please login first');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 Fetching users...');
      
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. You do not have admin privileges.');
          console.error('❌ 403 Forbidden - User is not an admin');
          return;
        }
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // Extract users array from response
      let usersArray: any[] = [];
      
      if (data && data.users && Array.isArray(data.users)) {
        usersArray = data.users;
        console.log(`✅ Found ${usersArray.length} users in "users" property`);
      } else if (Array.isArray(data)) {
        usersArray = data;
        console.log(`✅ Found ${usersArray.length} users in direct array`);
      } else if (data && data.data && Array.isArray(data.data)) {
        usersArray = data.data;
        console.log(`✅ Found ${usersArray.length} users in "data" property`);
      } else {
        console.warn('⚠️ Unexpected response format:', data);
        usersArray = [];
      }
      
      // Map to your AdminUser interface
      const mappedUsers: AdminUser[] = usersArray.map(item => ({
        id: item.id || '',
        email: item.email || '',
        name: item.name || item.firstName + ' ' + item.lastName || 'Unnamed User',
        role: (item.role || 'USER').toUpperCase() as 'USER' | 'ADMIN' | 'SUPERADMIN',
        isVerified: item.isVerified || false,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      
      console.log('✅ Mapped users:', mappedUsers);
      setUsers(mappedUsers);
      
      if (mappedUsers.length === 0) {
        console.log('ℹ️ No users found in database');
      }
      
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(`Could not load users: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUsers([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading completed');
    }
  };

  // 2. CREATE USER
  const createUser = async (userData: typeof formData) => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('📤 Creating user:', userData.email);
      
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          password: userData.password,
          role: userData.role.toLowerCase()
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Full error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Failed to create user: ${response.status}`);
        } catch {
          throw new Error(`Failed to create user: ${response.status} ${response.statusText}\n${errorText}`);
        }
      }
      
      const responseData = await response.json();
      console.log('✅ User created:', responseData);
      
      toast.success('User created successfully!');
      fetchUsers(); // Refresh list
      return responseData;
      
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
      throw error;
    }
  };

  // 3. CREATE ADMIN
  const createAdmin = async (adminData: typeof formData) => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('📤 Creating admin:', adminData.email);
      
      const response = await fetch(`${API_BASE_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminData.email,
          name: adminData.name,
          password: adminData.password,
          role: adminData.role.toLowerCase()
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || 'Failed to create admin');
        } catch {
          throw new Error(`Failed to create admin: ${response.status} ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      console.log('✅ Admin created:', responseData);
      
      toast.success('Admin created successfully!');
      fetchUsers(); // Refresh list
      return responseData;
      
    } catch (error: any) {
      console.error('❌ Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin');
      throw error;
    }
  };

  // 4. UPDATE USER ROLE
  const updateUserRole = async (userId: string, role: 'USER' | 'ADMIN' | 'SUPERADMIN') => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('📤 Updating user role:', { userId, role });
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: role.toLowerCase() })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to update role: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Role updated:', responseData);
      
      toast.success('User role updated!');
      fetchUsers(); // Refresh list
      
    } catch (error: any) {
      console.error('❌ Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  // 5. SEND VERIFICATION EMAIL
  const verifyUser = async (userId: string) => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('📤 Verifying user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/send-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to verify user: ${response.status}`);
      }
      
      toast.success('Verification email sent!');
      fetchUsers();
      
    } catch (error: any) {
      console.error('❌ Error verifying user:', error);
      toast.error(error.message || 'Failed to verify user');
    }
  };

  // 6. MARK USER AS VERIFIED
  const markUserAsVerified = async (userId: string) => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('📤 Marking user as verified:', userId);
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to mark user as verified: ${response.status}`);
      }
      
      toast.success('User marked as verified!');
      fetchUsers();
      
    } catch (error: any) {
      console.error('❌ Error marking user as verified:', error);
      toast.error(error.message || 'Failed to verify user');
    }
  };

  // 7. DELETE USER
  const deleteUser = async (userId: string) => {
    if (!token) {
      toast.error('Please login first');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('📤 Deleting user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
      }
      
      console.log('✅ User deleted');
      
      toast.success('User deleted successfully!');
      fetchUsers();
      
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    if (activeTab === 'admin' && isUserAdmin()) {
      fetchUsers();
    }
  }, [activeTab]);

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify({ notificationSettings }));
      setSaving(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }, 800);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = searchTerm === '' || 
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      userItem.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // ========== MODAL HANDLERS ==========
  const openCreateUserModal = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'USER',
      isVerified: false
    });
    setShowPassword(false);
    setShowCreateUserModal(true);
  };

  const openCreateAdminModal = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'ADMIN',
      isVerified: true
    });
    setShowPassword(false);
    setShowCreateAdminModal(true);
  };

  const handleModalSubmit = async (isAdmin: boolean) => {
    // Basic validation
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      if (isAdmin) {
        await createAdmin(formData);
        setShowCreateAdminModal(false);
      } else {
        await createUser(formData);
        setShowCreateUserModal(false);
      }
    } catch (error) {
      // Error is already handled in the functions
    }
  };

  // ========== RENDER FUNCTIONS ==========
  const renderRoleBadge = (role: string, isCompact: boolean = false) => {
    const roleLower = role.toLowerCase();
    const colors = {
      superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    
    const text = roleLower === 'superadmin' ? 'Super Admin' : 
                 roleLower === 'admin' ? 'Admin' : 'User';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[roleLower as keyof typeof colors]}`}>
        {!isCompact && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
        {text}
      </span>
    );
  };

  const renderUserRow = (userItem: AdminUser) => {
    const currentUserId = user?.id;
    const isCurrentUser = currentUserId === userItem.id;
    
    return (
      <tr key={userItem.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        {/* ID */}
        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
          #{userItem.id.substring(0, 8)}...
        </td>
        
        {/* User Info */}
        <td className="px-3 py-2">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2">
              {userItem.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                {userItem.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {userItem.email}
              </div>
            </div>
          </div>
        </td>
        
        {/* Role */}
        <td className="px-3 py-2">
          {renderRoleBadge(userItem.role, true)}
        </td>
        
        {/* Status */}
        <td className="px-3 py-2">
          <div className="flex items-center">
            {userItem.isVerified ? (
              <span className="inline-flex items-center text-green-600 dark:text-green-400 text-xs">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-600 dark:text-amber-400 text-xs">
                <ClockIcon className="h-3 w-3 mr-1" />
                Pending
              </span>
            )}
          </div>
        </td>
        
        {/* Created */}
        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <ClockIcon className="h-3 w-3 mr-1" />
            {formatDate(userItem.createdAt)}
          </div>
        </td>
        
        {/* Actions */}
        <td className="px-3 py-2">
          <div className="flex items-center space-x-1">
            {/* Change Role (Super Admin only, can't modify self) */}
            {isUserSuperAdmin() && !isCurrentUser && (
              <select
                value={userItem.role}
                onChange={(e) => updateUserRole(userItem.id, e.target.value as 'USER' | 'ADMIN' | 'SUPERADMIN')}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isCurrentUser}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPERADMIN">Super Admin</option>
              </select>
            )}

            {/* Verify Button */}
            {!userItem.isVerified && isUserAdmin() && (
              <button
                onClick={() => markUserAsVerified(userItem.id)}
                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                title="Mark as Verified"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
            )}

            {/* Resend Verification */}
            {!userItem.isVerified && isUserAdmin() && (
              <button
                onClick={() => verifyUser(userItem.id)}
                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                title="Resend Verification Email"
              >
                <EnvelopeIcon className="h-4 w-4" />
              </button>
            )}

            {/* Delete User (Super Admin only, can't delete self) */}
            {isUserSuperAdmin() && !isCurrentUser && (
              <button
                onClick={() => deleteUser(userItem.id)}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Delete User"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // ========== CREATE USER MODAL ==========
  const renderCreateUserModal = (isAdmin: boolean) => {
    const modalOpen = isAdmin ? showCreateAdminModal : showCreateUserModal;
    const setModalOpen = isAdmin ? setShowCreateAdminModal : setShowCreateUserModal;
    const title = isAdmin ? 'Create Administrator' : 'Create New User';
    const description = isAdmin ? 'Add an elevated access account' : 'Add a regular user account';
    const buttonText = isAdmin ? 'Create Admin' : 'Create User';
    const headerGradient = isAdmin ? 'from-green-600 to-emerald-800' : 'from-blue-600 to-blue-800';
    const buttonGradient = isAdmin ? 'from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800' : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';

    if (!modalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Modal Header */}
          <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r ${headerGradient} text-white`}>
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                {isAdmin ? (
                  <ShieldCheckIcon className="h-5 w-5" />
                ) : (
                  <UserPlusIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-blue-100 text-xs">{description}</p>
              </div>
            </div>
            <button 
              onClick={() => setModalOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                <span className="flex items-center">
                  Email Address
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={isAdmin ? "admin@example.com" : "user@example.com"}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Name Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                <span className="flex items-center">
                  Full Name
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={isAdmin ? "Admin User" : "John Doe"}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                <span className="flex items-center">
                  Password
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center mt-1">
                <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      formData.password.length >= 12 ? 'bg-green-500' :
                      formData.password.length >= 8 ? 'bg-yellow-500' :
                      formData.password.length > 0 ? 'bg-red-500' : ''
                    }`}
                    style={{ width: `${Math.min((formData.password.length / 12) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formData.password.length >= 12 ? 'Strong' :
                   formData.password.length >= 8 ? 'Good' :
                   formData.password.length > 0 ? 'Weak' : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 8 characters
              </p>
            </div>
            
            {/* Role Selection (Admin creation only) */}
            {isAdmin && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  <span className="flex items-center">
                    Admin Role
                    <span className="ml-1 text-red-500">*</span>
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ADMIN', 'SUPERADMIN'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        formData.role === role
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {role === 'SUPERADMIN' ? (
                          <ShieldCheckIcon className="h-5 w-5 mb-1" />
                        ) : (
                          <UserGroupIcon className="h-5 w-5 mb-1" />
                        )}
                        <span className="font-medium">
                          {role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                        </span>
                        <span className="text-xs opacity-75 mt-0.5">
                          {role === 'SUPERADMIN' ? 'Full access' : 'Limited access'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Permissions Info Box */}
            <div className={`${isAdmin ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'} rounded-lg p-3 border`}>
              <div className="flex items-start">
                <ShieldCheckIcon className={`h-4 w-4 mr-2 mt-0.5 shrink-0 ${isAdmin ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                    {isAdmin ? 'Admin Permissions' : 'User Permissions'}
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    {isAdmin ? (
                      <>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                          Full dashboard access
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                          User management
                        </li>
                        {formData.role === 'SUPERADMIN' && (
                          <>
                            <li className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                              Create other admins
                            </li>
                            <li className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                              Full system control
                            </li>
                          </>
                        )}
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                          Auto-verified account
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                          Basic dashboard access
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                          View notifications
                        </li>
                        <li className="flex items-center">
                          <XCircleIcon className="h-3 w-3 text-red-500 mr-1" />
                          No admin privileges
                        </li>
                        <li className="flex items-center">
                          <EnvelopeIcon className="h-3 w-3 text-blue-500 mr-1" />
                          Email verification required
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-900/30">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={() => handleModalSubmit(isAdmin)}
              className={`px-4 py-2 bg-gradient-to-r ${buttonGradient} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center text-sm`}
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 sticky top-0 z-20">
          <div className="px-4 md:px-6 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <ChevronRightIcon className="h-3 w-3 mx-1" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {activeTab === 'notifications' ? 'Notifications' : 
                     activeTab === 'profile' ? 'Profile' : 
                     'Admin Panel'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6">
          {saveMessage && (
            <div className={`mb-4 p-3 rounded-lg flex items-center ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">{saveMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Navigation */}
            <div className="lg:col-span-2">
              <nav className="space-y-1 lg:sticky lg:top-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-all text-sm ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-all text-sm"
                  >
                    {saving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-10 space-y-4 pb-8">
              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Communication Preferences
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Alerts', sub: 'Receive weekly summaries' },
                      { key: 'pushNotifications', label: 'Desktop Push', sub: 'Real-time browser notifications' },
                      { key: 'soundEnabled', label: 'Auditory Feedback', sub: 'Play sounds on new alerts' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={(notificationSettings as any)[item.key]} 
                            onChange={(e) => setNotificationSettings(p => ({...p, [item.key]: e.target.checked}))} 
                          />
                          <div className="w-10 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                      <div className="mt-2">
                        {renderRoleBadge(user?.role || 'USER')}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ADMIN TAB */}
              {activeTab === 'admin' && (
                <div className="space-y-4">
                  {/* Admin Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center">
                          <ShieldCheckIcon className="h-5 w-5 mr-2" />
                          Admin Panel
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">
                          Manage users and administrators
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          {users.length} total users
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Create User Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                            <UserPlusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              Create New User
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Add regular user accounts
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={openCreateUserModal}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                          title="Create New User"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        Create user accounts with basic access permissions and email verification.
                      </p>
                    </div>

                    {/* Create Admin Card (Super Admin Only) */}
                    {isUserSuperAdmin() && (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                              <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Create Administrator
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Add elevated access accounts
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={openCreateAdminModal}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                            title="Create New Admin"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Create admin or super admin accounts with full system access.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* User Management Section */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Search and Filters */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center">
                          <UsersIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          User Management
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                            {filteredUsers.length} users
                          </span>
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-9 pr-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                            />
                          </div>
                          
                          <div className="relative">
                            <FunnelIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                              value={roleFilter}
                              onChange={(e) => setRoleFilter(e.target.value)}
                              className="pl-9 pr-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                            >
                              <option value="all">All Roles</option>
                              <option value="user">Users</option>
                              <option value="admin">Admins</option>
                              <option value="superadmin">Super Admins</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Loading/Error/Empty States */}
                    {isLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading users...</p>
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded m-4 border border-red-200 dark:border-red-800">
                        <p className="flex items-center text-sm">
                          <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                          {error}
                        </p>
                        {error.includes('403') && (
                          <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Refresh page and try again
                          </button>
                        )}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <UsersIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {searchTerm || roleFilter !== 'all' 
                            ? 'No users match your search criteria'
                            : 'No users found'
                          }
                        </p>
                        {(searchTerm || roleFilter !== 'all') && (
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setRoleFilter('all');
                            }}
                            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" className="px-3 py-2">ID</th>
                              <th scope="col" className="px-3 py-2">User</th>
                              <th scope="col" className="px-3 py-2">Role</th>
                              <th scope="col" className="px-3 py-2">Status</th>
                              <th scope="col" className="px-3 py-2">Created</th>
                              <th scope="col" className="px-3 py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map(renderUserRow)}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Permissions Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 p-3 rounded-lg text-xs">
                    <div className="flex items-start">
                      <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Admin Permissions Guide</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="font-semibold">All Admins:</span>
                            <ul className="list-disc list-inside ml-2 mt-0.5">
                              <li>View all users</li>
                              <li>Create new users</li>
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold">Super Admins Only:</span>
                            <ul className="list-disc list-inside ml-2 mt-0.5">
                              <li>Create new admins</li>
                              <li>Change user roles</li>
                              <li>Delete users</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {renderCreateUserModal(false)}
      {renderCreateUserModal(true)}
    </div>
  );
};

export default SettingsPage;
