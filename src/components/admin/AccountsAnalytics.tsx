import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { FullScreenLoader } from '../ui/Loader';

const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-nexus-card p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-nexus-green/30 transition-all">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
            <Icon icon={icon} width="64" className={color} />
        </div>
        <div className="relative z-10">
            <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    </div>
);

export default function AccountsAnalytics() {
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        tutors: 0,
        students: 0,
        active: 0,
        inactive: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // For now, we calculate from the full list. Ideally, backend should provide a stats endpoint.
                // Reusing the same list endpoint to keep it simple as per plan.
                const { data } = await api.get('/user/admin/users');

                const s = {
                    total: data.length,
                    admins: data.filter((u: any) => u.role === 'admin').length,
                    tutors: data.filter((u: any) => u.role === 'tutor').length,
                    students: data.filter((u: any) => u.role === 'student').length,
                    active: data.filter((u: any) => u.is_active).length,
                    inactive: data.filter((u: any) => !u.is_active).length
                };
                setStats(s);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <FullScreenLoader />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.total}
                    icon="mdi:account-group"
                    color="text-blue-500"
                />
                <StatCard
                    title="Active Students"
                    value={stats.students}
                    icon="mdi:school"
                    color="text-nexus-green"
                />
                <StatCard
                    title="Tutors"
                    value={stats.tutors}
                    icon="mdi:teach"
                    color="text-purple-500"
                />
                <StatCard
                    title="Inactive Accounts"
                    value={stats.inactive}
                    icon="mdi:account-off"
                    color="text-red-500"
                />
            </div>

            {/* Visual Breakdown could go here (Pie charts etc) */}
        </div>
    );
}
