import { DashboardStats } from '@/components/server/DashboardStats';

// Força renderização dinâmica para evitar erro de prerender
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return <DashboardStats />;
}