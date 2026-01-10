import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { Loader } from '../ui/Loader';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, gradient }: any) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-[#09090b] border border-white/5 p-6 group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

        <div className="relative z-10 flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-4xl font-black text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors ${color}`}>
                <Icon icon={icon} width="28" />
            </div>
        </div>

        {/* Decorative background element */}
        <Icon icon={icon} className={`absolute -bottom-4 -right-4 text-[100px] opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-700 ${color}`} />
    </motion.div>
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

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader text="Loading Analytics" />
        </div>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Population"
                    value={stats.total}
                    icon="mdi:account-group"
                    color="text-blue-500"
                    gradient="from-blue-500 to-indigo-500"
                />
                <StatCard
                    title="Active Students"
                    value={stats.students}
                    icon="mdi:school"
                    color="text-nexus-green"
                    gradient="from-nexus-green to-emerald-600"
                />
                <StatCard
                    title="Tutor Faculty"
                    value={stats.tutors}
                    icon="mdi:teach"
                    color="text-purple-500"
                    gradient="from-purple-500 to-pink-500"
                />
                <StatCard
                    title="Suspended Accounts"
                    value={stats.inactive}
                    icon="mdi:account-off"
                    color="text-red-500"
                    gradient="from-red-500 to-orange-500"
                />
            </div>
        </div>
    );
}
