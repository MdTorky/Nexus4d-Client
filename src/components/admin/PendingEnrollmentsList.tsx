import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';

interface PendingEnrollment {
    _id: string;
    user_id: {
        _id: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    course_id: {
        _id: string;
        title: string;
        price: number;
    };
    package: 'basic' | 'advanced' | 'premium';
    amount_paid: number;
    receipt_url: string;
    status: string;
    createdAt: string;
}

export default function PendingEnrollmentsList() {
    const [enrollments, setEnrollments] = useState<PendingEnrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            // Based on course.routes.ts: router.get('/enrollments/pending', ...)
            // Assuming mounted at /api/courses
            const { data } = await api.get('/courses/enrollments/pending');
            setEnrollments(data);
        } catch (error: any) {
            console.error("Failed to fetch enrollments", error);
            showToast('Failed to load pending enrollments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessing(id);
        try {
            await api.post(`/courses/enrollments/${id}/approve`);
            showToast('Enrollment approved!', 'success');
            setEnrollments(prev => prev.filter(e => e._id !== id));
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to approve', 'error');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Enter rejection reason:", "Payment verification failed");
        if (reason === null) return; // Cancelled

        setProcessing(id);
        try {
            await api.post(`/courses/enrollments/${id}/reject`, { reason });
            showToast('Enrollment rejected', 'info');
            setEnrollments(prev => prev.filter(e => e._id !== id));
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to reject', 'error');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <Loader text="Loading Requests..." />;

    if (enrollments.length === 0) {
        return (
            <div className="text-center py-20 bg-nexus-card/30 rounded-xl border border-dashed border-gray-700">
                <Icon icon="mdi:clipboard-check-outline" className="text-gray-600 text-6xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending enrollment requests.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {enrollments.map((enrollment) => (
                <motion.div
                    key={enrollment._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-nexus-card border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Receipt Preview (Left) */}
                    <div className="w-full md:w-48 bg-black flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 group relative cursor-pointer" onClick={() => window.open(enrollment.receipt_url, '_blank')}>
                        {enrollment.receipt_url ? (
                            <img
                                src={enrollment.receipt_url}
                                alt="Receipt"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="text-gray-500 text-xs text-center p-4">No Receipt</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon icon="mdi:eye" className="text-white text-2xl" />
                        </div>
                    </div>

                    {/* Details (Right) */}
                    <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-white">
                                    {enrollment.course_id?.title || 'Unknown Course'}
                                </h3>
                                <span className={`px-2 py-0.5 rounded textxs font-bold uppercase border ${enrollment.package === 'premium' ? 'border-purple-500 text-purple-400' :
                                    enrollment.package === 'advanced' ? 'border-nexus-green text-nexus-green' :
                                        'border-gray-500 text-gray-400'
                                    }`}>
                                    {enrollment.package}
                                </span>
                            </div>

                            <div className="text-sm text-gray-400">
                                <p className="flex items-center gap-2">
                                    <Icon icon="mdi:account" />
                                    {enrollment.user_id?.first_name} {enrollment.user_id?.last_name}
                                    <span className="text-gray-600">(@{enrollment.user_id?.username})</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Icon icon="mdi:email" /> {enrollment.user_id?.email}
                                </p>
                                <p className="flex items-center gap-2 mt-1 text-white font-mono">
                                    <Icon icon="mdi:cash" className="text-green-500" />
                                    Paid: RM {enrollment.amount_paid}
                                </p>
                            </div>

                            <p className="text-xs text-gray-600">
                                Submitted: {new Date(enrollment.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 self-end md:self-center">
                            <Button
                                onClick={() => handleApprove(enrollment._id)}
                                variant="primary"
                                disabled={processing === enrollment._id}
                                className="bg-green-600 hover:bg-green-500 border-none shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                            >
                                {processing === enrollment._id ? (
                                    <Icon icon="mdi:loading" className="animate-spin mr-2" />
                                ) : (
                                    <Icon icon="mdi:check-circle" className="mr-2" />
                                )}
                                {processing === enrollment._id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                                onClick={() => handleReject(enrollment._id)}
                                variant="outline"
                                disabled={processing === enrollment._id}
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                            >
                                {processing === enrollment._id ? (
                                    <Icon icon="mdi:loading" className="animate-spin mr-2" />
                                ) : (
                                    <Icon icon="mdi:close-circle" className="mr-2" />
                                )}
                                {processing === enrollment._id ? 'Processing...' : 'Reject'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
