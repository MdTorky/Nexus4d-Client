import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../ui/Loader';

type TutorApplication = {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
    specialization: string;
    bio: string;
    profile_picture_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
};

export default function ApplicationsList() {
    const { showToast } = useToast();
    const [applications, setApplications] = useState<TutorApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/tutors/admin/applications');
            setApplications(res.data);
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch applications', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.post('/tutors/admin/approve', { application_id: id });
            showToast('Application Approved!', 'success');
            setApplications(prev => prev.map(app => app._id === id ? { ...app, status: 'approved' } : app));
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to approve', 'error');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.post('/tutors/admin/reject', { application_id: id, admin_notes: 'Rejected by admin' });
            showToast('Application Rejected', 'info');
            setApplications(prev => prev.map(app => app._id === id ? { ...app, status: 'rejected' } : app));
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to reject', 'error');
        }
    };

    if (isLoading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader text="Loading Applications" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">
                <div className="p-3 rounded-xl bg-nexus-green/10 border border-nexus-green/20">
                    <Icon icon="mdi:school-outline" className="text-2xl text-nexus-green" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Tutor Applications</h2>
                    <p className="text-gray-400 text-sm">Review incoming requests from potential instructors.</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-20 bg-nexus-card/30 rounded-2xl border border-white/5 border-dashed">
                    <Icon icon="mdi:clipboard-text-off-outline" className="mx-auto text-6xl text-gray-600 mb-4" />
                    <p className="text-gray-500">No applications found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {applications.map((app, index) => (
                            <motion.div
                                key={app._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8 hover:border-nexus-green/30 transition-all duration-300"
                            >
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                    {/* Avatar Column */}
                                    <div className="shrink-0 flex flex-col items-center gap-4">
                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-white/20 to-transparent border border-white/10 relative">
                                            <img
                                                src={app.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${app.full_name}`}
                                                alt={app.full_name}
                                                className="w-full h-full rounded-full object-cover bg-black"
                                            />
                                            <div className="absolute bottom-0 right-0 p-1.5 bg-[#09090b] rounded-full border border-white/10 text-nexus-green">
                                                <Icon icon="mdi:account-school" className="text-sm" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    app.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {app.status}
                                            </span>
                                            <span className="mt-2 text-xs text-gray-500 font-mono">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-2xl font-bold text-white group-hover:text-nexus-green transition-colors">{app.full_name}</h3>
                                            </div>
                                            <p className="text-nexus-green font-medium flex items-center gap-2">
                                                <Icon icon="mdi:brain" />
                                                {app.specialization}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Icon icon="mdi:email" className="text-gray-500" />
                                                {app.email}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Icon icon="mdi:phone" className="text-gray-500" />
                                                {app.phone}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applicant Bio</p>
                                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line border-l-2 border-white/10 pl-4">
                                                "{app.bio}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions Column */}
                                    {app.status === 'pending' && (
                                        <div className="flex md:flex-col justify-end gap-3 shrink-0 min-w-[140px]">
                                            <button
                                                onClick={() => handleApprove(app._id)}
                                                className="flex-1 px-4 py-3 bg-nexus-green hover:bg-green-400 text-black font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Icon icon="mdi:check-decagram" className="text-xl" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(app._id)}
                                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-white/10 hover:border-red-500/30 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Icon icon="mdi:close-circle-outline" className="text-xl" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
