import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';

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

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader text="Loading Applications..." /></div>
            ) : applications.length === 0 ? (
                <p className="text-center text-gray-500 py-20">No applications found.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {applications.map((app) => (
                        <motion.div
                            key={app._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-nexus-card bg-nexus-card/30 rounded-xl p-6 backdrop-blur-sm"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar / Img */}
                                <div className="shrink-0">
                                    <img
                                        src={app.profile_picture_url || '/Icons/M Null Nexon.png'}
                                        alt={app.full_name}
                                        className="w-20 h-20 rounded-full object-cover bg-black"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{app.full_name}</h3>
                                            <p className="text-nexus-green text-sm">{app.specialization}</p>
                                            <p className="text-gray-500 text-xs">{app.email} • {app.phone}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                            app.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-gray-300 text-sm line-clamp-3 md:line-clamp-none">{app.bio}</p>

                                    <div className="mt-6 flex items-center gap-4">
                                        {app.status === 'pending' && (
                                            <>
                                                <Button onClick={() => handleApprove(app._id)} variant="primary" size="sm">
                                                    <Icon icon="mdi:check" className="mr-1" /> Approve
                                                </Button>
                                                <Button onClick={() => handleReject(app._id)} variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                                                    <Icon icon="mdi:close" className="mr-1" /> Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
