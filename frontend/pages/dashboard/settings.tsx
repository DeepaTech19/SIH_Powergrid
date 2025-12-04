import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import { useTheme } from '../../lib/theme';

export default function Settings() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@powergrid.in',
    department: 'Supply Chain'
  });
  const [settings, setSettings] = useState({
    language: 'English',
    emailNotif: true,
    stockAlerts: true,
    projectUpdates: false,
    autoSave: true,
    compactView: false
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdateProfile = () => {
    alert(`Profile updated successfully!\n\nName: ${profile.name}\nEmail: ${profile.email}\nDepartment: ${profile.department}`);
  };

  const handleSaveSettings = () => {
    alert(`Settings saved successfully!\n\nTheme: ${theme}\nLanguage: ${settings.language}\nNotifications: ${settings.emailNotif ? 'Enabled' : 'Disabled'}`);
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert('Please fill all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    alert('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleCheckUpdates = () => {
    alert('System is up to date!\n\nCurrent Version: 1.0.0\nLatest Version: 1.0.0\nNo updates available.');
  };

  const handleExportData = () => {
    alert('Data export initiated!\n\nYour data will be exported as JSON and downloaded shortly.');
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the application cache? This may log you out.')) {
      alert('Cache cleared successfully!');
    }
  };
  return (
    <>
      <Head>
        <title>Settings - POWERGRID</title>
      </Head>

      <DashboardLayout title="Settings">
        <div className="fade-in">
          {/* Theme Selector - Full Width Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">🎨 Appearance</h2>
                <p className="text-sm text-slate-600">Customize your workspace theme</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Light Theme */}
              <button
                onClick={() => setTheme('light')}
                className={`relative p-8 rounded-xl border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="mb-4">
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-white to-slate-100 border border-slate-200 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-300 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">Light</h3>
                  <p className="text-sm text-slate-600">Clean & minimal design</p>
                </div>
                {theme === 'light' && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </button>

              {/* Dark Theme */}
              <button
                onClick={() => setTheme('dark')}
                className={`relative p-8 rounded-xl border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-teal-500 bg-teal-50 shadow-lg' 
                    : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                }`}
              >
                <div className="mb-4">
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">Dark</h3>
                  <p className="text-sm text-slate-600">Easy on the eyes</p>
                </div>
                {theme === 'dark' && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700">
                <strong>Current Theme:</strong> <span className="capitalize font-semibold text-blue-600">{theme}</span> - 
                Your theme preference is saved automatically and will persist across sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">👤</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Profile Settings</h2>
                  <p className="text-sm text-slate-600">Manage your account information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="your.email@powergrid.in"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <select 
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  >
                    <option>Supply Chain</option>
                    <option>Procurement</option>
                    <option>Operations</option>
                    <option>Management</option>
                    <option>Finance</option>
                    <option>IT & Systems</option>
                  </select>
                </div>

                <button onClick={handleUpdateProfile} className="btn btn-primary w-full mt-4">
                  ✓ Update Profile
                </button>
              </div>
            </div>

            {/* Application Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">⚙️</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Application Settings</h2>
                  <p className="text-sm text-slate-600">Preferences and notifications</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Language
                  </label>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="text-slate-700 font-medium">Email notifications</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.emailNotif}
                        onChange={(e) => setSettings({...settings, emailNotif: e.target.checked})}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400" 
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="text-slate-700 font-medium">Low stock alerts</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.stockAlerts}
                        onChange={(e) => setSettings({...settings, stockAlerts: e.target.checked})}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400" 
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="text-slate-700 font-medium">Project updates</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.projectUpdates}
                        onChange={(e) => setSettings({...settings, projectUpdates: e.target.checked})}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400" 
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Preferences
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="text-slate-700 font-medium">Auto-save drafts</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.autoSave}
                        onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400" 
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <span className="text-slate-700 font-medium">Compact view</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.compactView}
                        onChange={(e) => setSettings({...settings, compactView: e.target.checked})}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400" 
                      />
                    </label>
                  </div>
                </div>

                <button onClick={handleSaveSettings} className="btn btn-primary w-full mt-4">
                  💾 Save Settings
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">🔒</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Security</h2>
                  <p className="text-sm text-slate-600">Change your password</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-amber-800">
                    <strong>Password Requirements:</strong> Minimum 6 characters. Use a mix of letters, numbers, and symbols for better security.
                  </p>
                </div>

                <button onClick={handleChangePassword} className="btn btn-secondary w-full mt-4">
                  🔑 Change Password
                </button>
              </div>
            </div>

            {/* System Info & Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">ℹ️</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">System Information</h2>
                  <p className="text-sm text-slate-600">Version and status</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Version:</span>
                  <span className="font-semibold text-slate-800">1.0.0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Last Updated:</span>
                  <span className="font-semibold text-slate-800">Dec 2025</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Database:</span>
                  <span className="font-semibold text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">AI Model:</span>
                  <span className="font-semibold text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Active
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={handleCheckUpdates} className="btn btn-outline w-full">
                  🔄 Check for Updates
                </button>
                <button onClick={handleExportData} className="btn btn-outline w-full">
                  📥 Export Data
                </button>
                <button onClick={handleClearCache} className="btn btn-outline w-full text-orange-600 hover:bg-orange-50">
                  🗑️ Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
