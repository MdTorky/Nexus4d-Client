import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Icon } from '@iconify/react';

type TutorApplication = {
    _id: string;
    full_name: string;
    email: string;
    specialization: string;
    bio: string;
    profile_picture_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
};

interface Course {
    _id: string;
    title: string;
    thumbnail_url: string;
    status: 'ongoing' | 'complete';
    enrolled_students: number;
}

export default function AdminDashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'applications' | 'courses'>('applications');
    const [applications, setApplications] = useState<TutorApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'applications') {
            fetchApplications();
        }
    }, [activeTab]);

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

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex h-screen items-center justify-center bg-nexus-black text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">403 Forbidden</h1>
                    <p>Access Restricted to Admins Only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nexus-black px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-nexus-white">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'applications' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'courses' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Course Manager
                        </button>
                    </div>
                </div>

                {activeTab === 'applications' && (
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
                                                        <p className="text-gray-500 text-xs">{app.email}</p>
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
                )}

                {activeTab === 'courses' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Course Manager</h2>
                            <Link
                                to="/admin/courses/create"
                                className="flex items-center gap-2 bg-nexus-green text-black px-4 py-2 rounded-lg font-bold hover:bg-nexus-green/90 transition-colors"
                            >
                                <Icon icon="mdi:plus" /> Create Course
                            </Link>
                        </div>

                        <CourseList />
                    </div>
                )}
            </div>
        </div>
    );
}

function CourseList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <Loader text="Loading Courses..." />;

    if (courses.length === 0) {
        return (
            <div className="text-center py-16 bg-nexus-card/30 rounded-xl border border-dashed border-gray-700">
                <p className="text-gray-500">No courses available.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
                <div key={course._id} className="group relative bg-nexus-card rounded-xl overflow-hidden border border-white/5">
                    <div className="aspect-video w-full overflow-hidden bg-gray-800">
                        <img
                            src={course.thumbnail_url || '/placeholder_course.jpg'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded ${course.status === 'complete' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                {course.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-white/5 pt-3">
                            <span>{course.enrolled_students} Students</span>
                            <Link
                                to={`/admin/courses/${course._id}/edit`}
                                className="flex items-center gap-1 text-nexus-green hover:underline"
                            >
                                Manage <Icon icon="mdi:cog" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
