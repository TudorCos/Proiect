import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 bg-zinc-900/30">
        <Outlet />
      </main>
    </div>
  );
}
