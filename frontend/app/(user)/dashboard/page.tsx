'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuthStore();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending: '🟡',
    approved: '🟢',
    rejected: '🔴',
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user?.name}</p>
        </div>

        {/* Account Status Card */}
        <Card className="mb-8 p-6 border-0 shadow-md">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-2">Current Status</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{statusIcons[user?.status || 'pending']}</span>
                <Badge className={statusColors[user?.status || 'pending']}>
                  {user?.status?.charAt(0).toUpperCase()}{user?.status?.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Account Type</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{user?.role} Account</p>
            </div>
          </div>

          {user?.status === 'pending' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your account is pending approval. An administrator will review your registration shortly.
              </p>
            </div>
          )}

          {user?.status === 'rejected' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Your account registration was not approved. Please contact support for more information.
              </p>
            </div>
          )}

          {user?.status === 'approved' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Your account is approved and fully active.
              </p>
            </div>
          )}
        </Card>

        {/* Profile Overview */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Full Name</p>
              <p className="text-lg text-slate-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Email Address</p>
              <p className="text-lg text-slate-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Member Since</p>
              <p className="text-lg text-slate-900">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Link href="/user/profile">
              <Button>Edit Profile</Button>
            </Link>
          </div>
        </Card>

        {user?.status !== 'approved' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 text-sm">
              You can view limited dashboard features. Full access will be available once your account is approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
