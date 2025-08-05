import { Sidebar } from './Sidebar';
import { useSidebarStore } from '../store/useSidebarStore';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="container mx-auto px-4 lg:px-6 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
