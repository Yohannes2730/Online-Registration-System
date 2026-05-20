import { UserSidebar } from '@/components/layout/user-sidebar';
import { ProtectedRoute } from '@/components/protected-route';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="user">
      <div className="flex h-screen bg-slate-50">
        <UserSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
