import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { Loader } from '../ui/Loader';

// Types
interface Enrollment {
    _id: string;
    user_id: { _id: string; username: string; email: string };
    course_id: { _id: string; title: string; price: number };
    package: string;
    amount_paid: number;
    status: string;
    createdAt: string;
    receipt_url: string;
    promo_code?: string;
}

interface AnalyticsData {
    totalRevenue: number;
    totalEnrollments: number;
    statusCounts: { active: number; pending: number; rejected: number; completed: number };
    packageCounts: { _id: string; count: number }[];
    coursePopularity: { title: string; count: number; revenue: number }[];
}

export default function EnrollmentAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSearch, setFilterSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, [filterStatus]); // Refresh table when filter changes

    // Re-fetch table on search (debounced ideally, but simple here)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEnrollments();
        }, 500);
        return () => clearTimeout(timer);
    }, [filterSearch]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchAnalytics(), fetchEnrollments()]);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        const { data } = await api.get('/courses/enrollments/analytics');
        setAnalytics(data);
    };

    const fetchEnrollments = async () => {
        // Construct query
        const query = new URLSearchParams();
        if (filterStatus !== 'all') query.append('status', filterStatus);
        if (filterSearch) query.append('search', filterSearch);

        const { data } = await api.get(`/courses/enrollments/all?${query.toString()}`);
        setEnrollments(data);
    };

    const PACKAGE_COLORS: Record<string, string> = {
        basic: '#FFFFFF',
        advanced: '#22c55e', // nexus-green
        premium: '#AA00FF',
    };

    if (loading && !analytics) return <Loader text="Loading Analytics..." />;

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`RM ${analytics?.totalRevenue.toLocaleString() || 0}`}
                    icon="mdi:cash-multiple"
                    color="text-green-400"
                    bg="from-green-500/10 to-transparent"
                />
                <StatCard
                    title="Total Enrollments"
                    value={analytics?.totalEnrollments || 0}
                    icon="mdi:account-group"
                    color="text-blue-400"
                    bg="from-blue-500/10 to-transparent"
                />
                <StatCard
                    title="Active Students"
                    value={analytics?.statusCounts.active || 0}
                    icon="mdi:school"
                    color="text-purple-400"
                    bg="from-purple-500/10 to-transparent"
                />
                <StatCard
                    title="Pending Requests"
                    value={analytics?.statusCounts.pending || 0}
                    icon="mdi:clipboard-clock"
                    color="text-yellow-400"
                    bg="from-yellow-500/10 to-transparent"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Courses Chart */}
                <div className="bg-nexus-card border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Top Courses by Revenue</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.coursePopularity || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" fontSize={12} stroke="#666" />
                                <YAxis dataKey="title" type="category" width={100} fontSize={12} stroke="#fff" tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    formatter={(value: any) => [`RM ${value}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#00C853" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Distribution Chart */}
                <div className="bg-nexus-card border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Package Distribution</h3>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.packageCounts || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(analytics?.packageCounts || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PACKAGE_COLORS[entry._id] || '#888'} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* All Enrollments Table */}
            <div className="bg-nexus-card border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-white">Enrollment History</h3>

                    <div className="flex gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search user..."
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-green w-full md:w-64"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                        />
                        <select
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-green"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-gray-200 font-medium">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Package</th>
                                <th className="px-6 py-4">Paid</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Promo Code</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 jus">
                            {enrollments.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">No enrollments match your filters.</td></tr>
                            ) : (
                                enrollments.map((enr) => (
                                    <tr key={enr._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{enr.user_id?.username || 'Unknown'}</div>
                                            <div className="text-xs">{enr.user_id?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white ">{enr.course_id?.title}</td>
                                        <td className="px-6 py-4 capitalize">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${enr.package === 'premium' ? 'border-purple-500 text-purple-400' :
                                                enr.package === 'advanced' ? 'border-nexus-green text-nexus-green' :
                                                    'border-white text-white'
                                                }`}>
                                                {enr.package}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white">RM {enr.amount_paid}</td>
                                        <td className="px-6 py-4 capitalize">
                                            <span className={`
                                                ${enr.status === 'active' ? 'text-green-400' :
                                                    enr.status === 'pending' ? 'text-yellow-400' :
                                                        enr.status === 'rejected' ? 'text-red-400' : 'text-blue-400'}
                                            `}>
                                                {enr.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {enr.promo_code ? (
                                                <span className="bg-nexus-green/10 text-nexus-green px-2 py-1 rounded text-xs border border-nexus-green/20 font-mono tracking-wider">
                                                    {enr.promo_code}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{new Date(enr.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex  group relative cursor-pointer" onClick={() => window.open(enr.receipt_url, '_blank')}>
                                                {enr.receipt_url === 'COUPON_FREE' ? (
                                                    <div className="w-24 h-8 flex items-center justify-center bg-nexus-green/10 border border-nexus-green/30 rounded text-xs text-nexus-green font-bold">
                                                        100% OFF
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img src={enr.receipt_url} className='w-24 h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity relative' />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ">
                                                            <Icon icon="mdi:eye" className="text-white text-2xl" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, bg }: any) {
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
