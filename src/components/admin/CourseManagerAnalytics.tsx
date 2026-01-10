import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { Loader } from '../ui/Loader';

// Types
interface CourseGlobalAnalytics {
    totalCourses: number;
    totalStudents: number;
    statusCounts: { ongoing?: number; complete?: number };
    categoryCounts: { name: string; value: number }[];
    levelCounts: { name: string; count: number }[];
}

export default function CourseManagerAnalytics() {
    const [analytics, setAnalytics] = useState<CourseGlobalAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/courses/admin/analytics');
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load course analytics", error);
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

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Course Overview</h2>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Courses"
                    value={analytics.totalCourses}
                    icon="mdi:book-open-page-variant"
                    color="text-blue-500"
                    gradient="from-blue-500 to-indigo-500"
                />
                <StatCard
                    title="Total Students"
                    value={analytics.totalStudents}
                    icon="mdi:account-school"
                    color="text-nexus-green"
                    gradient="from-nexus-green to-emerald-600"
                />
                <StatCard
                    title="Published (Ongoing)"
                    value={analytics.statusCounts.ongoing || 0}
                    icon="mdi:play-circle-outline"
                    color="text-purple-500"
                    gradient="from-purple-500 to-pink-500"
                />
                <StatCard
                    title="Completed Courses"
                    value={analytics.statusCounts.complete || 0}
                    icon="mdi:check-circle-outline"
                    color="text-yellow-500"
                    gradient="from-yellow-500 to-orange-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-nexus-card border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Courses by Category</h3>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.categoryCounts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.categoryCounts.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Level Distribution */}
                <div className="bg-nexus-card border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Courses by Level</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.levelCounts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                <YAxis stroke="#fff" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Bar dataKey="count" fill="#00C853" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
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
