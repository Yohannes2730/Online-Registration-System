'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Home, Users, BarChart3 } from 'lucide-react';

export function AdminSidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-slate-900 text-white rounded"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 h-screen w-64 bg-slate-900 text-white 
        transform transition-transform duration-200 z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">RegSystem</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Portal</p>
        </div>

        <nav className="p-6 space-y-2">
          <Link 
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
          >
            <Users size={20} />
            <span>Manage Users</span>
          </Link>

          <Link 
            href="/admin/users?status=pending"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
          >
            <Home size={20} />
            <span>Pending Approvals</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
        />
      )}
    </>
  );
}
