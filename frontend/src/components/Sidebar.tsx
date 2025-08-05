import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Video, Home, Plus, Menu, X, PlayCircle, Settings } from 'lucide-react';
import { useSidebarStore } from '../store/useSidebarStore';

export function Sidebar() {
  const location = useLocation();
  const { isCollapsed, isMobileMenuOpen, toggleCollapsed, setMobileMenuOpen, toggleMobileMenu } = useSidebarStore();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/record', icon: Plus, label: 'Record' },
    { path: '/dashboard/videos', icon: PlayCircle, label: 'My Videos' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-150"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out bg-white border-r border-gray-200 z-50 transform shadow-sm ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${isCollapsed ? 'lg:w-16 w-16' : 'lg:w-64 w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo and Collapse Button */}
          <div className={`flex items-center border-b border-gray-200/60 ${isCollapsed ? 'p-4 justify-center' : 'p-6 justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900 tracking-tight">ScreenForge</span>
              </div>
            )}
            {isCollapsed && (
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
            )}
            {/* Desktop collapse button */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors duration-150"
            >
              {isCollapsed ? (
                <Menu className="h-4 w-4 text-gray-500" />
              ) : (
                <X className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center rounded-md text-sm font-medium transition-all duration-150 ${
                        isCollapsed ? 'p-2 justify-center' : 'px-3 py-2 space-x-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border-r-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`flex-shrink-0 transition-colors duration-150 ${
                        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      } ${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200/60 p-4">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 rounded-md",
                    userButtonPopoverCard: "shadow-lg border-gray-200",
                    userButtonPopoverActionButton: "hover:bg-gray-50"
                  }
                }}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate">
                    Account
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    Manage settings
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
