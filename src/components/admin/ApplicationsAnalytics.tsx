import { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { Loader } from '../ui/Loader';

// Types
interface TutorAnalyticsData {
    totalApplications: number;
    statusCounts: { pending: number; approved: number; rejected: number };
    specializationCounts: { name: string; value: number }[];
    growthData: { name: string; count: number }[];
}

export default function ApplicationsAnalytics() {
    const [analytics, setAnalytics] = useState<TutorAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/tutors/admin/analytics');
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load tutor analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#00C853', '#0091EA', '#AA00FF', '#FFD600', '#FF3D00'];

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader text="Loading Analytics" />
        </div>
    );
    if (!analytics) return <div className="text-white text-center py-20">Failed to load data.</div>;

    const approvalRate = analytics.totalApplications > 0
        ? Math.round((analytics.statusCounts.approved / analytics.totalApplications) * 100)
        : 0;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Application Metrics</h2>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Applications"
                    value={analytics.totalApplications}
                    icon="mdi:file-document-multiple"
                    color="text-blue-500"
                    gradient="from-blue-500 to-indigo-500"
                />
                <StatCard
                    title="Pending Review"
                    value={analytics.statusCounts.pending}
                    icon="mdi:clipboard-clock"
                    color="text-yellow-500"
                    gradient="from-yellow-500 to-orange-500"
                />
                <StatCard
                    title="Active Tutors"
                    value={analytics.statusCounts.approved}
                    icon="mdi:teach"
                    color="text-nexus-green"
                    gradient="from-nexus-green to-emerald-600"
                />
                <StatCard
                    title="Approval Rate"
                    value={`${approvalRate}%`}
                    icon="mdi:percent"
                    color="text-purple-500"
                    gradient="from-purple-500 to-pink-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Specialization Distribution */}
                <div className="bg-nexus-card border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Tutor Specializations</h3>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.specializationCounts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.specializationCounts.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-nexus-card border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Application Trends (6 Months)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.growthData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                <YAxis stroke="#fff" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component (Reusable / Consistent with AccountsAnalytics)
const StatCard = ({ title, value, icon, color, gradient }: any) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-nexus-black border border-white/5 p-6 group"
    >
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

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


function StatCardOld({ title, value, icon, color, bg }: any) {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-nexus-card border border-white/5 p-6`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-50`} />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <Icon icon={icon} className={`text-2xl ${color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
}
