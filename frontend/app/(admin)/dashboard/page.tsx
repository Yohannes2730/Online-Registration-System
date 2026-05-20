'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { userAPI } from '@/lib/api-client';
import type { User } from '@/lib/auth-store';

interface UserStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userAPI.getAll();
        const users = response.data as User[];

        const newStats: UserStats = {
          total: users.length,
          pending: users.filter(u => u.status === 'pending').length,
          approved: users.filter(u => u.status === 'approved').length,
          rejected: users.filter(u => u.status === 'rejected').length,
        };

        setStats(newStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage user registrations and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-md">
            <p className="text-slate-600 text-sm mb-2">Total Users</p>
            <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <p className="text-slate-600 text-sm mb-2">Pending Approval</p>
            <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <p className="text-slate-600 text-sm mb-2">Approved</p>
            <p className="text-4xl font-bold text-green-600">{stats.approved}</p>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <p className="text-slate-600 text-sm mb-2">Rejected</p>
            <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Links</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/admin/users" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View All Users
            </a>
            <a 
              href="/admin/users?status=pending" 
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            >
              Review Pending Requests
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
