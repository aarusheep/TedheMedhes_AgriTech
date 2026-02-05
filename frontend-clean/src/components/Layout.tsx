import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWalletContext } from '../context/WalletContext';
import { Button } from '@/ui';
import { 
  LogOut, 
  Wallet, 
  Home, 
  Package, 
  ShoppingCart, 
  Bell, 
  PlusCircle,
  History,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export function Layout() {
  const { user, logout } = useAuth();
  const { address, isConnected, connect, disconnect } = useWalletContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleWalletToggle = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  const farmerNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: PlusCircle, label: 'Create Post', path: '/create-post' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Package, label: 'My Products', path: '/dashboard' },
  ];

  const distributorNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'Browse Products', path: '/browse' },
    { icon: Package, label: 'My Owned Products', path: '/owned-products' },
    { icon: History, label: 'Order History', path: '/order-history' },
    { icon: Package, label: 'Selling Products', path: '/selling-products' },
  ];

  const navItems = user?.role === 'Farmer' ? farmerNavItems : distributorNavItems;

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 className="size-8 text-green-600" />
            <div>
              <h1 className="font-semibold text-xl">Farm Traceability</h1>
              <p className="text-sm text-gray-600">{user?.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Wallet Status */}
            <Button
              variant={isConnected ? 'default' : 'outline'}
              onClick={handleWalletToggle}
              className="flex items-center gap-2"
            >
              <Wallet className="size-4" />
              {isConnected ? (
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </Button>

            {/* User Info */}
            <div className="text-right">
              <p className="font-medium">{user?.name || user?.mobile}</p>
              <p className="text-sm text-gray-600">{user?.mobile}</p>
            </div>

            {/* Logout */}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <item.icon className="size-5 text-gray-600" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}