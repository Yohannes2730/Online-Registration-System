'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">RegSystem</div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline">Admin Dashboard</Button>
                  </Link>
                )}
                {user?.role === 'user' && (
                  <Link href="/user/dashboard">
                    <Button variant="outline">User Dashboard</Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Create Account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 text-balance">
            User Registration System
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto text-balance">
            A modern, secure platform for user registration with role-based access control. 
            Streamlined approval workflow for administrators.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-20">
          <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
            <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Easy Registration</h3>
            <p className="text-slate-600">
              Simple and secure registration process using BetterAuth authentication.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
            <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Role-Based Access</h3>
            <p className="text-slate-600">
              Different access levels for admin and user roles with secure routing.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200">
            <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Admin Dashboard</h3>
            <p className="text-slate-600">
              Manage users, approve registrations, and monitor system activity.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
