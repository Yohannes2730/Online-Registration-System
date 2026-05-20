import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { ProtectedRoute } from '@/components/protected-route';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
