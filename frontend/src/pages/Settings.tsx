import { Settings, User, Bell, Shield, Download, Eye } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and recording settings
        </p>
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
          </div>
          <p className="text-gray-600 text-sm">Update your personal information and preferences</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <p className="text-gray-600 text-sm">Configure how you receive notifications about your videos</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
          </div>
          <p className="text-gray-600 text-sm">Control who can view and access your recordings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Download className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Recording</h3>
          </div>
          <p className="text-gray-600 text-sm">Set default recording quality and download options</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Eye className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Sharing</h3>
          </div>
          <p className="text-gray-600 text-sm">Configure default sharing permissions and link settings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Advanced</h3>
          </div>
          <p className="text-gray-600 text-sm">Advanced settings and integrations</p>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings page coming soon</h3>
        <p className="text-gray-600">This page will allow you to configure all aspects of your ScreenForge experience.</p>
      </div>
    </div>
  );
}
