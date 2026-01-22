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
  SparklesIcon
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

  // API Base URL - FIXED: Backend runs on port 3001
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Helper functions for role checks - FIXED: Handle both uppercase and lowercase
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

  // Add admin tab if user is admin - FIXED: Use helper function
  if (isUserAdmin()) {
    tabs.push({ id: 'admin', label: 'Admin', icon: ShieldCheckIcon });
  }

  // ========== REAL API FUNCTIONS ==========

  // 1. FETCH USERS FROM BACKEND - FIXED: Use correct API URL
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

  // 2. CREATE USER - FIXED: Use correct API URL
  // Update your createUser function to log more details
const createUser = async (userData: typeof formData) => {
  if (!token) {
    toast.error('Please login first');
    return;
  }

  try {
    console.log('📤 Creating user:', userData.email);
    console.log('🔐 Using token:', token.substring(0, 30) + '...');
    
    // Decode and log the token payload
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔐 Current user role from JWT:', payload.role);
        console.log('🔐 Current user ID:', payload.sub);
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    
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
    console.log('📡 Response headers:', Object.fromEntries([...response.headers]));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Full error response:', errorText);
      
      // Try to parse JSON error
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Parsed error:', errorData);
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

  // 3. CREATE ADMIN - FIXED: Use correct API URL
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
          role: adminData.role.toLowerCase() // Backend expects lowercase
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        // Try to parse JSON error
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

  // 4. UPDATE USER ROLE - FIXED: Use correct API URL
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
        body: JSON.stringify({ role: role.toLowerCase() }) // Backend expects lowercase
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
    fetchUsers(); // Refresh list
    
  } catch (error: any) {
    console.error('❌ Error verifying user:', error);
    toast.error(error.message || 'Failed to verify user');
  }
};

// Add a direct verify function (without sending email)
const markUserAsVerified = async (userId: string) => {
  if (!token) {
    toast.error('Please login first');
    return;
  }

  try {
    console.log('📤 Marking user as verified:', userId);
    
    // You need to create this endpoint in your backend
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
    fetchUsers(); // Refresh list
    
  } catch (error: any) {
    console.error('❌ Error marking user as verified:', error);
    toast.error(error.message || 'Failed to verify user');
  }
};

  // 5. DELETE USER - FIXED: Use correct API URL
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
      fetchUsers(); // Refresh list
      
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
  const renderRoleBadge = (role: string) => {
    const roleLower = role.toLowerCase();
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        roleLower === 'superadmin' 
          ? 'bg-purple-500/10 text-purple-500' 
          : roleLower === 'admin'
            ? 'bg-blue-500/10 text-blue-500'
            : 'bg-secondary/10 text-secondary'
      }`}>
        <ShieldCheckIcon className="h-3 w-3 mr-1" />
        {roleLower === 'superadmin' ? 'Super Admin' : 
         roleLower === 'admin' ? 'Admin' : 'User'}
      </span>
    );
  };

  const renderUserRow = (userItem: AdminUser) => {
    const currentUserId = user?.id;
    const isCurrentUser = currentUserId === userItem.id;
    
    return (
      <tr key={userItem.id} className="border-b border-color hover:bg-hover/30 transition-colors">
        <td className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-blue-600 to-blue-600 flex items-center justify-center text-white font-bold">
              {userItem.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-primary">{userItem.name}</p>
              <p className="text-sm text-secondary">{userItem.email}</p>
            </div>
          </div>
        </td>
        <td className="p-4">{renderRoleBadge(userItem.role)}</td>
        <td className="p-4">
          <div className="flex items-center">
            {userItem.isVerified ? (
              <div className="flex items-center text-green-500">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span>Verified</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <div className="h-5 w-5 rounded-full border-2 border-yellow-500 mr-2 flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
                <span>Pending</span>
              </div>
            )}
          </div>
        </td>
        <td className="p-4 text-secondary text-sm">
          {formatDate(userItem.createdAt)}
        </td>
        <td className="p-4">
          <div className="flex items-center space-x-2">
            {/* Change Role (Super Admin only, can't modify self) */}
            {isUserSuperAdmin() && !isCurrentUser && (
              <select
                value={userItem.role}
                onChange={(e) => updateUserRole(userItem.id, e.target.value as 'USER' | 'ADMIN' | 'SUPERADMIN')}
                className="bg-primary border border-color rounded-lg px-3 py-1.5 text-sm text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCurrentUser}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPERADMIN">Super Admin</option>
              </select>
            )}

            // Add this section to your admin tab
{isUserSuperAdmin() && (
  <div className="bg-card border border-color rounded-2xl p-6">
    <h4 className="font-bold text-lg text-primary mb-4 flex items-center">
      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
      User Verification Management
    </h4>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Send verification to all unverified */}
      <button
        onClick={async () => {
          const unverifiedUsers = users.filter(u => !u.isVerified);
          if (unverifiedUsers.length === 0) {
            toast.success('All users are already verified!');
            return;
          }
          
          if (confirm(`Send verification emails to ${unverifiedUsers.length} unverified users?`)) {
            for (const user of unverifiedUsers) {
              await verifyUser(user.id);
              await new Promise(resolve => setTimeout(resolve, 500)); // Delay between emails
            }
            toast.success(`Verification emails sent to ${unverifiedUsers.length} users!`);
          }
        }}
        className="p-4 border border-color rounded-xl hover:border-blue-500 transition-colors flex items-center justify-between"
      >
        <div>
          <p className="font-medium text-primary">Send to All Unverified</p>
          <p className="text-sm text-secondary">Email all pending users</p>
        </div>
        <EnvelopeIcon className="h-5 w-5 text-blue-500" />
      </button>
      
      {/* Mark all as verified */}
      <button
        onClick={async () => {
          const unverifiedUsers = users.filter(u => !u.isVerified);
          if (unverifiedUsers.length === 0) {
            toast.success('All users are already verified!');
            return;
          }
          
          if (confirm(`Mark ${unverifiedUsers.length} users as verified without email?`)) {
            // This would require the backend endpoint from Method 3
           toast('This feature requires backend implementation', {
  icon: 'ℹ️',
  duration: 4000
});
          }
        }}
        className="p-4 border border-color rounded-xl hover:border-green-500 transition-colors flex items-center justify-between"
      >
        <div>
          <p className="font-medium text-primary">Verify All Instantly</p>
          <p className="text-sm text-secondary">Mark all as verified</p>
        </div>
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      </button>
    </div>
  </div>
)}

            {/* Delete User (Super Admin only, can't delete self) */}
            {isUserSuperAdmin() && !isCurrentUser && (
              <button
                onClick={() => deleteUser(userItem.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete User"
                disabled={isCurrentUser}
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
        <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-color">
          {/* Modal Header */}
          <div className={`px-6 py-4 border-b border-color flex justify-between items-center bg-linear-to-r ${headerGradient} text-white`}>
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                {isAdmin ? (
                  <ShieldCheckIcon className="h-5 w-5" />
                ) : (
                  <UserPlusIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-blue-100 text-sm">{description}</p>
              </div>
            </div>
            <button 
              onClick={() => setModalOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">
                <span className="flex items-center">
                  Email Address
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={isAdmin ? "admin@example.com" : "user@example.com"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-color bg-primary text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">
                <span className="flex items-center">
                  Full Name
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={isAdmin ? "Admin User" : "John Doe"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-color bg-primary text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">
                <span className="flex items-center">
                  Password
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-secondary" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-color bg-primary text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center mt-2">
                <div className="h-1 flex-1 bg-secondary/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      formData.password.length >= 12 ? 'bg-green-500' :
                      formData.password.length >= 8 ? 'bg-yellow-500' :
                      formData.password.length > 0 ? 'bg-red-500' : ''
                    }`}
                    style={{ width: `${Math.min((formData.password.length / 12) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-secondary ml-3">
                  {formData.password.length >= 12 ? 'Strong' :
                   formData.password.length >= 8 ? 'Good' :
                   formData.password.length > 0 ? 'Weak' : ''}
                </span>
              </div>
              <p className="text-xs text-secondary mt-1">
                Minimum 8 characters with letters and numbers
              </p>
            </div>
            
            {/* Role Selection (Admin creation only) */}
            {isAdmin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary">
                  <span className="flex items-center">
                    Admin Role
                    <span className="ml-1 text-red-500">*</span>
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ADMIN', 'SUPERADMIN'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`p-4 rounded-xl border transition-all ${
                        formData.role === role
                          ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow-lg'
                          : 'border-color text-secondary hover:bg-hover hover:border-green-500/50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {role === 'SUPERADMIN' ? (
                          <ShieldCheckIcon className="h-6 w-6 mb-2" />
                        ) : (
                          <UserGroupIcon className="h-6 w-6 mb-2" />
                        )}
                        <span className="font-medium">
                          {role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                        </span>
                        <span className="text-xs opacity-75 mt-1">
                          {role === 'SUPERADMIN' ? 'Full system access' : 'Limited admin access'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Permissions Info Box */}
            <div className={`${isAdmin ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-500/10 border-blue-500/20'} rounded-xl p-4`}>
              <div className="flex items-start">
                <ShieldCheckIcon className={`h-5 w-5 mr-2 mt-0.5 shrink-0 ${isAdmin ? 'text-green-500' : 'text-blue-500'}`} />
                <div>
                  <p className="text-sm font-medium text-primary mb-1">
                    {isAdmin ? 'Admin Permissions' : 'User Permissions'}
                  </p>
                  <ul className="text-xs text-secondary space-y-1">
                    {isAdmin ? (
                      <>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                          Full dashboard access
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                          User management
                        </li>
                        {formData.role === 'SUPERADMIN' && (
                          <>
                            <li className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                              Create other admins
                            </li>
                            <li className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                              Full system control
                            </li>
                          </>
                        )}
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                          Auto-verified account
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                          Basic dashboard access
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2" />
                          View notifications
                        </li>
                        <li className="flex items-center">
                          <XCircleIcon className="h-3 w-3 text-red-500 mr-2" />
                          No admin privileges
                        </li>
                        <li className="flex items-center">
                          <EnvelopeIcon className="h-3 w-3 text-blue-500 mr-2" />
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
          <div className="px-6 py-4 border-t border-color flex justify-end space-x-3 bg-hover/30">
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-color text-primary rounded-xl font-medium hover:bg-hover transition-colors flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={() => handleModalSubmit(isAdmin)}
              className={`px-6 py-2.5 bg-linear-to-r ${buttonGradient} text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center shadow-lg hover:shadow-xl`}
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-card border-b border-color shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center text-sm text-secondary mb-1">
                  <ChevronRightIcon className="h-3 w-3 mx-2" />
                  <span className="text-blue-600 font-medium">Settings</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-center ${
              saveMessage.type === 'success' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {saveMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <nav className="space-y-2 lg:sticky lg:top-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-secondary hover:bg-hover'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                
                <div className="pt-4 mt-6 border-t border-color">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-all"
                  >
                    {saving ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </nav>
            </div>

            <div className="lg:col-span-9 space-y-6 pb-12">
              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <section className="bg-card border border-color rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Communication Preferences
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Alerts', sub: 'Receive weekly summaries' },
                      { key: 'pushNotifications', label: 'Desktop Push', sub: 'Real-time browser notifications' },
                      { key: 'soundEnabled', label: 'Auditory Feedback', sub: 'Play sounds on new alerts' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-color hover:border-blue-500/50 transition-colors">
                        <div>
                          <p className="font-semibold text-primary">{item.label}</p>
                          <p className="text-xs text-secondary">{item.sub}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={(notificationSettings as any)[item.key]} 
                            onChange={(e) => setNotificationSettings(p => ({...p, [item.key]: e.target.checked}))} 
                          />
                          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <section className="bg-card border border-color rounded-2xl p-8">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="h-15 w-15 rounded-2xl bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary">{user?.name || 'User'}</h4>
                      <p className="text-secondary text-sm">{user?.email}</p>
                      <div className="mt-2">
                        {renderRoleBadge(user?.role || 'user')}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ADMIN TAB */}
              {activeTab === 'admin' && (
                <div className="space-y-6">
                  {/* Admin Header */}
                  <div className="bg-linear-to-r from-blue-700 to-blue-700 text-white p-4 rounded-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold flex items-center">
                          <ShieldCheckIcon className="h-6 w-6 mr-2" />
                          Admin Panel
                        </h3>
                        <p className="text-blue-100 mt-1">
                          Manage users and administrators
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          {users.length} total users
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create User Card */}
                    <div className="bg-card border border-color rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
                      {/* Gradient background effect */}
                      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center">
                          <div className="p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <UserPlusIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary text-lg">
                              Create New User
                            </h4>
                            <p className="text-sm text-secondary mt-1">
                              Add regular user accounts
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={openCreateUserModal}
                          className="p-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                          title="Create New User"
                        >
                          <PlusIcon className="h-5 w-5 group-hover/btn:rotate-90 transition-transform duration-300" />
                        </button>
                      </div>
                      <div className="relative z-10">
                        <p className="text-secondary text-sm mb-3">
                          Create user accounts with basic access permissions and email verification.
                        </p>
                        <div className="flex items-center text-xs text-blue-500 font-medium">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Available to all administrators
                        </div>
                      </div>
                    </div>

                    {/* Create Admin Card (Super Admin Only) */}
                    {isUserSuperAdmin() && (
                      <div className="bg-card border border-color rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
                        {/* Gradient background effect */}
                        <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="flex items-center">
                            <div className="p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <ShieldCheckIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary text-lg">
                                Create Administrator
                              </h4>
                              <p className="text-sm text-secondary mt-1">
                                Add elevated access accounts
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={openCreateAdminModal}
                            className="p-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                            title="Create New Admin"
                          >
                            <PlusIcon className="h-5 w-5 group-hover/btn:rotate-90 transition-transform duration-300" />
                          </button>
                        </div>
                        <div className="relative z-10">
                          <p className="text-secondary text-sm mb-3">
                            Create admin or super admin accounts with full system access.
                          </p>
                          <div className="flex items-center text-xs text-green-500 font-medium">
                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                            Super Admin access required
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Management Section */}
                  <div className="bg-card border border-color rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h4 className="font-bold text-lg text-primary flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        User Management
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                          {filteredUsers.length} users
                        </span>
                      </h4>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                          <input 
                            type="text" 
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-primary border border-color rounded-xl text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          />
                        </div>
                        
                        <div className="relative">
                          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-primary border border-color rounded-xl text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="admin">Admins</option>
                            <option value="superadmin">Super Admins</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Loading/Error/Empty States */}
                    {isLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-secondary">Loading users...</p>
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                        <p className="flex items-center">
                          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                          {error}
                        </p>
                        {error.includes('403') && (
                          <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                          >
                            Refresh page and try again
                          </button>
                        )}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <UsersIcon className="h-12 w-12 text-secondary mx-auto mb-4" />
                        <p className="text-secondary">
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
                            className="mt-2 text-blue-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-color">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-hover text-left text-secondary text-sm">
                              <th className="p-4 font-medium border-b border-color">User</th>
                              <th className="p-4 font-medium border-b border-color">Role</th>
                              <th className="p-4 font-medium border-b border-color">Status</th>
                              <th className="p-4 font-medium border-b border-color">Joined</th>
                              <th className="p-4 font-medium border-b border-color">Actions</th>
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
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl">
                    <div className="flex items-start">
                      <ShieldCheckIcon className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Admin Permissions Guide</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="font-semibold">All Admins:</span>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              <li>View all users</li>
                              <li>Create new users</li>
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold">Super Admins Only:</span>
                            <ul className="list-disc list-inside ml-2 mt-1">
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